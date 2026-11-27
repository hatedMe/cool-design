import { defineComponent, h, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { DOMWrapper, mount } from '@vue/test-utils';
import { afterEach, expect, test, vi } from 'vitest';
import { Menu, MenuItem, SubMenu } from '..';

const popup = (name: string) => new DOMWrapper(document.body).find<HTMLElement>(`.${name}`);
const icon = (text: string) => () => h('span', text);

afterEach(() => {
  vi.useRealTimers();
});

test('水平浮层把继承的字符串样式和更新后的数组样式应用到面板，显式 false 清除继承', async () => {
  const submenuStyle = ref<string | (string | { minWidth: string })[] | false>();
  const wrapper = mount(Menu, {
    attachTo: document.body,
    props: { mode: 'horizontal', menuTrigger: 'click', popperClass: 'style-popup', popperStyle: 'min-width: 220px' },
    slots: {
      default: () => h(SubMenu, { index: 'a', popperStyle: submenuStyle.value }, {
        title: () => '甲',
        default: () => h(MenuItem, { index: 'item' }, () => '叶')
      })
    }
  });
  try {
    await wrapper.get('button').trigger('click');
    const panel = popup('style-popup').get('ul').element.closest<HTMLElement>('.style-popup');
    expect(panel?.style.minWidth).toBe('220px');
    expect(wrapper.get('button').element.style.minWidth).toBe('');
    submenuStyle.value = ['padding: 3px', { minWidth: '250px' }];
    await nextTick();
    expect(panel?.style.minWidth).toBe('250px');
    expect(panel?.style.padding).toBe('3px');
    submenuStyle.value = false;
    await nextTick();
    expect(panel?.style.minWidth).toBe('');
    expect(panel?.style.padding).toBe('');
  } finally {
    wrapper.unmount();
  }
});

test.each(['仅重开父级', '鼠标重新进入子级', '显式打开子级'])('%s 时按子级交互决定是否取消关闭', async (interaction) => {
  vi.useFakeTimers();
  const wrapper = mount(Menu, {
    attachTo: document.body,
    props: { mode: 'horizontal', defaultOpeneds: ['a', 'b'], hideTimeout: 300, popperClass: 'parent-hide' },
    slots: {
      default: () => h(SubMenu, { index: 'a' }, {
        title: () => '甲',
        default: () => h(SubMenu, { index: 'b', teleported: true, popperClass: 'child-hide', hideTimeout: 700 }, {
          title: () => '乙',
          default: () => h(MenuItem, { index: 'leaf' }, () => '叶')
        })
      })
    }
  });
  try {
    await nextTick();
    await popup('child-hide').trigger('mouseleave', { relatedTarget: document.body });
    vi.advanceTimersByTime(300);
    await nextTick();
    expect(wrapper.emitted('close')).toEqual([['a', ['a']]]);
    wrapper.vm.open('a');
    await nextTick();
    expect(popup('parent-hide').attributes('aria-hidden')).toBeUndefined();
    expect(popup('child-hide').attributes('aria-hidden')).toBeUndefined();
    if (interaction === '鼠标重新进入子级') await popup('child-hide').trigger('mouseenter');
    if (interaction === '显式打开子级') wrapper.vm.open('b');
    vi.advanceTimersByTime(400);
    await nextTick();
    if (interaction === '仅重开父级') {
      expect(wrapper.emitted('close')).toEqual([['a', ['a']], ['b', ['a', 'b']]]);
      expect(popup('child-hide').attributes('aria-hidden')).toBe('true');
    } else {
      expect(wrapper.emitted('close')).toEqual([['a', ['a']]]);
      expect(popup('child-hide').attributes('aria-hidden')).toBeUndefined();
    }
  } finally {
    wrapper.unmount();
    vi.useRealTimers();
  }
});

test.each(['等待关闭', '仅重开父级', '鼠标重新进入子级'])('父浮层离场卸载后%s，按子级交互处理关闭请求', async (interaction) => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
  let mounted = 0;
  let unmounted = 0;
  const Child = defineComponent({
    setup() {
      onMounted(() => mounted++);
      onUnmounted(() => unmounted++);
      return () => h(MenuItem, { index: 'leaf' }, () => '叶');
    }
  });
  const wrapper = mount(Menu, {
    attachTo: document.body,
    props: {
      mode: 'horizontal', defaultOpeneds: ['a', 'b'], hideTimeout: 20, popperClass: 'parent-lazy', persistent: false
    },
    global: { stubs: { transition: false } },
    slots: {
      default: () => h(SubMenu, { index: 'a' }, {
        title: () => '甲',
        default: () => h(SubMenu, { index: 'b', teleported: true, popperClass: 'child-lazy', hideTimeout: 500 }, {
          title: () => '乙',
          default: () => h(Child)
        })
      })
    }
  });
  try {
    await nextTick();
    await popup('child-lazy').trigger('mouseleave', { relatedTarget: document.body });
    await vi.advanceTimersByTimeAsync(20);
    // 推进离场的两帧，同时保持子级 500ms 关闭期限尚未到达。
    await vi.advanceTimersByTimeAsync(40);
    expect(popup('parent-lazy').exists()).toBe(false);
    expect([mounted, unmounted]).toEqual([1, 1]);
    expect(wrapper.emitted('close')).toEqual([['a', ['a']]]);
    if (interaction !== '等待关闭') {
      wrapper.vm.open('a');
      await nextTick();
      expect(popup('child-lazy').exists()).toBe(true);
    }
    if (interaction === '鼠标重新进入子级') {
      await popup('child-lazy').trigger('mouseenter');
      await vi.advanceTimersByTimeAsync(500);
      expect(wrapper.emitted('close')).toEqual([['a', ['a']]]);
      expect(popup('child-lazy').attributes('aria-hidden')).toBeUndefined();
      return;
    }

    await vi.advanceTimersByTimeAsync(439);
    expect(wrapper.emitted('close')).toEqual([['a', ['a']]]);
    await vi.advanceTimersByTimeAsync(1);
    expect(wrapper.emitted('close')).toEqual([['a', ['a']], ['b', ['a', 'b']]]);
    await vi.advanceTimersByTimeAsync(40);
    expect(popup('child-lazy').exists()).toBe(false);
    if (interaction === '等待关闭') {
      wrapper.vm.open('a');
      await nextTick();
      expect([mounted, unmounted]).toEqual([1, 1]);
    }
    expect(popup('parent-lazy').exists()).toBe(true);
    expect(popup('child-lazy').exists()).toBe(false);
  } finally {
    wrapper.unmount();
    vi.useRealTimers();
  }
});

test('传送面板随根主题更新，自定义面板样式优先', async () => {
  const customStyle = ref<string>();
  const wrapper = mount(Menu, {
    attachTo: document.body,
    props: {
      mode: 'horizontal', defaultOpeneds: ['a'], textColor: '#008000', backgroundColor: '#f8fafc',
      activeTextColor: '#f00', popperClass: 'theme-popup'
    },
    slots: {
      default: () => h(SubMenu, { index: 'a', popperStyle: customStyle.value }, {
        title: () => '甲',
        default: () => h(MenuItem, { index: 'leaf' }, () => '叶')
      })
    }
  });
  try {
    const { element: panel } = popup('theme-popup');
    expect(panel.closest('.i-menu')).toBeNull();
    expect(panel.style.color).toBe('rgb(0, 128, 0)');
    expect(panel.style.backgroundColor).toBe('rgb(248, 250, 252)');
    expect(panel.style.getPropertyValue('--i-menu-active-color')).toBe('#f00');
    await wrapper.setProps({ textColor: '#800080', backgroundColor: '#fff', activeTextColor: '#00f' });
    expect(panel.style.color).toBe('rgb(128, 0, 128)');
    expect(panel.style.getPropertyValue('--i-menu-active-color')).toBe('#00f');
    customStyle.value = 'color: #111; background-color: #eee; --i-menu-active-color: #444';
    await nextTick();
    expect(panel.style.color).toBe('rgb(17, 17, 17)');
    expect(panel.style.backgroundColor).toBe('rgb(238, 238, 238)');
    expect(panel.style.getPropertyValue('--i-menu-active-color')).toBe('#444');
  } finally {
    wrapper.unmount();
  }
});

test.each([true, false])('persistent=%s 控制首次挂载与每次关闭后的销毁', async (persistent) => {
  const calls: string[] = [];
  const Child = defineComponent({
    setup() {
      onMounted(() => calls.push('mount'));
      onUnmounted(() => calls.push('unmount'));
      return () => h(MenuItem, { index: 'leaf' }, () => '叶');
    }
  });
  const wrapper = mount(Menu, {
    attachTo: document.body,
    props: { collapse: true, persistent },
    global: { stubs: { transition: false } },
    slots: {
      default: () => h(SubMenu, { index: 'a' }, { title: () => '甲', default: () => h(Child) })
    }
  });
  try {
    expect(calls).toEqual(persistent ? ['mount'] : []);
    await wrapper.get('button').trigger('click');
    expect(calls).toEqual(['mount']);
    await wrapper.get('button').trigger('click');
    await vi.waitFor(() => expect(calls).toEqual(persistent ? ['mount'] : ['mount', 'unmount']));
    await wrapper.get('button').trigger('click');
    expect(calls).toEqual(persistent ? ['mount'] : ['mount', 'unmount', 'mount']);
  } finally {
    wrapper.unmount();
  }
});

test('同一子菜单按方向和折叠状态选取图标对，单边图标保留默认箭头', async () => {
  const wrapper = mount(Menu, {
    props: { menuTrigger: 'click' },
    slots: {
      default: () => h(SubMenu, {
        index: 'a',
        expandCloseIcon: icon('展开模式关闭'),
        expandOpenIcon: icon('展开模式打开'),
        collapseCloseIcon: icon('折叠模式关闭')
      }, { title: () => '甲' })
    }
  });
  try {
    const arrow = () => wrapper.get('.i-sub-menu__arrow').text();
    expect(arrow()).toBe('展开模式关闭');
    await wrapper.get('button').trigger('click');
    expect(arrow()).toBe('展开模式打开');
    await wrapper.setProps({ collapse: true });
    expect(arrow()).toBe('‹');
    await wrapper.setProps({ mode: 'horizontal' });
    expect(arrow()).toBe('展开模式关闭');
  } finally {
    wrapper.unmount();
  }
});
