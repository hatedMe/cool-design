import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { h, nextTick, ref } from 'vue';
import Scrollbar from '..';

const mockMetrics = (
  wrap: HTMLElement,
  bar: HTMLElement,
  { client = 100, scroll = 400, track = 200 }: { client?: number; scroll?: number; track?: number } = {}
) => {
  Object.defineProperty(wrap, 'clientHeight', { value: client, configurable: true });
  Object.defineProperty(wrap, 'clientWidth', { value: client, configurable: true });
  Object.defineProperty(wrap, 'scrollHeight', { value: scroll, configurable: true });
  Object.defineProperty(wrap, 'scrollWidth', { value: scroll, configurable: true });
  Object.defineProperty(bar, 'clientHeight', { value: track, configurable: true });
  Object.defineProperty(bar, 'clientWidth', { value: track, configurable: true });
};

describe('test `Scrollbar` component', () => {
  test('自绘和原生模式均将 tabindex 放在可聚焦的滚动容器上', async () => {
    const wrapper = mount(Scrollbar, {
      props: { tabindex: 0 },
      attachTo: document.body
    });
    const wrap = wrapper.get<HTMLElement>('.i-scrollbar__wrap');
    wrap.element.focus();
    expect(document.activeElement).toBe(wrap.element);
    expect(wrapper.attributes('tabindex')).toBeUndefined();
    await wrapper.setProps({ native: true, tabindex: '-1' });
    expect(wrap.attributes('tabindex')).toBe('-1');
    wrapper.unmount();
  });

  test('到达正阈值时在 scroll 后发出方向，反向离开后可再次触发', async () => {
    const events: unknown[] = [];
    const wrapper = mount(Scrollbar, {
      props: {
        distance: 30,
        onScroll: (position: { scrollTop: number; scrollLeft: number }) => events.push(position),
        onEndReached: (direction: string) => events.push(direction)
      }
    });
    const wrap = wrapper.get<HTMLElement>('.i-scrollbar__wrap');
    mockMetrics(wrap.element, wrapper.get<HTMLElement>('.i-scrollbar__bar.is-vertical').element);

    for (const top of [269, 270, 271, 200, 300]) {
      wrap.element.scrollTop = top;
      await wrap.trigger('scroll');
    }
    expect(events).toEqual([
      { scrollTop: 269, scrollLeft: 0 },
      { scrollTop: 270, scrollLeft: 0 }, 'bottom',
      { scrollTop: 271, scrollLeft: 0 },
      { scrollTop: 200, scrollLeft: 0 },
      { scrollTop: 300, scrollLeft: 0 }, 'bottom'
    ]);
    wrapper.unmount();
  });

  test.each([false, true])('内容溢出变大后可再次触发右缘事件（native=%s）', async (native) => {
    const width = ref(500);
    const wrapper = mount(Scrollbar, {
      props: { distance: 30, native, viewStyle: { width: '160px' } },
      slots: { default: () => h('div', { class: 'content', style: { width: `${width.value}px` } }) }
    });
    const wrap = wrapper.get<HTMLElement>('.i-scrollbar__wrap');
    Object.defineProperties(wrap.element, {
      clientWidth: { value: 160 },
      scrollWidth: { get: () => parseInt(wrapper.get<HTMLElement>('.content').element.style.width, 10) }
    });
    wrapper.vm.update();
    await nextTick();

    for (const left of [330, 331]) {
      wrap.element.scrollLeft = left;
      await wrap.trigger('scroll');
    }
    expect(wrapper.emitted('end-reached')).toEqual([['right']]);

    width.value = 560;
    await nextTick();
    wrap.element.scrollLeft = 390;
    await wrap.trigger('scroll');
    expect(wrapper.emitted('end-reached')).toEqual([['right'], ['right']]);
    wrapper.unmount();
  });

  test('高度样式作用于滚动容器并暴露滚动方法', async () => {
    const wrapper = mount(Scrollbar, {
      props: { height: '200px', maxHeight: 300 },
      slots: { default: () => '内容' }
    });
    const wrap = wrapper.find('.i-scrollbar__wrap').element as HTMLElement;
    expect(wrap.style.height).toBe('200px');
    expect(wrap.style.maxHeight).toBe('300px');

    const api = wrapper.vm as unknown as {
      setScrollTop: (top: number) => void;
      setScrollLeft: (left: number) => void;
      scrollTo: (x: number, y: number) => void;
    };
    api.setScrollTop(60);
    api.setScrollLeft(20);
    expect(wrap.scrollTop).toBe(60);
    expect(wrap.scrollLeft).toBe(20);
    api.scrollTo(0, 0);
    expect(wrap.scrollTop).toBe(0);
  });

  test('滚动时触发 scroll 事件并更新滑块位置', async () => {
    const wrapper = mount(Scrollbar, {
      props: { height: '200px' },
      slots: { default: () => '内容' }
    });
    const wrap = wrapper.find('.i-scrollbar__wrap').element as HTMLElement;
    const bar = wrapper.find('.i-scrollbar__bar.is-vertical').element as HTMLElement;
    mockMetrics(wrap, bar);
    const api = wrapper.vm as unknown as { update: () => void };
    api.update();
    await wrapper.vm.$nextTick();
    const thumb = wrapper.find('.i-scrollbar__thumb');
    expect(thumb.attributes('style')).toContain('height: 50px');

    wrap.scrollTop = 100;
    wrap.dispatchEvent(new Event('scroll'));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('scroll')).toEqual([[{ scrollTop: 100, scrollLeft: 0 }]]);
    expect(thumb.attributes('style')).toContain('translateY(50px)');
  });

  test('minSize 限制滑块最小长度，native 模式不渲染滑块', async () => {
    const wrapper = mount(Scrollbar, {
      props: { height: '200px', minSize: 20 },
      slots: { default: () => '内容' }
    });
    const wrap = wrapper.find('.i-scrollbar__wrap').element as HTMLElement;
    const bar = wrapper.find('.i-scrollbar__bar.is-vertical').element as HTMLElement;
    mockMetrics(wrap, bar, { client: 10, scroll: 1000, track: 200 });
    (wrapper.vm as unknown as { update: () => void }).update();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.i-scrollbar__thumb').attributes('style')).toContain('height: 20px');

    const native = mount(Scrollbar, {
      props: { native: true },
      slots: { default: () => '内容' }
    });
    expect(native.find('.i-scrollbar__bar').exists()).toBe(false);
  });

  test('拖拽滑块改变滚动位置', async () => {
    const wrapper = mount(Scrollbar, {
      props: { height: '200px' },
      slots: { default: () => '内容' },
      attachTo: document.body
    });
    const wrap = wrapper.find('.i-scrollbar__wrap').element as HTMLElement;
    const bar = wrapper.find('.i-scrollbar__bar.is-vertical').element as HTMLElement;
    mockMetrics(wrap, bar);
    (wrapper.vm as unknown as { update: () => void }).update();

    await wrapper.find('.i-scrollbar__thumb').trigger('mousedown', { clientY: 0 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 40 }));
    // scale = scrollHeight / track = 400 / 200 = 2 → 40 * 2 = 80
    expect(wrap.scrollTop).toBe(80);
    document.dispatchEvent(new MouseEvent('mouseup'));
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 100 }));
    expect(wrap.scrollTop).toBe(80);
    wrapper.unmount();
  });
});
