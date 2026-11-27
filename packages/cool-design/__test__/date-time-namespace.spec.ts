import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { describe, expect, test } from 'vitest';
import Calendar from '../calendar';
import ConfigProvider from '../config-provider';
import DatePicker from '../date-picker';
import DatePickerPanel from '../date-picker-panel';
import DateTimePicker from '../date-time-picker';
import TimePicker from '../time-picker';

describe('日期时间组件命名空间', () => {
  test.each([
    { name: 'DatePicker', block: 'date-picker', component: DatePicker, panel: 'date-picker__grid' },
    { name: 'DateTimePicker', block: 'date-picker', component: DateTimePicker, panel: 'time-picker__column' },
    { name: 'TimePicker', block: 'time-picker', component: TimePicker, panel: 'time-picker__column' }
  ])('$name 的控件和浮层跟随最近 Provider', async ({ block, component, panel }) => {
    const namespace = ref('acme');
    const wrapper = mount({
      setup: () => () => h(ConfigProvider, { namespace: 'outer', theme: 'light' }, () =>
        h(ConfigProvider, { namespace: namespace.value, size: 'small', theme: 'dark' }, () =>
          h(component, { popperClass: 'custom-dropdown' })
        )
      )
    }, { attachTo: document.body });
    try {
      const input = wrapper.get('[role="combobox"]');
      await input.trigger('click');
      const overlay = wrapper.get('.acme-overlay-host > .custom-dropdown');
      expect(overlay.classes()).toContain(`acme-${block}__dropdown`);
      expect(overlay.get(`.acme-${panel}`).exists()).toBe(true);
      expect(wrapper.get(`.acme-${block}.acme-control--small input`).element).toBe(input.element);

      input.element.focus();
      namespace.value = 'i';
      await nextTick();
      expect(wrapper.get(`.i-${block}__input`).element).toBe(input.element);
      expect(document.activeElement).toBe(input.element);
      await input.trigger('keydown', { key: 'Escape' });
      expect(wrapper.find('.custom-dropdown').exists()).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  test('独立 DatePickerPanel 的日期网格和时间输入使用同一前缀', () => {
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme' },
      slots: {
        default: () => h(DatePickerPanel, {
          type: 'datetime',
          defaultValue: new Date(2026, 10, 1),
          class: 'custom-panel',
          cellClassName: () => 'custom-cell'
        })
      }
    });
    try {
      const panel = wrapper.get('.acme-date-picker-panel.custom-panel');
      expect(panel.get('.acme-date-picker__grid button.custom-cell').exists()).toBe(true);
      expect(panel.get('.acme-date-picker-panel__times .acme-date-picker-panel__time input').exists()).toBe(true);
    } finally {
      wrapper.unmount();
    }
  });

  test('Calendar 的范围面板和日期插槽跟随 Provider', () => {
    const wrapper = mount(ConfigProvider, {
      props: { namespace: 'acme' },
      slots: {
        default: () => h(Calendar, { range: [new Date(2026, 10, 23), new Date(2026, 11, 6)] }, {
          'date-cell': ({ data }: { data: { day: string } }) => h('span', data.day)
        })
      }
    });
    try {
      const calendar = wrapper.get('.acme-calendar');
      expect(calendar.findAll('.acme-calendar__range-panels .acme-calendar__grid')).toHaveLength(2);
      expect(calendar.get('[aria-label="2026-11-23"] span').text()).toBe('2026-11-23');
    } finally {
      wrapper.unmount();
    }
  });
});
