import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { expect, test } from 'vitest';
import { ColorPickerPanel, ConfigProvider } from '../..';

test('updates the color immediately through the standalone controls', async () => {
  const wrapper = mount(ColorPickerPanel, { props: { modelValue: '#ff0000', predefine: ['#00ff00'] } });
  await wrapper.get('button[aria-label="#00ff00"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toEqual([['#00ff00']]);
});

test('独立面板的预设色、色相和组合输入随 Provider 前缀更新', async () => {
  const wrapper = mount(ConfigProvider, {
    props: { namespace: 'acme' },
    slots: { default: () => h(ColorPickerPanel, {
      modelValue: '#ff0000',
      predefine: ['#00ff00'],
      hueSliderClass: 'user-hue',
      hueSliderStyle: { opacity: 0.9 }
    }) }
  });
  try {
    const panel = wrapper.getComponent(ColorPickerPanel);
    expect(panel.classes()).toContain('acme-color-picker-editor');
    const preset = panel.get('button[aria-label="#00ff00"]');
    expect(preset.element.parentElement?.classList.value).toBe('acme-color-picker-editor__presets acme-color-picker__presets');
    const hue = panel.get<HTMLInputElement>('input[aria-label="色相"]');
    expect(hue.classes()).toEqual(['acme-color-picker-editor__hue', 'user-hue']);
    expect(hue.element.style.opacity).toBe('0.9');
    expect(panel.find('.acme-input').exists()).toBe(true);
    await wrapper.setProps({ namespace: 'i' });
    expect(hue.classes()).toEqual(['i-color-picker-editor__hue', 'user-hue']);
    await preset.trigger('click');
    expect(panel.emitted('update:modelValue')).toEqual([['#00ff00']]);
  } finally {
    wrapper.unmount();
  }
});
