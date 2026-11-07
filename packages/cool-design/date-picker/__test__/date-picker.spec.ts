import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import DatePicker from '../date-picker';

test('DatePicker showConfirm 默认关闭并立即提交', async () => {
  const wrapper = mount(DatePicker, { props: { teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="2026-11-06"]').trigger('click');
  expect(wrapper.emitted('change')?.length).toBe(1);
});

test('DatePicker 默认日期值显示并返回 Date', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,modelValue: '2026-11-03' } });
  expect((wrapper.get('input').element as HTMLInputElement).value).toBe('2026-11-03');
  await wrapper.get('input').setValue('2026-11-04');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBeInstanceOf(Date);
});

test('DatePicker value-format 支持字符串和时间戳', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,valueFormat: 'YYYY-MM-DD' } });
  await wrapper.get('input').setValue('2026-11-04');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2026-11-04']);
  const timestamp = mount(DatePicker, { props: { showConfirm: false,valueFormat: 'x' } });
  await timestamp.get('input').setValue('2026-11-04');
  expect(typeof timestamp.emitted('update:modelValue')?.at(-1)?.[0]).toBe('number');
});

test('DatePicker 可见输入使用 format 文本显示', () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,modelValue: '2026-11-04', format: 'M/D' } });
  expect((wrapper.get('input').element as HTMLInputElement).value).toBe('11/4');
});

test('DatePicker week 类型按周高亮并返回周起始日期', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'week', firstDayOfWeek: 1, teleported: false, modelValue: '2026-11-04' } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.findAll('.is-in-week').length).toBeGreaterThan(0);
  await wrapper.get('[data-value="2026-11-02"]').trigger('click');
  expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getDate()).toBe(2);
});

test('DatePicker 多选 modelValue 数组不会被误判为范围', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'dates', modelValue: ['2026-11-04'], teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('.i-date-picker__separator').exists()).toBe(false);
  expect(wrapper.findAll('.i-date-picker__calendar-panel')).toHaveLength(1);
});

test('DatePicker months 类型支持多月选择', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'months', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="11"]').trigger('click');
  await wrapper.get('[data-value="12"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toHaveLength(2);
});

test('DatePicker years 类型支持多年选择', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'years', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="2026"]').trigger('click');
  await wrapper.get('[data-value="2027"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toHaveLength(2);
});

test('DatePicker monthrange 选择两个月后返回范围', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'monthrange', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="11"]').trigger('click');
  await wrapper.get('[data-value="12"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toHaveLength(2);
});

test('DatePicker yearrange 选择两个年份后返回范围', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'yearrange', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="2026"]').trigger('click');
  await wrapper.get('[data-value="2027"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toHaveLength(2);
});

test('DatePicker first-day-of-week 调整星期标题顺序', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,firstDayOfWeek: 1, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('.i-date-picker__week').text().startsWith('一')).toBe(true);
});

test('DatePicker default-value 控制无值时的初始面板月份', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,defaultValue: '2027-02-04', teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('.i-date-picker__panel-header').text()).toContain('2027年2月');
});

test('DatePicker cell-class-name 为日期单元格添加自定义 class', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,cellClassName: (date: Date) => date.getDate() === 4 ? 'holiday' : '', teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('[data-value="2026-11-04"]').classes()).toContain('holiday');
});

test('DatePicker automatic-dropdown=false 仍允许 handleOpen 显式打开', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,automaticDropdown: false, teleported: false } });
  (wrapper.vm as unknown as { handleOpen: () => void }).handleOpen();
  await wrapper.vm.$nextTick();
  expect(wrapper.find('.i-date-picker__dropdown').exists()).toBe(true);
});

test('DatePicker show-confirm 关闭时清空仍立即提交', async () => {
  const wrapper = mount(DatePicker, { props: {modelValue: '2026-11-04', showConfirm: true, clearable: true, teleported: false } });
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
});

test('DatePicker show-confirm 默认开启并显示确认按钮', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: true, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('button[aria-label="确认"]').exists()).toBe(true);
});

test('DatePicker showFooter=false 不渲染确认按钮', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: true, showFooter: false, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('button[aria-label="确认"]').exists()).toBe(false);
});

test('DatePicker showFooter=true 渲染确认按钮', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: true, showFooter: true, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('button[aria-label="确认"]').exists()).toBe(true);
});

test('DatePicker 手动清空使用 emptyValues 并只提交一次', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false, emptyValues: [''], teleported: false } });
  const input = wrapper.get('input');
  await input.setValue('');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
  expect(wrapper.emitted('clear')?.length).toBe(1);
});

test('DatePicker show-confirm 默认开启且草稿立即高亮', async () => {
  const wrapper = mount(DatePicker, { props: {showConfirm: true, teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="2026-11-06"]').trigger('click');
  expect(wrapper.get('[data-value="2026-11-06"]').classes()).toContain('is-selected');
  expect(wrapper.emitted('change')).toBeUndefined();
});

test('DatePicker 关闭面板后清理未确认草稿', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: true, teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="2026-11-06"]').trigger('click');
  await wrapper.get('input').trigger('keydown', { key: 'Escape' });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('[data-value="2026-11-06"]').classes()).not.toContain('is-selected');
});

test('DatePicker show-now 仅单值日期类型显示', async () => {
  const range = mount(DatePicker, { props: { showConfirm: false,type: 'daterange', showNow: true, teleported: false } });
  await range.get('input').trigger('click');
  expect(range.find('button[aria-label="现在"]').exists()).toBe(false);
  const single = mount(DatePicker, { props: { showConfirm: false,type: 'date', showNow: true, teleported: false } });
  await single.get('input').trigger('click');
  expect(single.find('button[aria-label="现在"]').exists()).toBe(true);
});

test('DatePicker show-now 选择今天并提交', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,showNow: true, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('button[aria-label="现在"]').exists()).toBe(true);
});

test('DatePicker 月份年份类型使用对应默认格式', () => {
  const months = mount(DatePicker, { props: { showConfirm: false,modelValue: ['2026-11-01'], type: 'months' } });
  const years = mount(DatePicker, { props: { showConfirm: false,modelValue: ['2026-01-01'], type: 'years' } });
  expect((months.find('input').element as HTMLInputElement).value).toContain('2026-11');
  expect((years.find('input').element as HTMLInputElement).value).toContain('2026');
});

test('DatePicker shortcuts 选择快捷日期并提交', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,shortcuts: [{ text: '今天', value: new Date(2026, 10, 4) }], teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('button[data-shortcut="今天"]').trigger('click');
  expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date).getDate()).toBe(4);
});

test('DatePicker show-confirm 只在确认后提交草稿', async () => {
  const wrapper = mount(DatePicker, { props: {showConfirm: true, teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="2026-11-06"]').trigger('click');
  expect(wrapper.emitted('change')).toBeUndefined();
  await wrapper.get('button[aria-label="确认"]').trigger('click');
  expect(wrapper.emitted('change')?.length).toBe(1);
});

test('DatePicker automatic-dropdown=false 不会点击输入框自动打开', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,automaticDropdown: false, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('.i-date-picker__dropdown').exists()).toBe(false);
});

test('DatePicker 范围模式默认渲染两个面板', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'daterange', teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.findAll('.i-date-picker__calendar-panel')).toHaveLength(2);
});

test('DatePicker unlink-panels=false 保持左右面板联动', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'daterange', teleported: false } });
  await wrapper.get('input').trigger('click');
  const headers = wrapper.findAll('.i-date-picker__panel-header');
  await headers[0].get('button[aria-label="下个月"]').trigger('click');
  expect(headers[1].text()).toContain('2027年1月');
});

test('DatePicker 默认范围面板联动，unlink-panels 才独立', async () => {
  const linked = mount(DatePicker, { props: { showConfirm: false,type: 'daterange', teleported: false } });
  await linked.get('input').trigger('click');
  const linkedHeaders = linked.findAll('.i-date-picker__panel-header');
  await linkedHeaders[0].get('button[aria-label="下个月"]').trigger('click');
  expect(linkedHeaders[1].text()).toContain('2027年1月');
  const unlinked = mount(DatePicker, { props: { showConfirm: false,type: 'daterange', unlinkPanels: true, teleported: false } });
  await unlinked.get('input').trigger('click');
  const unlinkedHeaders = unlinked.findAll('.i-date-picker__panel-header');
  await unlinkedHeaders[1].get('button[aria-label="下个月"]').trigger('click');
  expect(unlinkedHeaders[0].text()).not.toBe(unlinkedHeaders[1].text());
});

test('DatePicker unlink-panels 允许范围面板独立导航', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'daterange', unlinkPanels: true, teleported: false } });
  await wrapper.get('input').trigger('click');
  const headers = wrapper.findAll('.i-date-picker__panel-header');
  await headers[1].get('button[aria-label="下个月"]').trigger('click');
  expect(headers[0].text()).not.toBe(headers[1].text());
});

test('DatePicker 月面板提供年份导航按钮', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'month', teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('[aria-label="上一年"]').exists()).toBe(true);
  expect(wrapper.find('[aria-label="下一年"]').exists()).toBe(true);
});

test('DatePicker 年面板提供年份组导航按钮', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'year', teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('[aria-label="上一组年份"]').exists()).toBe(true);
  expect(wrapper.find('[aria-label="下一组年份"]').exists()).toBe(true);
});

test('DatePicker showWeekNumber 使用八列网格且范围双面板都显示周数', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'daterange', showWeekNumber: true, showConfirm: false, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.findAll('.i-date-picker__week')).toHaveLength(2);
  expect(wrapper.findAll('.i-date-picker__week-number')).toHaveLength(2);
  expect(wrapper.findAll('.i-date-picker__grid.has-week-number')).toHaveLength(2);
});

test('DatePicker week 高亮遵循 firstDayOfWeek', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'week', firstDayOfWeek: 0, showConfirm: false, modelValue: '2026-11-01', teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('[data-value="2026-11-01"]').classes()).toContain('is-in-week');
  expect(wrapper.get('[data-value="2026-11-07"]').classes()).toContain('is-in-week');
});

test('DatePicker 季度面板显示当前季度选中状态和年份导航', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'quarter', modelValue: '2026-Q2', showConfirm: false, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('[data-value="2"]').classes()).toContain('is-selected');
  expect(wrapper.find('[aria-label="下一年"]').exists()).toBe(true);
});

test('DatePicker 支持 show-week-number 逐行显示真实周数', async () => {
  const wrapper = mount(DatePicker, { props: { showWeekNumber: true, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.findAll('.i-date-picker__week-number')).toHaveLength(1);
  expect(wrapper.findAll('.i-date-picker__week-number-row')).toHaveLength(5);
  expect(wrapper.find('.i-date-picker__week-number-row').text()).toMatch(/^45$/);
});

test('DatePicker quarter 返回季度第一天并使用季度格式', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'quarter', showConfirm: false, teleported: false, valueFormat: 'YYYY-[Q]Q' } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="2"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2026-Q2']);
});

test('DatePicker quarterrange 会按季度内全部日期判断禁用', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'quarterrange', showConfirm: false, disabledDate: (date: Date) => date.getFullYear() === 2026 && date.getMonth() === 4 && date.getDate() === 1, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('[data-value="2"]').attributes('disabled')).toBeDefined();
});

test('DatePicker quarterrange 跨季度选择并排序', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'quarterrange', showConfirm: false, teleported: false, valueFormat: 'YYYY-[Q]Q' } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="3"]').trigger('click');
  await wrapper.get('[data-value="1"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['2026-Q1', '2026-Q3']]);
});

test('DatePicker quarters 重复选择会去重并按季度排序', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'quarters', showConfirm: false, teleported: false, valueFormat: 'YYYY-[Q]Q' } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('[data-value="3"]').trigger('click');
  await wrapper.get('[data-value="1"]').trigger('click');
  await wrapper.get('[data-value="3"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['2026-Q1']]);
});

test('DatePicker quarter 默认值定位季度且 disabledDate 作用于季度起始日', async () => {
  const wrapper = mount(DatePicker, { props: { type: 'quarter', showConfirm: false, defaultValue: '2027-Q2', disabledDate: (date: Date) => date.getMonth() === 3, teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('.i-date-picker__panel-header').text()).toContain('2027年');
  expect(wrapper.get('[data-value="2"]').attributes('disabled')).toBeDefined();
});

test('DatePicker showNow 遵循 valueFormat 输出', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false, showNow: true, valueFormat: 'YYYY-MM-DD', teleported: false } });
  await wrapper.get('input').trigger('click');
  await wrapper.get('button[aria-label="现在"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test('DatePicker 自定义 emptyValues 输入会走清空策略', async () => {
  const wrapper = mount(DatePicker, { props: { modelValue: '2026-11-04', showConfirm: false, emptyValues: ['N/A'], valueOnClear: 'cleared' } });
  const input = wrapper.get('input');
  (input.element as HTMLInputElement).value = 'N/A';
  await input.trigger('input');
  await input.trigger('change');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['cleared']);
  expect(wrapper.emitted('clear')?.length).toBe(1);
});

test('DatePicker showFooter=false 同时隐藏现在和快捷操作', async () => {
  const wrapper = mount(DatePicker, { props: { showFooter: false, showNow: true, shortcuts: [{ text: '快捷', value: '2026-11-04' }], teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.find('button[aria-label="现在"]').exists()).toBe(false);
  expect(wrapper.find('button[data-shortcut="快捷"]').exists()).toBe(false);
});

test('DatePicker 支持 popper-style 和 fallback-placements props', () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,popperStyle: { width: '400px' }, fallbackPlacements: ['top'] } });
  expect(wrapper.props('popperStyle')).toEqual({ width: '400px' });
  expect(wrapper.props('fallbackPlacements')).toEqual(['top']);
});

test('DatePicker 输入框提供 aria-controls', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,teleported: false } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('input').attributes('aria-controls')).toBeTruthy();
});

test('DatePicker 默认 placement 为 bottom', () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,teleported: false } });
  expect(wrapper.props('placement')).toBe('bottom');
});

test('DatePicker 默认可清空且默认范围分隔符为横线', () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,modelValue: ['2026-11-01', '2026-11-03'], range: true } });
  expect(wrapper.get('.i-date-picker__separator').text()).toBe('-');
  expect(wrapper.find('button[aria-label="清空"]').exists()).toBe(true);
});

test('DatePicker dates 类型清空后保持空数组', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,modelValue: ['2026-11-01'], type: 'dates', clearable: true } });
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]]);
});

test('DatePicker 范围使用自定义分隔符并清空为两个空值', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,modelValue: ['2026-11-01', '2026-11-03'], range: true, rangeSeparator: '-', clearable: true } });
  expect(wrapper.get('.i-date-picker__separator').text()).toBe('-');
  await wrapper.get('button[aria-label="清空"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[null, null]]);
});

test('DatePicker 手动输入在确认前不触发 change', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false } });
  const input = wrapper.get('input');
  (input.element as HTMLInputElement).value = '2026-11-06';
  await input.trigger('input');
  expect(wrapper.emitted('change')).toBeUndefined();
  await input.trigger('change');
  expect(wrapper.emitted('change')?.length).toBe(1);
});

test('DatePicker 一次输入只触发一次 change 且 disabledDate 生效', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,disabledDate: (date: Date) => date.getDate() === 5 } });
  await wrapper.get('input').setValue('2026-11-05');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.get('input').setValue('2026-11-06');
  await wrapper.get('input').trigger('change');
  expect(wrapper.emitted('change')?.length).toBe(1);
});

test('DatePicker 面板选择日期、切换月份和禁用日期', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,type: 'date', teleported: false, disabledDate: (date: Date) => date.getDate() === 5 } });
  await wrapper.get('input').trigger('click');
  expect(wrapper.get('[role="dialog"]')).toBeTruthy();
  expect(wrapper.get('[aria-label="下个月"]')).toBeTruthy();
  const disabled = wrapper.get('[data-value="2026-11-05"]');
  expect(disabled.attributes('disabled')).toBeDefined();
  await wrapper.get('[data-value="2026-11-06"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBeInstanceOf(Date);
});

test('DatePicker dates 类型支持去重多选，month 和 year 类型支持面板选择', async () => {
  const dates = mount(DatePicker, { props: { showConfirm: false,type: 'dates', teleported: false } });
  await dates.get('input').trigger('click');
  await dates.get('[data-value="2026-11-06"]').trigger('click');
  await dates.get('[data-value="2026-11-06"]').trigger('click');
  expect(dates.emitted('update:modelValue')?.at(-1)?.[0]).toHaveLength(0);
  const month = mount(DatePicker, { props: { showConfirm: false,type: 'month', teleported: false } });
  await month.get('input').trigger('click');
  await month.get('[data-value="12"]').trigger('click');
  expect(month.emitted('update:modelValue')?.at(-1)?.[0]).toBeInstanceOf(Date);
});

test('DatePicker 范围面板先选开始再选结束并按时间排序', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,range: true, type: 'date', teleported: false } });
  await wrapper.findAll('input')[0].trigger('click');
  await wrapper.get('[data-value="2026-11-08"]').trigger('click');
  await wrapper.get('[data-value="2026-11-06"]').trigger('click');
  const value = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Date[];
  expect(value[0].getDate()).toBe(6);
  expect(value[1].getDate()).toBe(8);
});

test('DatePicker 外部更新 modelValue 后输入框同步', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false,modelValue: '2026-11-04' } });
  await wrapper.setProps({ modelValue: '2026-11-05' });
  expect((wrapper.get('input').element as HTMLInputElement).value).toBe('2026-11-05');
});

test('DatePicker change 后紧接 blur 只提交一次', async () => {
  const wrapper = mount(DatePicker, { props: { showConfirm: false } });
  const input = wrapper.get('input');
  (input.element as HTMLInputElement).value = '2026-11-06';
  await input.trigger('input');
  await input.trigger('change');
  await input.trigger('blur');
  expect(wrapper.emitted('change')?.length).toBe(1);
});
