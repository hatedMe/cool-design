import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import { ColorPickerPanel } from '..';

test('updates the color immediately through the standalone controls', async () => {
  const wrapper = mount(ColorPickerPanel, { props: { modelValue: '#ff0000', predefine: ['#00ff00'] } });
  await wrapper.get('button[aria-label="#00ff00"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toEqual([['#00ff00']]);
});
