import Cascader from '..';
import { mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
afterEach(() => { document.body.innerHTML = ''; });

test('Cascader 自定义清空图标不影响清空事件', async () => {
  const wrapper = mount(Cascader, { props: { modelValue: [1], options: [{ value: 1, label: 'one' }], clearable: true, clearIcon: 'custom-clear-icon' } });
  expect(wrapper.get('[aria-label=清空] .custom-clear-icon').exists()).toBe(true);
  await wrapper.get('[aria-label=清空]').trigger('click');
  expect(wrapper.emitted('clear')).toHaveLength(1);
  wrapper.unmount();
});
