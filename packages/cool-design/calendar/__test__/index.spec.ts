import { flushPromises, mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';
import { h, nextTick } from 'vue';
import Calendar from '..';

test('月视图渲染、选中态、禁用日期与模型更新', async () => {
  const w = mount(Calendar, {
    props: { modelValue: new Date(2026, 10, 5), disabledDate: (date: Date) => date.getDate() === 10 }
  });
  await nextTick();
  expect(w.get('.i-calendar__title').text()).toContain('2026');
  const cells = w.findAll('.i-calendar__grid button');
  expect(cells.length).toBeGreaterThan(28);
  const selected = cells.find((cell) => cell.attributes('aria-label') === '2026-11-05');
  expect(selected?.classes()).toContain('is-selected');
  const disabled = cells.find((cell) => cell.attributes('aria-label') === '2026-11-10');
  expect(disabled?.attributes('disabled')).toBeDefined();
  await disabled?.trigger('click');
  expect(w.emitted('update:modelValue')).toBeUndefined();
  const target = cells.find((cell) => cell.attributes('aria-label') === '2026-11-06');
  await target?.trigger('click');
  expect(w.emitted('update:modelValue')?.[0][0]).toBeInstanceOf(Date);
  expect(w.emitted('select')).toHaveLength(1);
});

test('firstDayOfWeek 调整周头与偏移，跨月日期可切换面板', async () => {
  const sunday = mount(Calendar, { props: { modelValue: new Date(2026, 10, 1), firstDayOfWeek: 0 } });
  expect(sunday.findAll('.i-calendar__week span')[0].text()).toBe('日');
  const monday = mount(Calendar, { props: { modelValue: new Date(2026, 10, 1), firstDayOfWeek: 1 } });
  expect(monday.findAll('.i-calendar__week span')[0].text()).toBe('一');
  const firstCell = monday.findAll('.i-calendar__grid button')[0];
  expect(firstCell.classes()).toContain('is-prev-month');
  await firstCell.trigger('click');
  expect(monday.emitted('panel-change')).toHaveLength(1);
  expect(monday.emitted('update:modelValue')).toHaveLength(1);
});

test('范围模式校验周一到周日且不超过两个月', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const valid = mount(Calendar, {
      props: { range: [new Date(2026, 10, 2), new Date(2026, 10, 8)] }
    });
    await nextTick();
    expect(valid.findAll('.i-calendar__grid button')).toHaveLength(7);
    expect(valid.classes()).toContain('is-range');
    const invalidWeek = mount(Calendar, {
      props: { range: [new Date(2026, 10, 3), new Date(2026, 10, 8)] }
    });
    expect(invalidWeek.findAll('.i-calendar__grid button').length).toBeGreaterThan(7);
    expect(warn).toHaveBeenCalled();
    const tooLong = mount(Calendar, {
      props: { range: [new Date(2026, 8, 7), new Date(2026, 10, 8)] }
    });
    expect(tooLong.find('.i-calendar').classes()).not.toContain('is-range');
    const exposed = valid.vm as unknown as {
      calculateValidatedDateRange: (a: Date, b: Date) => Date[];
    };
    expect(exposed.calculateValidatedDateRange(new Date(2026, 10, 2), new Date(2026, 10, 8))).toHaveLength(2);
    expect(exposed.calculateValidatedDateRange(new Date(2026, 10, 8), new Date(2026, 10, 2))).toHaveLength(0);
  } finally {
    warn.mockRestore();
  }
});

test('支持 controllerType select、formatter、header 与 date-cell 插槽及 expose', async () => {
  const w = mount(Calendar, {
    props: {
      modelValue: new Date(2026, 10, 5),
      controllerType: 'select',
      formatter: (type: string, value: number) => (type === 'year' ? `${value}Y` : `${value}M`)
    },
    slots: {
      'date-cell': ({ data }: { data: { day: string; isSelected: boolean } }) =>
        h('span', { class: 'custom-cell' }, `${data.day}${data.isSelected ? '-sel' : ''}`),
      header: ({ date }: { date: string }) => h('div', { class: 'custom-header' }, date)
    }
  });
  await nextTick();
  expect(w.find('.custom-header').text()).toBe('2026-11');
  expect(w.find('.custom-cell').exists()).toBe(true);
  w.unmount();
  const w2 = mount(Calendar, {
    props: {
      modelValue: new Date(2026, 10, 5),
      controllerType: 'select',
      formatter: (type: string, value: number) => (type === 'year' ? `${value}Y` : `${value}M`)
    }
  });
  const selects = w2.findAll('select');
  expect(selects).toHaveLength(2);
  expect(selects[0].findAll('option')[10].text()).toBe('2026Y');
  const vm = w2.vm as unknown as {
    selectDate: (type: string) => void;
    pickDay: (day: Date) => void;
    selectedDay: Date | null;
  };
  vm.selectDate('prev-month');
  await nextTick();
  expect(w2.emitted('panel-change')).toHaveLength(1);
  vm.selectDate('today');
  await flushPromises();
  expect(w2.emitted('update:modelValue')).toBeDefined();
  expect(vm.selectedDay).toBeInstanceOf(Date);
});
