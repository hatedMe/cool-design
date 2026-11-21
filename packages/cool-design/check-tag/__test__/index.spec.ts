import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import { CheckTag, ElCheckTag } from '../..';

test('toggles a controlled check tag and respects disabled', async () => {
  expect(CheckTag).toBe(ElCheckTag);
  const wrapper = mount(CheckTag, { slots: { default: 'Selected' } });
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('change')).toEqual([[true]]);
  expect(wrapper.emitted('update:checked')).toEqual([[true]]);
  await wrapper.setProps({ checked: true, disabled: true });
  expect(wrapper.get('button').attributes('aria-pressed')).toBe('true');
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('change')).toHaveLength(1);
});
