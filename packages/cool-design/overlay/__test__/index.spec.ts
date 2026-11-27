import { mount } from '@vue/test-utils';
import * as UI from '../../index';
import { h } from 'vue';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('Overlay 仅在完整遮罩点击时发送事件，并支持 mask=false', async () => {
  expect(UI.ElOverlay).toBeDefined();
  const wrapper = mount(UI.ElOverlay, { props: { zIndex: '2200', overlayClass: 'custom-mask' }, slots: { default: () => h('button', 'child') } });
  expect(wrapper.classes()).toContain('custom-mask');
  expect(wrapper.attributes('style')).toContain('2200');
  await wrapper.get('button').trigger('mousedown'); await wrapper.trigger('mouseup'); await wrapper.trigger('click');
  expect(wrapper.emitted('click')).toBeUndefined();
  await wrapper.trigger('mousedown'); await wrapper.trigger('mouseup'); await wrapper.trigger('click');
  expect(wrapper.emitted('click')).toHaveLength(1);
  await wrapper.setProps({ customMaskEvent: true });
  await wrapper.trigger('mousedown'); await wrapper.trigger('mouseup'); await wrapper.trigger('click');
  expect(wrapper.emitted('click')).toHaveLength(1);
  await wrapper.setProps({ mask: false });
  expect(wrapper.classes()).not.toContain('i-overlay');
  expect(wrapper.get('button').text()).toBe('child');
  wrapper.unmount();
});
