import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { expect, test, vi } from 'vitest';
import { AutoResizer } from '../..';

test('measures the content box, masks disabled axes and disconnects', async () => {
  let deliver: ResizeObserverCallback;
  const disconnect = vi.fn();
  class Observer {
    constructor(callback: ResizeObserverCallback) { deliver = callback; }
    observe() {}
    disconnect = disconnect;
  }
  vi.stubGlobal('ResizeObserver', Observer);
  try {
    const wrapper = mount(AutoResizer, {
      props: { disableWidth: true },
      slots: { default: ({ width, height }) => h('span', `${width}:${height}`) }
    });
    expect(wrapper.text()).toBe('0:0');
    deliver!([{ contentRect: { width: 240, height: 80 } } as ResizeObserverEntry], {} as ResizeObserver);
    await nextTick();
    expect(wrapper.text()).toBe('0:80');
    expect(wrapper.emitted('resize')).toEqual([[{ width: 0, height: 80 }]]);
    wrapper.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  } finally { vi.unstubAllGlobals(); }
});
