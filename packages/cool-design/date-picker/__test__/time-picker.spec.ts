import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import TimePicker from '../time-picker';

test('TimePicker 使用 HH:mm 显示并按 value-format 输出', async () => {
  const wrapper = mount(TimePicker, {
    props: { modelValue: '14:30:00', format: 'HH:mm', valueFormat: 'HH:mm' }
  });
  const input = wrapper.get('input');
  expect((input.element as HTMLInputElement).value).toBe('14:30');
  await input.setValue('15:45');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['15:45']);
  expect(wrapper.emitted('change')?.length).toBe(1);
});

test('TimePicker 范围模式使用自定义分隔符并清空为两个空值', async () => {
  const wrapper = mount(TimePicker, {
    props: { modelValue: ['09:00:00', '18:00:00'], isRange: true, rangeSeparator: '-', clearable: true }
  });
  expect(wrapper.get('.i-time-picker__separator').text()).toBe('-');
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[null, null]]);
});

test('TimePicker showConfirm 选择后仅确认时提交，取消回滚草稿', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: true, format: 'HH:mm', valueFormat: 'HH:mm', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[role="option"][data-value="10"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="20"][data-unit="minute"]').trigger('click');
  expect(wrapper.emitted('change')).toBeUndefined();
  expect(wrapper.find('button[aria-label="确认"]').exists()).toBe(true);
  await wrapper.get('button[aria-label="取消"]').trigger('click');
  expect(wrapper.find('.i-time-picker__dropdown').exists()).toBe(false);
});

test('TimePicker saveOnBlur=false 不提交草稿，true 在失焦时提交', async () => {
  const deferred = mount(TimePicker, { props: { showConfirm: true, saveOnBlur: false, format: 'HH:mm', teleported: false } });
  await deferred.get('input').trigger('click');
  await deferred.get('[role="option"][data-value="10"][data-unit="hour"]').trigger('click');
  await deferred.get('[role="option"][data-value="20"][data-unit="minute"]').trigger('click');
  await deferred.get('input').trigger('blur');
  expect(deferred.emitted('change')).toBeUndefined();
  const immediate = mount(TimePicker, { props: { showConfirm: true, saveOnBlur: true, format: 'HH:mm', teleported: false } });
  await immediate.get('input').trigger('click');
  await immediate.get('[role="option"][data-value="10"][data-unit="hour"]').trigger('click');
  await immediate.get('[role="option"][data-value="20"][data-unit="minute"]').trigger('click');
  await immediate.get('input').trigger('blur');
  expect(immediate.emitted('change')?.length).toBe(1);
});

test('TimePicker 手动清空使用 emptyValues 且范围端点独立', async () => {
  const wrapper = mount(TimePicker, { props: { modelValue: ['10:00:00', '11:00:00'], isRange: true, emptyValues: [''], teleported: false } });
  await wrapper.findAll('input')[0].setValue('');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[null, '11:00:00']]);
});

test('TimePicker 真实渲染前缀和清空图标', () => {
  const wrapper = mount(TimePicker, { props: { modelValue: '10:00:00', prefixIcon: 'clock', clearIcon: 'close' } });
  expect(wrapper.find('.i-time-picker__prefix-icon').exists()).toBe(true);
  expect(wrapper.find('.i-time-picker__clear-icon').exists()).toBe(true);
});

test('TimePicker 范围 showConfirm 确认提交完整两个端点', async () => {
  const wrapper = mount(TimePicker, { props: { isRange: true, showConfirm: true, format: 'HH:mm', valueFormat: 'HH:mm', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[role="option"][data-value="09"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="30"][data-unit="minute"]').trigger('click');
  await wrapper.get('[role="option"][data-value="18"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="00"][data-unit="minute"]').trigger('click');
  await wrapper.get('button[aria-label="确认"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['09:30', '18:00']]);
});

test('TimePicker 自定义 emptyValues 输入会触发清空策略', async () => {
  const wrapper = mount(TimePicker, { props: { modelValue: '10:00:00', emptyValues: ['N/A'], valueOnClear: 'cleared' } });
  const input = wrapper.get('input');
  (input.element as HTMLInputElement).value = 'N/A';
  await input.trigger('input');
  await input.trigger('change');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['cleared']);
});

test('TimePicker 原生输入一次操作只提交一次 change', async () => {
  const wrapper = mount(TimePicker);
  await wrapper.get('input').setValue('10:20:30');
  await wrapper.get('input').trigger('change');
  expect(wrapper.emitted('change')?.length).toBe(1);
});

test('TimePicker 显示禁用状态并保留 readonly 与 editable 语义', () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, disabled: true, readonly: true, editable: false } });
  const input = wrapper.get('input').element as HTMLInputElement;
  expect(input.disabled).toBe(true);
  expect(input.readOnly).toBe(true);
});

test('TimePicker 打开面板并选择时分秒后提交时间', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, format: 'HH:mm:ss', valueFormat: 'HH:mm:ss', teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('[role="listbox"][data-unit="hour"]')).toBeTruthy();
  await wrapper.get('[role="option"][data-value="10"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="20"][data-unit="minute"]').trigger('click');
  await wrapper.get('[role="option"][data-value="30"][data-unit="second"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['10:20:30']);
});

test('TimePicker 的禁用时间不能被点击或提交', async () => {
  const wrapper = mount(TimePicker, {
    props: {
      format: 'HH:mm:ss',
      valueFormat: 'HH:mm:ss',
      disabledHours: () => [10],
      disabledMinutes: (hour: number) => (hour === 11 ? [20] : []),
      disabledSeconds: (hour: number, minute: number) => (hour === 11 && minute === 21 ? [30] : []),
      teleported: false
    }
  });
  await wrapper.get('input').trigger('click');
  const hour = wrapper.get('[role="option"][data-value="10"][data-unit="hour"]');
  expect(hour.attributes('aria-disabled')).toBe('true');
  await hour.trigger('click');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.get('[role="option"][data-value="11"][data-unit="hour"]').trigger('click');
  const minute = wrapper.get('[role="option"][data-value="20"][data-unit="minute"]');
  expect(minute.attributes('aria-disabled')).toBe('true');
  await minute.trigger('click');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test('TimePicker 范围模式选择开始和结束时间后提交数组', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, isRange: true, format: 'HH:mm', valueFormat: 'HH:mm', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[role="option"][data-value="09"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="30"][data-unit="minute"]').trigger('click');
  await wrapper.get('[role="option"][data-value="18"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="00"][data-unit="minute"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['09:30', '18:00']]);
});

test('TimePicker 发出 visible-change 并支持 expose 的打开关闭和焦点方法', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, teleported: false }, attachTo: document.body });
  const exposed = wrapper.vm as unknown as { handleOpen: () => void; handleClose: () => void; focus: () => void; blur: () => void };
  exposed.handleOpen();
  await wrapper.vm.$nextTick();
  expect(wrapper.find('.i-time-picker__dropdown').exists()).toBe(true);
  expect(wrapper.emitted('visible-change')?.at(-1)).toEqual([true]);
  exposed.focus();
  expect(document.activeElement).toBe(wrapper.get('input').element);
  exposed.blur();
  expect(document.activeElement).not.toBe(wrapper.get('input').element);
  exposed.handleClose();
  await wrapper.vm.$nextTick();
  expect(wrapper.emitted('visible-change')?.at(-1)).toEqual([false]);
});

test('TimePicker 的 Escape 关闭面板且输入框提供 combobox ARIA', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, teleported: false } });
  const input = wrapper.get('input');
  expect(input.attributes('role')).toBe('combobox');
  expect(input.attributes('aria-haspopup')).toBe('dialog');
  await input.trigger('click');
  await input.trigger('keydown', { key: 'Escape' });
  await wrapper.vm.$nextTick();
  expect(wrapper.find('.i-time-picker__dropdown').exists()).toBe(false);
});

test('TimePicker 面板选择未设置 value-format 时返回 Date', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, format: 'HH:mm', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[role="option"][data-value="10"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="20"][data-unit="minute"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBeInstanceOf(Date);
});

test('TimePicker 面板选择 value-format 为 x 时返回时间戳', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, valueFormat: 'x', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[role="option"][data-value="10"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="20"][data-unit="minute"]').trigger('click');
  await wrapper.get('[role="option"][data-value="30"][data-unit="second"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(new Date('1970-01-01T10:20:30').getTime());
});

test('TimePicker 点击范围结束输入框后编辑结束端点', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, modelValue: ['09:00:00', '18:00:00'], isRange: true, format: 'HH:mm', valueFormat: 'HH:mm', teleported: false } });
  await wrapper.findAll('input')[1].trigger('click');
  await wrapper.get('[role="option"][data-value="19"][data-unit="hour"]').trigger('click');
  await wrapper.get('[role="option"][data-value="00"][data-unit="minute"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['09:00', '19:00']]);
});

test('TimePicker 使用文本输入支持 12 小时格式', () => {
  const wrapper = mount(TimePicker, { props: { modelValue: '15:20:00', format: 'hh:mm A' } });
  expect(wrapper.get('input').attributes('type')).toBe('text');
  expect((wrapper.get('input').element as HTMLInputElement).value).toBe('03:20 PM');
});

test('TimePicker 手动输入在确认前不触发 change', async () => {
  const wrapper = mount(TimePicker);
  const input = wrapper.get('input');
  (input.element as HTMLInputElement).value = '10:20:30';
  await input.trigger('input');
  expect(wrapper.emitted('change')).toBeUndefined();
  await input.trigger('change');
  expect(wrapper.emitted('change')?.length).toBe(1);
});

test('TimePicker arrow-control 显示小时分钟秒调整按钮', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, arrowControl: true, format: 'HH:mm:ss', teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('[aria-label="增加小时"]').exists()).toBe(true);
  expect(wrapper.find('[aria-label="增加分钟"]').exists()).toBe(true);
  expect(wrapper.find('[aria-label="增加秒"]').exists()).toBe(true);
});

test('TimePicker arrow-control 显示时间调整按钮', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, arrowControl: true, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('[aria-label="增加小时"]').exists()).toBe(true);
  expect(wrapper.find('[aria-label="减少小时"]').exists()).toBe(true);
});

test('TimePicker value-on-clear 使用自定义清空值', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, modelValue: '10:20:30', clearable: true, valueOnClear: '00:00:00' } });
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['00:00:00']);
});

test('TimePicker saveOnBlur 默认开启', () => {
  const wrapper = mount(TimePicker);
  expect(wrapper.props('saveOnBlur')).toBe(true);
});

test('TimePicker 默认 placement 为 bottom', () => {
  const wrapper = mount(TimePicker);
  expect(wrapper.props('placement')).toBe('bottom');
});

test('TimePicker change 后紧接 blur 只提交一次', async () => {
  const wrapper = mount(TimePicker);
  const input = wrapper.get('input');
  (input.element as HTMLInputElement).value = '10:20:30';
  await input.trigger('input');
  await input.trigger('change');
  await input.trigger('blur');
  expect(wrapper.emitted('change')?.length).toBe(1);
});

test('TimePicker 手动输入使用输入值校验禁用分钟和秒', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, disabledMinutes: (hour: number) => hour === 11 ? [20] : [], disabledSeconds: (hour: number, minute: number) => hour === 11 && minute === 21 ? [30] : [] } });
  await wrapper.get('input').setValue('11:20:00');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.get('input').setValue('11:21:30');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test('TimePicker 手动输入被禁用的时间不会提交', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, disabledHours: () => [10] } });
  await wrapper.get('input').setValue('10:20:30');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test('TimePicker 相同时间可在两个范围输入框和清空后重复提交', async () => {
  const wrapper = mount(TimePicker, { props: { showConfirm: false, modelValue: ['00:00:00', '00:00:00'], isRange: true, clearable: true } });
  const inputs = wrapper.findAll('input');
  await inputs[0].setValue('10:20:30');
  await inputs[1].setValue('10:20:30');
  expect(wrapper.emitted('update:modelValue')?.length).toBe(2);
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  await wrapper.findAll('input')[0].setValue('10:20:30');
  expect(wrapper.emitted('update:modelValue')?.length).toBe(4);
});
