import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { expect, test, vi } from 'vitest';
import { AutoResizer } from '../..';
import ConfigProvider from '../../config-provider';

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
    const namespace = ref('acme');
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'outer' },
      slots: {
        default: () => h(ConfigProvider, { namespace: namespace.value }, {
          default: () => h(AutoResizer, { disableWidth: true, class: 'user-resizer' }, {
            default: ({ width, height }: { width: number; height: number }) => h('span', `${width}:${height}`)
          })
        })
      }
    });
    try {
      const resizer = wrapper.getComponent(AutoResizer);
      const root = resizer.element;
      expect(resizer.classes()).toContain('acme-auto-resizer');
      expect(resizer.classes()).toContain('user-resizer');
      expect(resizer.text()).toBe('0:0');
      namespace.value = 'next';
      await nextTick();
      expect(resizer.classes()).toContain('next-auto-resizer');
      expect(resizer.element).toBe(root);
      deliver!([{ contentRect: { width: 240, height: 80 } } as ResizeObserverEntry], {} as ResizeObserver);
      await nextTick();
      expect(resizer.text()).toBe('0:80');
      expect(resizer.emitted('resize')).toEqual([[{ width: 0, height: 80 }]]);
    } finally {
      wrapper.unmount();
    }
    expect(disconnect).toHaveBeenCalledOnce();
  } finally { vi.unstubAllGlobals(); }
});
