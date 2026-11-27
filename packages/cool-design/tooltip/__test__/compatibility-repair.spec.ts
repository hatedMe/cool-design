import Tooltip from '..';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('Tooltip hover 仅在 focus-on-target 开启时聚焦', async () => {
  const wrapper = mount(Tooltip, { attachTo: document.body, props: { content: 'tip' }, slots: { default: () => h('button', 'trigger') } });
  await wrapper.get('.i-tooltip__trigger').trigger('mouseenter');
  expect(document.activeElement).not.toBe(wrapper.get('button').element);
  await wrapper.setProps({ focusOnTarget: true });
  await wrapper.get('.i-tooltip__trigger').trigger('mouseenter');
  expect(document.activeElement).toBe(wrapper.get('button').element);
  wrapper.unmount();
});
