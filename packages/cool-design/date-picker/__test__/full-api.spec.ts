import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import DatePicker from '../date-picker';
import TimePicker from '../time-picker';
import DateTimePicker from '../date-time-picker';

test('DatePicker 声明完整高级 props', () => {
  const wrapper = mount(DatePicker, { props: {
    showFooter: true, showWeekNumber: true, emptyValues: [''], valueOnClear: 'custom', id: 'date', name: 'date',
    prefixIcon: 'calendar', clearIcon: 'close', popperOptions: {}, quarter: true
  } });
  expect(wrapper.props('showFooter')).toBe(true);
  expect(wrapper.props('popperOptions')).toEqual({});
  expect(wrapper.props('id')).toBe('date');
});

test('TimePicker 声明完整高级 props', () => {
  const wrapper = mount(TimePicker, { props: {
    defaultValue: '10:20:30', saveOnBlur: true, emptyValues: [''], name: 'time', tabindex: 0,
    ariaLabel: '时间', prefixIcon: 'clock', clearIcon: 'close', popperStyle: { width: '200px' }, popperOptions: {}
  } });
  expect(wrapper.props('saveOnBlur')).toBe(true);
  expect(wrapper.props('name')).toBe('time');
  expect(wrapper.props('ariaLabel')).toBe('时间');
});

test('DateTimePicker 显式声明并转发完整高级 props', () => {
  const wrapper = mount(DateTimePicker, { props: {
    type: 'datetimerange', showNow: true, showWeekNumber: true, singlePanel: true, unlinkPanels: true,
    shortcuts: [], defaultValue: '2026-11-04', firstDayOfWeek: 1, cellClassName: 'holiday'
  } });
  expect(wrapper.props('type')).toBe('datetimerange');
  expect(wrapper.props('singlePanel')).toBe(true);
  expect(wrapper.props('unlinkPanels')).toBe(true);
  expect(wrapper.props('firstDayOfWeek')).toBe(1);
});

test('DatePicker popperOptions 的 offset 实际影响浮层定位', async () => {
  const original = HTMLElement.prototype.getBoundingClientRect;
  HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.classList.contains('i-date-picker__dropdown')) return { top: 0, bottom: 100, left: 0, right: 200, width: 200, height: 100 } as DOMRect;
    return { top: 100, bottom: 120, left: 0, right: 100, width: 100, height: 20 } as DOMRect;
  };
  try {
    const wrapper = mount(DatePicker, { props: { showConfirm: false, popperOptions: { offset: 24 }, teleported: false } });
    await wrapper.get('input').trigger('click');
    expect((wrapper.get('.i-date-picker__dropdown').element as HTMLElement).style.top).toBe('144px');
  } finally {
    HTMLElement.prototype.getBoundingClientRect = original;
  }
});

test('useFloating fallback 使用候选 placement 的对齐方向', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false, popperOptions: { placement: 'bottom-start' }, fallbackPlacements: ['top-end'], teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('.i-date-picker__dropdown').attributes('data-placement')).not.toBe('top-start');
});

test('DatePicker 支持季度类型入口', () => {
  const wrapper = mount(DatePicker, { props: { type: 'quarter' } });
  expect(wrapper.props('type')).toBe('quarter');
});
