import { mount } from '@vue/test-utils';
import { h, KeepAlive, nextTick, ref } from 'vue';
import { afterEach, describe, expect, test, vi } from 'vitest';
import Affix, { type AffixInstance } from '..';

const fakeRect = (top: number, left = 0, width = 120, height = 40) =>
  ({
    top,
    bottom: top + height,
    left,
    right: left + width,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({})
  }) as DOMRect;

let phTop = 200;
let phHeight = 40;
let spy: ReturnType<typeof vi.spyOn> | undefined;

const mockRects = () => {
  spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement
  ) {
    if (this.classList.contains('i-affix')) {
      return fakeRect(phTop, 10, 120, Number.parseFloat(this.style.height) || phHeight);
    }
    return fakeRect(phTop, 10, 120, 40);
  });
};

const scroll = async () => {
  window.dispatchEvent(new Event('scroll'));
  await nextTick();
};

afterEach(() => {
  spy?.mockRestore();
  spy = undefined;
  phTop = 200;
  phHeight = 40;
  document.body.innerHTML = '';
});

describe('test `Affix` component', () => {
  test('滚动越过 offset-top 后固定并触发 change', async () => {
    mockRects();
    const wrapper = mount(Affix, {
      props: { offsetTop: 20 },
      slots: { default: () => '固定内容' },
      attachTo: document.body
    });
    await nextTick();
    expect(wrapper.find('.is-fixed').exists()).toBe(false);

    phTop = -10;
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    const style = (wrapper.find('.i-affix__content').attributes('style') ?? '') as string;
    expect(style).toContain('position: fixed');
    expect(style).toContain('top: 20px');
    expect(style).toContain('left: 10px');
    expect(style).toContain('width: 120px');
    expect(wrapper.emitted('change')).toEqual([[true]]);
    wrapper.unmount();
  });

  test('position=bottom 与 offsetBottom 固定在底部', async () => {
    mockRects();
    phTop = 740; // bottom 780 超过视口底(768) - offsetBottom(30)
    const wrapper = mount(Affix, {
      props: { position: 'bottom', offsetBottom: 30 },
      slots: { default: () => '底部内容' },
      attachTo: document.body
    });
    await nextTick();
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    expect(wrapper.find('.i-affix__content').attributes('style')).toContain('bottom: 30px');
    wrapper.unmount();
  });

  test('未越过阈值时恢复静态定位并可手动 update', async () => {
    mockRects();
    const wrapper = mount(Affix, {
      props: { offsetTop: 0 },
      slots: { default: () => '内容' },
      attachTo: document.body
    });
    await nextTick();
    phTop = -5;
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    phTop = 100;
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(false);
    expect(wrapper.emitted('change')).toEqual([[true], [false]]);

    phTop = -5;
    wrapper.vm.update();
    await nextTick();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    wrapper.unmount();
  });

  test('异步恢复自然布局并以新高度和位置更新固定状态', async () => {
    mockRects();
    phTop = -10;
    const wrapper = mount(Affix, { attachTo: document.body });
    await nextTick();
    await nextTick();
    const root = wrapper.element as HTMLElement;
    expect(root.style.height).toBe('40px');
    phHeight = 64;
    await wrapper.vm.updateRoot();
    expect(root.style.height).toBe('64px');
    expect(wrapper.emitted('change')).toEqual([[true]]);
    phTop = 100;
    await wrapper.vm.updateRoot();
    expect(root.style.height).toBe('');
    expect(wrapper.emitted('change')).toEqual([[true], [false]]);
    wrapper.unmount();
  });

  test('同批声明的后置传送宿主在固定时接收原内容节点', async () => {
    mockRects();
    const mounted = vi.fn();
    const errorHandler = vi.fn();
    const wrapper = mount({
      setup: () => () => h('main', [
        h(Affix, { teleported: true, appendTo: '#late-affix-host' }, () =>
          h('button', { id: 'late-affix-content', onVnodeMounted: mounted }, '固钉')
        ),
        h('div', { id: 'late-affix-host' })
      ])
    }, { attachTo: document.body, global: { config: { errorHandler } } });
    const node = wrapper.get('#late-affix-content').element;
    phTop = -10;
    await scroll();
    expect(wrapper.get('#late-affix-host').element.contains(node)).toBe(true);
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(errorHandler).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  test('原位开始异步测量时同步 update 不会锁定旧布局', async () => {
    mockRects();
    const labelHeight = ref(30);
    const wrapper = mount(Affix, {
      attachTo: document.body,
      slots: { default: () => h('div', { style: { height: `${labelHeight.value}px` } }) }
    });
    const root = wrapper.element as HTMLElement;
    vi.spyOn(root, 'getBoundingClientRect').mockImplementation(() => {
      const slot = root.querySelector<HTMLElement>('.i-affix__content > div');
      return fakeRect(phTop, 10, 120, Number.parseFloat(root.style.height || slot?.style.height || '0'));
    });
    phTop = -10;
    labelHeight.value = 64;
    const pending = wrapper.vm.updateRoot();
    wrapper.vm.update();
    await pending;
    expect(root.style.height).toBe('64px');
    expect(wrapper.emitted('change')).toEqual([[true]]);
    wrapper.unmount();
  });

  test('卸载活动的 KeepAlive 时不触发固定状态事件', async () => {
    mockRects();
    phTop = -10;
    const change = vi.fn();
    const affix = ref<AffixInstance>();
    const wrapper = mount({
      setup: () => () => h(KeepAlive, null, {
        default: () => h(Affix, { ref: affix, onChange: change })
      })
    }, { attachTo: document.body });
    await nextTick();
    expect(change).toHaveBeenCalledWith(true);
    change.mockClear();
    const pending = affix.value!.updateRoot();
    wrapper.unmount();
    await pending;
    expect(change).not.toHaveBeenCalled();
  });

  test('offset 属性对 top/bottom 均生效', async () => {
    mockRects();
    const wrapper = mount(Affix, {
      props: { offset: 35 },
      slots: { default: () => '内容' },
      attachTo: document.body
    });
    await nextTick();
    phTop = 30; // top 30 < offset 35，应固定
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    expect(wrapper.find('.i-affix__content').attributes('style')).toContain('top: 35px');
    phTop = 50;
    await scroll();
    expect(wrapper.find('.is-fixed').exists()).toBe(false);
    wrapper.unmount();

    const bottom = mount(Affix, {
      props: { position: 'bottom', offset: 30 },
      slots: { default: () => '内容' },
      attachTo: document.body
    });
    phTop = 740; // bottom 780 > 视口底(768) - 30
    await nextTick();
    await scroll();
    expect(bottom.find('.is-fixed').exists()).toBe(true);
    expect(bottom.find('.i-affix__content').attributes('style')).toContain('bottom: 30px');
    bottom.unmount();
  });

  test('target-container 容器滚动触发更新并发出 scroll 事件', async () => {
    mockRects();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const wrapper = mount(Affix, {
      props: { offset: 20, targetContainer: container },
      slots: { default: () => '内容' },
      attachTo: document.body
    });
    await nextTick();
    expect(wrapper.find('.is-fixed').exists()).toBe(false);
    phTop = 10;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.find('.is-fixed').exists()).toBe(true);
    const scrollEvents = wrapper.emitted('scroll');
    expect(scrollEvents?.at(-1)).toEqual([{ scrollTop: 0, fixed: true }]);
    wrapper.unmount();
  });
});
