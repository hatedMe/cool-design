import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';
import { DatePickerPanel, type DatePickerPanelCell } from '..';
import { ConfigProvider } from '../..';
import en from '../../config-provider/locale/en';

test('emits a partial calendar range before committing its formatted value', async () => {
  const wrapper = mount(DatePickerPanel, {
    props: { type: 'daterange', defaultValue: new Date(2026, 0, 1), valueFormat: 'YYYY-MM-DD' }
  });
  await wrapper.get('[data-value="2026-01-10"]').trigger('click');
  expect(wrapper.emitted('calendar-change')).toEqual([[[new Date(2026, 0, 10), null]]]);
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.get('[data-value="2026-01-15"]').trigger('click');
  expect(wrapper.emitted('calendar-change')?.[1]).toEqual([[new Date(2026, 0, 10), new Date(2026, 0, 15)]]);
  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['2026-01-10', '2026-01-15']);
});

test('renders formatted external models and emits Date plus the configured locale', async () => {
  const wrapper = mount(DatePickerPanel, {
    props: { modelValue: '19/03/2027', valueFormat: 'DD/MM/YYYY' }
  });
  expect(wrapper.get('[data-value="2027-03-19"]').classes()).toContain('is-selected');
  await wrapper.setProps({ modelValue: new Date(2026, 0, 1), valueFormat: undefined });
  await wrapper.get('[data-value="2026-01-10"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toEqual([[new Date(2026, 0, 10), 'zh-cn']]);
});

test('exposes inline cell and navigation slots and reports both range cursors', async () => {
  const wrapper = mount(DatePickerPanel, {
    props: { type: 'daterange', defaultValue: new Date(2026, 0, 1), showWeekNumber: true },
    slots: {
      default: ({ text, dayjs }) => h('span', { class: 'day' }, `${text}:${dayjs.format('MM')}`),
      'next-year': () => h('span', { class: 'next-year' }, '年'),
      'next-month': () => h('span', { class: 'next-month' }, '月')
    }
  });
  expect(wrapper.get('[data-value="2026-01-10"] .day').text()).toBe('10:01');
  expect(wrapper.find('.i-date-picker__week-number').exists()).toBe(true);
  await wrapper.get('.next-month').trigger('click');
  expect(wrapper.emitted('panel-change')?.[0]).toEqual([[new Date(2026, 1, 1), new Date(2026, 2, 1)], 'month', undefined]);
  await wrapper.get('.next-year').trigger('click');
  expect(wrapper.emitted('panel-change')?.[1]?.[1]).toBe('year');
});

test('shows shortcuts independently of the optional footer and formats shortcut output', async () => {
  const wrapper = mount(DatePickerPanel, {
    props: {
      valueFormat: 'DD/MM/YYYY',
      shortcuts: [{ text: '元旦', value: () => new Date(2026, 0, 1) }]
    }
  });
  expect(wrapper.find('.i-date-picker__footer').exists()).toBe(false);
  await wrapper.get('[data-shortcut="元旦"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('01/01/2026');
});

test('uses the configured start and end times, range clear and editable datetime fields', async () => {
  const wrapper = mount(DatePickerPanel, {
    props: {
      type: 'datetimerange',
      defaultValue: new Date(2026, 0, 1),
      defaultTime: [new Date(1970, 0, 1, 8), new Date(1970, 0, 1, 17, 30)],
      showFooter: true,
      showConfirm: true,
      singlePanel: true,
      editable: false,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm'
    }
  });
  expect(wrapper.get('button[aria-label="确认"]').attributes('disabled')).toBeDefined();
  await wrapper.get('[data-value="2026-01-10"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.get('[data-value="2026-01-15"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['2026-01-10 08:00', '2026-01-15 17:30']);
  expect(wrapper.get<HTMLInputElement>('input[aria-label="开始日期"]').element.value).toBe('10/01/2026');
  expect(wrapper.get('input[aria-label="开始时间"]').attributes('readonly')).toBeDefined();
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBeNull();
  expect(wrapper.emitted('clear')).toHaveLength(1);
});

test('keeps multiple and range selections distinct and honors disabled dates', async () => {
  const wrapper = mount(DatePickerPanel, {
    props: { type: 'years', defaultValue: new Date(2026, 0, 1), disabledDate: (date) => date.getFullYear() === 2028 }
  });
  expect(wrapper.get('[data-value="2028"]').attributes('disabled')).toBeDefined();
  await wrapper.get('[data-value="2027"]').trigger('click');
  await wrapper.get('[data-value="2026"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[1]?.[0]).toEqual([new Date(2027, 0, 1), new Date(2026, 0, 1)]);
  await wrapper.get('[data-value="2027"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[2]?.[0]).toEqual([new Date(2026, 0, 1)]);
});

test.each([undefined, false, 0])('emits and accepts a configured clear value of %s', async (clearValue) => {
  let calls = 0;
  const wrapper = mount(ConfigProvider, {
    props: { locale: en, emptyValues: ['', null, undefined, false, 0], valueOnClear: () => { calls++; return clearValue; } },
    slots: {
      default: () => h(DatePickerPanel, {
        type: 'datetimerange', modelValue: [new Date(2026, 0, 1), new Date(2026, 0, 2)], showFooter: true
      })
    }
  });
  const panel = wrapper.getComponent(DatePickerPanel);
  expect(calls).toBe(0);
  await panel.get('button[aria-label="清空"]').trigger('click');
  expect(panel.emitted('update:modelValue')).toEqual([[clearValue, 'en']]);
  expect(calls).toBe(1);
  const controlled = mount(DatePickerPanel, { props: { modelValue: clearValue, emptyValues: ['', null, undefined, false, 0] } });
  expect(controlled.find('.is-selected').exists()).toBe(false);
});

test.each([
  ['week', '2026-01-14', new Date(2026, 0, 12)],
  ['month', '03', new Date(2026, 2, 1)],
  ['quarter', '2', new Date(2026, 3, 1)]
] as const)('picks a %s at the start of its period', async (type, cell, date) => {
  const wrapper = mount(DatePickerPanel, { props: { type, defaultValue: new Date(2026, 0, 1) } });
  await wrapper.get(`[data-value="${cell}"]`).trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(date);
});

test('separates date selection from disabled range time controls', async () => {
  const roles = new Set<string>();
  const wrapper = mount(DatePickerPanel, {
    props: {
      type: 'datetimerange', defaultValue: new Date(2026, 0, 1), showConfirm: true,
      valueFormat: 'x', timeFormat: 'HH:mm', disabledHours: (role) => { roles.add(role); return role === 'end' ? [1] : []; }
    }
  });
  expect(wrapper.find('.i-date-picker__footer').exists()).toBe(false);
  expect(roles).toEqual(new Set(['start', 'end']));
  const [start, end] = wrapper.findAll('.i-date-picker-panel__time');
  expect(start.get('[data-unit="hour"][data-value="01"]').attributes('disabled')).toBeUndefined();
  expect(end.get('[data-unit="hour"][data-value="01"]').attributes('disabled')).toBeDefined();
  await wrapper.get('[data-value="2026-01-10"]').trigger('click');
  await wrapper.get('[data-value="2026-01-15"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([+new Date(2026, 0, 10), +new Date(2026, 0, 15)]);
});

test('keeps popup change listeners isolated from standalone selection', async () => {
  const onChange = vi.fn();
  const wrapper = mount(DatePickerPanel, { props: { defaultValue: new Date(2026, 0, 1) }, attrs: { onChange } });
  await wrapper.get('[data-value="2026-01-10"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
  expect(onChange).not.toHaveBeenCalled();
});

test.each([
  ['yearrange', ['2020 - 2029', '2030 - 2039'], ['2030 - 2039', '2040 - 2049']],
  ['quarterrange', ['2026年', '2027年'], ['2027年', '2028年']]
] as const)('advances %s by whole pages and keeps linked views distinct', async (type, initial, next) => {
  const wrapper = mount(DatePickerPanel, { props: { type, defaultValue: new Date(2026, 0, 1) } });
  expect(wrapper.findAll('header strong').map((label) => label.text())).toEqual(initial);
  await wrapper.findAll('header button')[1].trigger('click');
  expect(wrapper.findAll('header strong').map((label) => label.text())).toEqual(next);
});

test('keeps the click order for multiple dates', async () => {
  const wrapper = mount(DatePickerPanel, { props: { type: 'dates', defaultValue: new Date(2026, 0, 1) } });
  await wrapper.get('[data-value="2026-01-19"]').trigger('click');
  await wrapper.get('[data-value="2026-01-11"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[1]?.[0]).toEqual([new Date(2026, 0, 19), new Date(2026, 0, 11)]);
});

test.each([
  ['dates', '2026-03-19'], ['months', '03'], ['quarters', '1'], ['years', '2026']
] as const)('toggles an existing %s value in the same unit', async (type, value) => {
  const wrapper = mount(DatePickerPanel, { props: { type, modelValue: [new Date(2026, 2, 19, 9)] } });
  await wrapper.get('[data-value="' + value + '"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([]);
});

test.each([
  ['month', '03', '2:3月'], ['quarter', '2', '1:Q2'], ['year', '2027', '2027:2027']
] as const)('renders the %s cell through the public default slot', (type, value, expected) => {
  const wrapper = mount(DatePickerPanel, {
    props: { type, defaultValue: new Date(2026, 0, 1) },
    slots: { default: (cell: DatePickerPanelCell) => h('span', { class: 'custom-unit' }, cell.text + ':' + (cell.renderText ?? cell.text)) }
  });
  expect(wrapper.get('[data-value="' + value + '"] .custom-unit').text()).toBe(expected);
});

test.each([
  ['date', new Date(2026, 0, 19), 'true:false'],
  ['dates', [new Date(2026, 0, 19)], 'false:true'],
  ['daterange', [new Date(2026, 0, 19), new Date(2026, 0, 21)], 'false:false']
] as const)('exposes distinct current and multiple-selection flags for %s', (type, model, flags) => {
  const wrapper = mount(DatePickerPanel, {
    props: { type, modelValue: Array.isArray(model) ? [...model] : model, singlePanel: true },
    slots: { default: ({ isCurrent, isSelected }: DatePickerPanelCell) => h('span', String(isCurrent) + ':' + String(isSelected)) }
  });
  expect(wrapper.get('[data-value="2026-01-19"] span').text()).toBe(flags);
});

test.each([
  ['month', 'month', '02', new Date(2026, 1, 1)], ['year', 'year', '2027', new Date(2027, 0, 1)],
  ['months', 'month', '02', new Date(2026, 0, 1)], ['years', 'year', '2027', new Date(2026, 0, 1)]
] as const)('reports the %s view on a month or year pick', async (type, view, value, cursor) => {
  const wrapper = mount(DatePickerPanel, { props: { type, defaultValue: new Date(2026, 0, 1) } });
  await wrapper.get('[data-value="' + value + '"]').trigger('click');
  expect(wrapper.emitted('panel-change')).toEqual([[cursor, view, view]]);
});

test('uses default time for ordinary dates and emits raw dates for calendar range changes', async () => {
  const defaultValue = new Date(2026, 0, 1);
  const morning = new Date(1970, 0, 1, 9);
  const evening = new Date(1970, 0, 1, 18);
  const single = mount(DatePickerPanel, { props: { defaultValue, defaultTime: morning } });
  await single.get('[data-value="2026-01-10"]').trigger('click');
  expect(single.emitted('update:modelValue')?.[0]?.[0]).toEqual(new Date(2026, 0, 10, 9));
  const range = mount(DatePickerPanel, { props: { type: 'daterange', defaultValue, defaultTime: [morning, evening] } });
  await range.get('[data-value="2026-01-15"]').trigger('click');
  await range.get('[data-value="2026-01-10"]').trigger('click');
  expect(range.emitted('calendar-change')?.[1]?.[0]).toEqual([new Date(2026, 0, 10), new Date(2026, 0, 15)]);
  expect(range.emitted('update:modelValue')?.[0]?.[0]).toEqual([new Date(2026, 0, 10, 9), new Date(2026, 0, 15, 18)]);
});

test('confirms an empty datetime using the default date and time', async () => {
  const wrapper = mount(DatePickerPanel, {
    props: { type: 'datetime', showFooter: true, showConfirm: true, defaultValue: new Date(2026, 0, 10), defaultTime: new Date(1970, 0, 1, 9) }
  });
  await wrapper.get('button[aria-label="确认"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(new Date(2026, 0, 10, 9));
});

test.each([
  ['monthrange', [new Date(2026, 0, 15), new Date(2026, 2, 22)], ['01', '02', '03']],
  ['quarterrange', [new Date(2026, 1, 15), new Date(2026, 7, 22)], ['1', '2', '3']],
  ['yearrange', [new Date(2026, 1, 15), new Date(2028, 7, 22)], ['2026', '2027', '2028']]
] as const)('exposes range positions by unit in %s slots', (type, model, cells) => {
  const wrapper = mount(DatePickerPanel, {
    props: { type, modelValue: [...model], singlePanel: true },
    slots: { default: ({ inRange, start, end }: DatePickerPanelCell) => h('span', [inRange, start, end].join(',')) }
  });
  expect(cells.map((value) => wrapper.get('[data-value="' + value + '"] span').text()))
    .toEqual(['true,true,false', 'true,false,false', 'true,false,true']);
});

test('updates the month range slot when hovering before the first selection', async () => {
  const wrapper = mount(DatePickerPanel, {
    props: { type: 'monthrange', defaultValue: new Date(2026, 0, 1), singlePanel: true },
    slots: { default: ({ inRange, start, end }: DatePickerPanelCell) => h('span', [inRange, start, end].join(',')) }
  });
  const january = wrapper.get('[data-value="01"]');
  const march = wrapper.get('[data-value="03"]');
  await march.trigger('click');
  expect(march.get('span').text()).toBe('false,true,false');
  await january.trigger('mouseenter');
  expect(january.get('span').text()).toBe('true,true,false');
  expect(march.get('span').text()).toBe('true,false,true');
  await wrapper.get('[data-view="month"]').trigger('mouseleave');
  expect(january.get('span').text()).toBe('false,false,false');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test.each([
  [undefined, new Date(2026, 4, 16, 7, 43, 25)],
  [new Date(2027, 2, 8, 15, 1, 5), new Date(2027, 2, 8, 7, 43, 25)]
] as const)('uses the current time when confirming an empty datetime with default date %s', async (defaultValue, expected) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 16, 7, 43, 25));
  try {
    const wrapper = mount(DatePickerPanel, { props: { type: 'datetime', showFooter: true, showConfirm: true, defaultValue } });
    await wrapper.get('button[aria-label="确认"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(expected);
    wrapper.unmount();
  } finally {
    vi.useRealTimers();
  }
});
