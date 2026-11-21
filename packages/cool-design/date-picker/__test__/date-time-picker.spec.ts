import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import DateTimePicker from '../date-time-picker';

test('DateTimePicker showNow 默认开启', () => {
  const wrapper = mount(DateTimePicker);
  expect(wrapper.props('showNow')).toBe(true);
});

test('DateTimePicker 声明并转发 DatePicker 公共属性', () => {
  const wrapper = mount(DateTimePicker, { props: { showFooter: false, id: 'datetime', name: 'datetime', prefixIcon: 'calendar', clearIcon: 'close' } });
  expect(wrapper.props('showFooter')).toBe(false);
  expect(wrapper.props('id')).toBe('datetime');
  expect(wrapper.props('name')).toBe('datetime');
  expect(wrapper.props('prefixIcon')).toBe('calendar');
});

test('DateTimePicker 显式声明并转发 show-now', () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, showNow: true } });
  expect(wrapper.props('showNow')).toBe(true);
});

test('DateTimePicker 支持标准 datetimerange type', () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, type: 'datetimerange' } });
  expect(wrapper.props('type')).toBe('datetimerange');
});

test('DateTimePicker 单值选择日期不会触发 calendar-change', async () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="2026-11-06"]').trigger('click');
  expect(wrapper.emitted('calendar-change')).toBeUndefined();
});

test('DateTimePicker datetimerange 同日结束时间不能早于开始时间', async () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, range: true, modelValue: ['2026-11-04 12:00:00', '2026-11-04 13:00:00'], teleported: false } });
  await wrapper.findAll('input')[1].trigger('click');
  await wrapper.get('[role="option"][data-value="11"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="00"][data-unit="minute"]').trigger('click');
  await wrapper.get('[role="option"][data-value="00"][data-unit="second"]').trigger('click');
  expect(wrapper.emitted('change')).toBeUndefined();
});

test('DateTimePicker default-time 初始化时间草稿', async () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, defaultTime: new Date(1970, 0, 1, 10, 20, 30), teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('[role="option"][data-value="10"][data-unit="hour"]').classes()).toContain('is-selected');
  expect(wrapper.get('[role="option"][data-value="20"][data-unit="minute"]').classes()).toContain('is-selected');
});

test('DateTimePicker 可见输入显示秒', () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, modelValue: '2026-11-04 10:20:30', format: 'YYYY-MM-DD HH:mm:ss' } });
  expect((wrapper.get('input').element as HTMLInputElement).value).toBe('2026-11-04 10:20:30');
});

test('DateTimePicker 显示秒并在选择日期和时分秒后返回 Date', async () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, teleported: false } });
  const input = wrapper.get('input');
  expect(input.attributes('type')).toBe('text');
  await input.trigger('click');
  await wrapper.get('[data-value="2026-11-06"]').trigger('click');
  expect(wrapper.get('[role="listbox"][data-unit="hour"]')).toBeTruthy();
  await wrapper.get('[role="option"][data-value="10"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="20"][data-unit="minute"]').trigger('click');
  await wrapper.get('[role="option"][data-value="30"][data-unit="second"]').trigger('click');
  const value = wrapper.emitted('update:modelValue')?.at(-1)?.[0];
  expect(value).toBeInstanceOf(Date);
  expect((value as Date).getHours()).toBe(10);
  expect((value as Date).getSeconds()).toBe(30);
});

test('DateTimePicker value-format 支持日期时间字符串和时间戳', async () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, valueFormat: 'YYYY-MM-DD HH:mm:ss', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="2026-11-06"]').trigger('click');
  await wrapper.get('[role="option"][data-value="10"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="20"][data-unit="minute"]').trigger('click');
  await wrapper.get('[role="option"][data-value="30"][data-unit="second"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatch(/2026-11-06/);
  const timestamp = mount(DateTimePicker, { props: { showConfirm: false, valueFormat: 'x', teleported: false } });
  await timestamp.get('input').trigger('click');
  await timestamp.get('[data-value="2026-11-06"]').trigger('click');
  await timestamp.get('[role="option"][data-value="10"][data-unit="hour"]').trigger('click');
  await timestamp.get('[role="option"][data-value="20"][data-unit="minute"]').trigger('click');
  await timestamp.get('[role="option"][data-value="30"][data-unit="second"]').trigger('click');
  expect(typeof timestamp.emitted('update:modelValue')?.at(-1)?.[0]).toBe('number');
});

test('DateTimePicker 手动输入会校验禁用小时分钟和秒', async () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, disabledHours: () => [11], disabledMinutes: (hour: number) => hour === 12 ? [20] : [], disabledSeconds: (hour: number, minute: number) => hour === 12 && minute === 21 ? [30] : [] } });
  await wrapper.get('input').setValue('2026-11-04T11:20:00');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.get('input').setValue('2026-11-04T12:20:00');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.get('input').setValue('2026-11-04T12:21:30');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test('DateTimePicker 转发可见性事件并声明时间禁用属性', async () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, teleported: false, disabledHours: () => [10], disabledMinutes: () => [], disabledSeconds: () => [] } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.emitted('visible-change')?.at(-1)).toEqual([true]);
  expect(wrapper.find('[data-unit="hour"]').exists()).toBe(true);
  expect(wrapper.find('[data-value="10"][data-unit="hour"]').attributes('aria-disabled')).toBe('true');
});

test('DateTimePicker 支持日期时间范围并暴露打开关闭方法', async () => {
  const wrapper = mount(DateTimePicker, { props: { showConfirm: false, range: true, teleported: false } });
  const exposed = wrapper.vm as unknown as { handleOpen: () => void; handleClose: () => void };
  exposed.handleOpen();
  await wrapper.vm.$nextTick();
  expect(wrapper.find('.i-date-picker__dropdown').exists()).toBe(true);
  exposed.handleClose();
  await wrapper.vm.$nextTick();
  expect(wrapper.find('.i-date-picker__dropdown').exists()).toBe(false);
});
