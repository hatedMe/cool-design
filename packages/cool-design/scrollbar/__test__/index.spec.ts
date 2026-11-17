import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
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
