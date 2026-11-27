import { mount } from '@vue/test-utils';
import * as UI from '../../index';
import { h, nextTick, ref, vShow, withDirectives } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });

test('CollapseTransition 快速切换后恢复 padding 和 overflow', async () => {
  expect(UI.ElCollapseTransition).toBeDefined();
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(callback, 16));
  const open = ref(false);
  const wrapper = mount({ setup: () => () => h(UI.ElCollapseTransition, null, () => withDirectives(h('div', { style: { paddingTop: '8px', paddingBottom: '6px', overflow: 'auto' } }, 'content'), [[vShow, open.value]])) }, { global: { stubs: { transition: false } } });
  open.value = true; await nextTick();
  open.value = false; await nextTick();
  open.value = true; await nextTick();
  await vi.runAllTimersAsync(); await nextTick();
  const element = wrapper.get('div').element;
  expect(element.style.paddingTop).toBe('8px');
  expect(element.style.paddingBottom).toBe('6px');
  expect(element.style.overflow).toBe('auto');
  expect(element.style.maxHeight).toBe('');
  wrapper.unmount();
});
