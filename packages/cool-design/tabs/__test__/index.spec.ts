import { Fragment, h, nextTick, onUnmounted, ref, watchEffect } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import Tabs from '../index';
import TabPane from '../tab-pane';

describe('Tabs', () => {
  test('在无键 Fragment 前增删独立页签后保留已访问的懒面板实例', async () => {
    const showPrefix = ref(false);
    const active = ref('a');
    const mounted: string[] = [];
    const unmounted: string[] = [];
    const Counter = {
      props: { name: { type: String, required: true } },
      setup(props: { name: string }) {
        const count = ref(0);
        const name = props.name;
        mounted.push(name);
        onUnmounted(() => unmounted.push(name));
        return () => h('button', { onClick: () => { count.value++; } }, `${name}:${count.value}`);
      }
    };
    const pane = (name: string) =>
      h(TabPane, { name, key: name, label: name, lazy: true }, () => h(Counter, { name }));
    const wrapper = mount({
      render: () => h(Tabs, { modelValue: active.value }, {
        default: () => [
          ...(showPrefix.value ? [pane('prefix'), h(Fragment, { key: 'prefix-group' }, [pane('group')])] : []),
          h(Fragment, null, [h(Fragment, null, [pane('a'), pane('b'), pane('c')])])
        ]
      })
    });
    const a = wrapper.get('#i-tabs-panel-a');
    const aTab = wrapper.get('[data-tabs-tab="a"]').element;
    await a.get('button').trigger('click');
    active.value = 'b';
    await nextTick();
    const b = wrapper.get('#i-tabs-panel-b');
    active.value = 'a';
    await nextTick();

    for (const visible of [true, false]) {
      showPrefix.value = visible;
      await nextTick();
      expect(wrapper.find('[data-tabs-tab="prefix"]').exists()).toBe(visible);
      expect(wrapper.find('[data-tabs-tab="group"]').exists()).toBe(visible);
      expect(wrapper.get('[data-tabs-tab="a"]').element).toBe(aTab);
      expect(wrapper.get('#i-tabs-panel-a').element).toBe(a.element);
      expect(wrapper.get('#i-tabs-panel-a').text()).toBe('a:1');
      expect(wrapper.get('#i-tabs-panel-b').element).toBe(b.element);
      expect(wrapper.find('#i-tabs-panel-c').exists()).toBe(false);
      expect(mounted).toEqual(['a', 'b']);
      expect(unmounted).toEqual([]);
    }
    wrapper.unmount();
    expect(unmounted).toEqual(['a', 'b']);
  });

  test('多层 Fragment 中相同的局部键各自保留面板实例和懒挂载状态', async () => {
    const names = ref(['a', 'b', 'c']);
    const groups = new Map(names.value.map((name) => [name, Symbol('group')]));
    const mounted: string[] = [];
    const unmounted: string[] = [];
    const warnings: string[] = [];
    const Content = {
      props: { name: { type: String, required: true } },
      setup(props: { name: string }) {
        const name = props.name;
        mounted.push(name);
        onUnmounted(() => unmounted.push(name));
        return () => h('span', name);
      }
    };
    const wrapper = mount({
      render: () => h(Tabs, { defaultValue: 'a' }, {
        default: () => names.value.map((name) => h(Fragment, { key: groups.get(name) }, [
          h(Fragment, { key: 'inner' }, [
            h(TabPane, { name, key: 'leaf', label: name, lazy: true }, () => h(Content, { name }))
          ])
        ]))
      })
    }, { global: { config: { warnHandler: (message) => warnings.push(message) } } });
    const first = wrapper.get('#i-tabs-panel-a').element;
    const firstTab = wrapper.get('[data-tabs-tab="a"]').element;
    expect(mounted).toEqual(['a']);

    names.value = ['c', 'b', 'a'];
    await nextTick();
    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual(['c', 'b', 'a']);
    expect(wrapper.get('[data-tabs-tab="a"]').element).toBe(firstTab);
    expect(wrapper.get('#i-tabs-panel-a').element).toBe(first);
    expect(mounted).toEqual(['a']);

    await wrapper.get('[data-tabs-tab="b"]').trigger('click');
    await wrapper.get('[data-tabs-tab="a"]').trigger('click');
    expect(mounted).toEqual(['a', 'b']);
    names.value = ['c', 'a'];
    await nextTick();
    expect(wrapper.get('#i-tabs-panel-a').element).toBe(first);
    expect(wrapper.get('#i-tabs-panel-a').text()).toBe('a');
    expect(unmounted).toEqual(['b']);

    names.value = ['b', 'a', 'c'];
    await nextTick();
    expect(wrapper.find('#i-tabs-panel-b').exists()).toBe(false);
    expect(mounted).toEqual(['a', 'b']);
    expect(warnings).toEqual([]);
    wrapper.unmount();
  });

  test('键盘切换事件同步重排后聚焦仍存在的目标页签', async () => {
    const names = ref(['a', 'b', 'c']);
    const wrapper = mount({
      render: () => h(Tabs, {
        defaultValue: 'a',
        'onTab-change': () => { names.value = ['b', 'a', 'c']; }
      }, { default: () => names.value.map((name) => h(TabPane, { key: name, name, label: name })) })
    }, { attachTo: document.body });
    const target = wrapper.get('[data-tabs-tab="b"]').element;
    try {
      await wrapper.get('[data-tabs-tab="a"]').trigger('keydown', { key: 'ArrowRight' });
      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(wrapper.get('[aria-selected="true"]').element).toBe(target);
      expect(document.activeElement).toBe(target);
    } finally {
      wrapper.unmount();
    }
  });

  test.each(['modelValue', 'defaultValue'] as const)('panes 的空字符串 %s 回退到首个可用页签', (prop) => {
    const tabs = ref<InstanceType<typeof Tabs>>();
    const wrapper = mount({
      render: () => h(Tabs, {
        ref: tabs,
        [prop]: '',
        panes: [{ name: 'a', label: 'A', disabled: true }, { name: 'b', label: 'B' }]
      }, { default: ({ name }: { name: string | number }) => String(name) })
    });
    expect(tabs.value?.currentName).toBe('b');
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('B');
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('b');
  });

  test('声明式空字符串名称可选中，改动同一名称的键会更换面板实例', async () => {
    const key = ref('first');
    const wrapper = mount({
      render: () => h(Tabs, { defaultValue: '' }, {
        default: () => [h(TabPane, { label: '索引' }), h(TabPane, { key: key.value, name: '', label: '空字符串' })]
      })
    });
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('空字符串');
    const initial = wrapper.get('#i-tabs-panel-').element;
    key.value = 'updated';
    await nextTick();
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('空字符串');
    expect(wrapper.get('#i-tabs-panel-').element).not.toBe(initial);
  });

  test('在渲染中读取动态 Fragment 与 TabPane 插槽', async () => {
    const names = ref(['a', 'b']);
    const custom = ref(false);
    const label = ref('标题');
    const content = ref('内容');
    const warnings: string[] = [];
    const renderTabs = vi.fn(() => h(Fragment, names.value.map((name) =>
      h(TabPane, { key: name, name, label: name, lazy: name === 'b' }, {
        ...(custom.value && { label: () => `${label.value}-${name}` }),
        default: () => `${content.value}-${name}`
      })
    )));
    const wrapper = mount({
      render: () => h(Tabs, { defaultValue: 'a' }, { default: renderTabs })
    }, { global: { config: { warnHandler: (message) => warnings.push(message) } } });
    const tabs = () => wrapper.findAll('[role="tab"]').map((tab) => tab.text());
    expect(warnings).toEqual([]);
    expect(renderTabs).toHaveBeenCalledTimes(1);
    expect(tabs()).toEqual(['a', 'b']);
    expect(wrapper.text()).not.toContain('内容-b');

    custom.value = true;
    names.value = ['b', 'a', 'c'];
    await nextTick();
    expect(tabs()).toEqual(['标题-b', '标题-a', '标题-c']);
    await wrapper.get('[data-tabs-tab="b"]').trigger('click');
    expect(wrapper.get('#i-tabs-panel-b').attributes('hidden')).toBeUndefined();
    await wrapper.get('[data-tabs-tab="a"]').trigger('click');
    expect(wrapper.get('#i-tabs-panel-b').attributes('hidden')).toBeDefined();

    names.value = ['c', 'a'];
    label.value = '更新标题';
    content.value = '更新内容';
    await nextTick();
    expect(tabs()).toEqual(['更新标题-c', '更新标题-a']);
    expect(wrapper.get('#i-tabs-panel-a').text()).toBe('更新内容-a');
    expect(wrapper.find('#i-tabs-panel-b').exists()).toBe(false);

    custom.value = false;
    names.value = ['c', 'b', 'a'];
    await nextTick();
    expect(tabs()).toEqual(['c', 'b', 'a']);
    expect(wrapper.find('#i-tabs-panel-b').exists()).toBe(false);
    expect(warnings).toEqual([]);
    wrapper.unmount();
  });

  test('响应式公开当前页签与可操作的真实导航元素', async () => {
    const instance = ref<InstanceType<typeof Tabs>>();
    const model = ref<string | number>();
    const observed: (string | number | undefined)[] = [];
    const wrapper = mount({
      setup() {
        watchEffect(() => observed.push(instance.value?.currentName));
        return () => h(Tabs, { ref: instance, modelValue: model.value }, {
          default: () => [h(TabPane, { label: '一' }, () => 'A'), h(TabPane, { label: '二' }, () => 'B')]
        });
      }
    }, { attachTo: document.body });
    const tabs = instance.value!;
    expect(tabs.currentName).toBe('0');
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('一');

    const nav = tabs.tabNavRef!;
    expect(nav.tabListRef).toBe(wrapper.get('[role="tablist"]').element);
    expect(nav.tabBarRef?.ref).toBe(wrapper.get('.i-tabs__active-bar').element);
    await nextTick();
    await tabs.setActive('1');
    await nav.focusActiveTab();
    expect(tabs.currentName).toBe('1');
    expect(observed).toEqual([undefined, '0', '1']);
    expect(document.activeElement).toBe(wrapper.get('[data-tabs-tab="1"]').element);
    expect(wrapper.get('[data-tabs-tab="1"]').classes()).toContain('is-focus');
    expect(nav.removeFocus()).toBe(false);
    await nextTick();
    expect(wrapper.get('[data-tabs-tab="1"]').classes()).not.toContain('is-focus');

    model.value = '0';
    await nextTick();
    expect(tabs.currentName).toBe('0');
    expect(observed.at(-1)).toBe('0');
    wrapper.unmount();
  });

  test('异步拒绝保留当前项，异步通过后按原顺序发送切换事件', async () => {
    let decide: ((result: boolean | void) => void) | undefined;
    const beforeLeave = vi.fn()
      .mockReturnValueOnce(false)
      .mockRejectedValueOnce(new Error('阻止切换'))
      .mockImplementationOnce(() => new Promise<boolean | void>((resolve) => { decide = resolve; }));
    const order: string[] = [];
    const wrapper = mount(Tabs, {
      props: {
        defaultValue: 0,
        panes: [{ name: 0, label: 'A' }, { name: 1, label: 'B' }],
        beforeLeave,
        'onUpdate:modelValue': () => order.push('update'),
        onTabClick: () => order.push('click'),
        onTabChange: () => order.push('change')
      }
    });
    const second = wrapper.get('[data-tabs-tab="1"]');
    await second.trigger('click');
    await second.trigger('click');
    await flushPromises();
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('A');
    expect(order).toEqual([]);

    await second.trigger('click');
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('A');
    expect(order).toEqual([]);
    expect(beforeLeave).toHaveBeenLastCalledWith(1, 0);
    decide?.(undefined);
    await flushPromises();
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('B');
    expect(order).toEqual(['update', 'click', 'change']);
  });

  test('受控切换触发事件', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'first', panes: [{ name: 'first', label: '一' }, { name: 'second', label: '二' }] }
    });
    const items = wrapper.findAll('[role="tab"]');
    expect(items[0].attributes('aria-selected')).toBe('true');
    await items[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['second']);
    expect(wrapper.emitted('tab-click')?.[0]?.[0]).toMatchObject({ name: 'second' });
    expect(wrapper.emitted('tab-change')?.[0]).toEqual(['second']);
    expect(items[0].attributes('aria-selected')).toBe('true');
    expect(items[1].attributes('aria-selected')).toBe('false');
    await wrapper.setProps({ modelValue: 'second' });
    expect(items[1].attributes('aria-selected')).toBe('true');
    expect(wrapper.emitted('tab-change')).toHaveLength(1);
  });

  test('保留 panes 的默认插槽参数与初始值优先级', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 0, defaultValue: 'b', panes: [{ name: 0, label: 'A' }, { name: 'b', label: 'B' }] },
      slots: { default: ({ name }: { name: string | number }) => `面板 ${name}` }
    });
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('面板 0');
    await wrapper.setProps({ modelValue: 'b' });
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('面板 b');
    await wrapper.setProps({ panes: [] });
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('面板 b');
  });

  test('禁用页签不可切换', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'first', panes: [{ name: 'first', label: '一' }, { name: 'second', label: '二', disabled: true }] }
    });
    await wrapper.findAll('[role="tab"]')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  test('beforeLeave 异步拦截', async () => {
    const beforeLeave = vi.fn(async () => false);
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'first',
        panes: [{ name: 'first', label: '一' }, { name: 'second', label: '二' }],
        beforeLeave
      }
    });
    await wrapper.findAll('[role="tab"]')[1].trigger('click');
    // 等待异步 beforeLeave
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(beforeLeave).toHaveBeenCalledWith('second', 'first');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  test('插槽 TabPane 支持懒渲染与关闭', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'a', closable: true },
      slots: {
        default: () => [
          h(TabPane, { name: 'a', label: 'A' }, () => '内容A'),
          h(TabPane, { name: 'b', label: 'B', lazy: true }, () => '内容B')
        ]
      }
    });
    // 懒加载未访问时不渲染
    expect(wrapper.text()).toContain('内容A');
    expect(wrapper.text()).not.toContain('内容B');
    await wrapper.findAll('.i-tabs__close')[0].trigger('click');
    expect(wrapper.emitted('tab-remove')?.[0]).toEqual(['a']);
    expect(wrapper.emitted('edit')?.[0]).toEqual(['a', 'remove']);
  });

  test('addable 触发新增', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'a', panes: [{ name: 'a', label: 'A' }], addable: true }
    });
    await wrapper.find('.i-tabs__add').trigger('click');
    expect(wrapper.emitted('tab-add')).toHaveLength(1);
    expect(wrapper.emitted('edit')?.[0]).toEqual([null, 'add']);
  });

  test('未提供 modelValue 时默认首个可用', () => {
    const wrapper = mount(Tabs, {
      props: { panes: [{ name: 'x', label: 'X', disabled: true }, { name: 'y', label: 'Y' }] }
    });
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true');
  });

  test('tabPosition 为 bottom/right 时内容在 DOM 前面', () => {
    const order = (position: 'top' | 'right' | 'bottom' | 'left') => {
      const wrapper = mount(Tabs, {
        props: {
          panes: [{ name: 'first', label: '一' }, { name: 'second', label: '二' }],
          tabPosition: position
        }
      });
      const children = wrapper.element.children;
      const firstClass = children[0]?.className ?? '';
      return firstClass.includes('i-tabs__header') ? 'header' : 'content';
    };
    expect(order('top')).toBe('header');
    expect(order('left')).toBe('header');
    expect(order('bottom')).toBe('content');
    expect(order('right')).toBe('content');
  });

  test('键盘导航只在当前 Tabs 实例内聚焦页签', async () => {
    const makePanes = () => [{ name: 'first', label: '一' }, { name: 'second', label: '二' }];
    const wrapper = mount(
      {
        components: { Tabs },
        template: `<div>
          <Tabs id="tabs-a" ref="a" :panes="panes" modelValue="first" />
          <Tabs id="tabs-b" ref="b" :panes="panes" modelValue="first" />
        </div>`,
        setup: () => ({ panes: makePanes() })
      },
      { attachTo: document.body }
    );
    const tab = wrapper.findAll('#tabs-b [role="tab"]')[0];
    await tab.trigger('keydown', { key: 'ArrowRight' });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(wrapper.findAll('#tabs-b [role="tab"]')[1].element);
    // tabs-a 的页签没有被聚焦或切换
    expect(wrapper.findAll('#tabs-a [role="tab"]')[1].attributes('aria-selected')).not.toBe('true');
    wrapper.unmount();
  });

  test('add-icon 插槽自定义新增按钮', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: 'a', addable: true, panes: [{ name: 'a', label: 'A' }] },
      slots: { 'add-icon': () => '加个页签' }
    });
    expect(wrapper.get('.i-tabs__add').text()).toBe('加个页签');
    await wrapper.get('.i-tabs__add').trigger('click');
    expect(wrapper.emitted('tab-add')).toHaveLength(1);
    expect(wrapper.emitted('edit')?.[0]).toEqual([null, 'add']);
  });

  test('页签溢出时显示滚动箭头并随边界禁用', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: '0',
        panes: Array.from({ length: 6 }, (_, index) => ({ name: String(index), label: `页签${index}` }))
      }
    });
    expect(wrapper.find('.i-tabs__nav-prev').exists()).toBe(false);
    const scroll = wrapper.get('.i-tabs__nav-scroll').element as HTMLElement;

    // 模拟溢出：内容宽 400、视口宽 200。
    Object.defineProperty(scroll, 'scrollWidth', { configurable: true, value: 400 });
    Object.defineProperty(scroll, 'clientWidth', { configurable: true, value: 200 });
    Object.defineProperty(scroll, 'scrollLeft', { configurable: true, writable: true, value: 0 });
    scroll.dispatchEvent(new Event('scroll'));
    await nextTick();
    const prev = wrapper.get('.i-tabs__nav-prev');
    const next = wrapper.get('.i-tabs__nav-next');
    expect(prev.attributes('disabled')).toBeDefined();
    expect(next.attributes('disabled')).toBeUndefined();

    await next.trigger('click');
    // 每次滚动视口的 60%。
    expect(scroll.scrollLeft).toBe(120);
    expect(prev.attributes('disabled')).toBeUndefined();

    scroll.scrollLeft = 200;
    scroll.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.get('.i-tabs__nav-next').attributes('disabled')).toBeDefined();
  });
});
