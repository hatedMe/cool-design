import { h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { Autocomplete, ConfigProvider, InputTag, Mention, Select, SelectOption, SelectOptionGroup, SelectV2, TimeSelect } from '../index';

const controls = [
  ['select', () => h(Select)],
  ['select-v2', () => h(SelectV2)],
  ['autocomplete', () => h(Autocomplete)],
  ['mention', () => h(Mention)],
  ['input-tag', () => h(InputTag)],
  ['time-select', () => h(TimeSelect)]
] as const;

describe('选择输入的命名空间', () => {
  test.each(controls)('%s 响应最近 Provider 的前缀和尺寸', async (block, render) => {
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme', size: 'small' },
      slots: { default: render }
    });
    try {
      expect(wrapper.find(`.acme-${block}.acme-control--small`).exists()).toBe(true);
      await wrapper.setProps({ namespace: 'brand', size: 'large' });
      expect(wrapper.find(`.brand-${block}.brand-control--large`).exists()).toBe(true);
      expect(wrapper.find(`.acme-${block}`).exists()).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  test('已打开的 Select 在切换前缀后滚动到分组的高亮选项并选择它', async () => {
    const onChange = vi.fn();
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'i' },
      slots: { default: () => h(Select, { teleported: false, onChange }, () =>
        h(SelectOptionGroup, { label: '分组' }, () => [
          h(SelectOption, { value: 1, disabled: true, label: '禁用' }),
          h(SelectOption, { value: 2 }, () => '第一个候选'),
          h(SelectOption, { value: 3 }, () => '第二个候选')
        ])) }
    });
    try {
      const combo = wrapper.get('[role="combobox"]');
      await combo.trigger('click');
      await wrapper.setProps({ namespace: 'acme' });
      expect(wrapper.get('.acme-select__group').text()).toBe('分组');
      const option = wrapper.findAll('[role="option"]')[2];
      const scrollIntoView = vi.fn();
      Object.defineProperty(option.element, 'scrollIntoView', { value: scrollIntoView });
      await combo.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect(option.classes()).toContain('acme-select__option');
      expect(option.classes()).toContain('is-highlighted');
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
      await combo.trigger('keydown', { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(3);
    } finally {
      wrapper.unmount();
    }
  });

  test('Select 和 SelectV2 的外置面板继承最近 Provider 且保留调用者样式', async () => {
    const external = document.createElement('div');
    external.id = 'selection-external';
    document.body.append(external);
    const appendTo = ref<string | HTMLElement>(external);
    const wrapper = mount(ConfigProvider, {
      attachTo: document.body,
      props: { namespace: 'acme', theme: 'dark', themeVars: { '--acme-bg': '#202631' } },
      slots: { default: () => [
        h(Select, { appendTo: appendTo.value, popperClass: 'panel-a', popperStyle: { '--acme-bg': '#374151' } }),
        h(SelectV2, { appendTo: '#selection-external', popperClass: 'panel-b', options: [] })
      ] }
    });
    try {
      for (const combo of wrapper.findAll('[role="combobox"]')) await combo.trigger('click');
      const select = external.querySelector<HTMLElement>('.panel-a');
      const selectV2 = external.querySelector<HTMLElement>('.panel-b');
      expect(select?.classList.contains('acme-theme-scope')).toBe(true);
      expect(select?.getAttribute('data-theme')).toBe('dark');
      expect(select?.style.getPropertyValue('--acme-bg')).toBe('#374151');
      expect(selectV2?.classList.contains('acme-theme-scope')).toBe(true);
      expect(selectV2?.getAttribute('data-theme')).toBe('dark');
      expect(selectV2?.style.getPropertyValue('--acme-bg')).toBe('#202631');
      appendTo.value = 'body';
      await wrapper.setProps({ namespace: 'brand', theme: 'light', themeVars: { '--brand-bg': '#fefefe' } });
      expect(select?.parentElement).toBe(document.body);
      expect(selectV2?.parentElement).toBe(external);
      expect(selectV2?.classList.contains('brand-theme-scope')).toBe(true);
      expect(selectV2?.getAttribute('data-theme')).toBe('light');
      expect(selectV2?.style.getPropertyValue('--acme-bg')).toBe('');
      expect(selectV2?.style.getPropertyValue('--brand-bg')).toBe('#fefefe');
    } finally {
      wrapper.unmount();
      external.remove();
    }
  });
});
