import { expect, test } from 'vitest';
import { emitValue, formatDate, getWeekNumber, parseFormattedDate, toDate } from '../date';

test('日期内核拒绝非法日期并保留闰年日期', () => {
  expect(toDate('2026-02-29')).toBeNull();
  expect(toDate('2026-02-31')).toBeNull();
  expect(toDate('2024-02-29')?.getDate()).toBe(29);
});

test('日期格式支持常用长短 token 且不会改写普通文本', () => {
  const date = new Date(2026, 10, 4, 15, 6, 7);
  expect(formatDate(date, 'M/D H:m:s A')).toBe('11/4 15:6:7 PM');
  expect(formatDate(date, '[day] YYYY-MM-DD')).toBe('day 2026-11-04');
});

test('week number 遵循统一跨年周规则', () => {
  expect(getWeekNumber(new Date(2020, 11, 28), 1)).toBe(53);
  expect(getWeekNumber(new Date(2021, 0, 1), 1)).toBe(53);
  expect(getWeekNumber(new Date(2021, 0, 3), 0)).toBe(2);
});

test('日期格式支持 12 小时制 h/hh 和 AM/PM', () => {
  const date = new Date(2026, 10, 4, 15, 6, 7);
  expect(formatDate(date, 'hh:mm:ss A')).toBe('03:06:07 PM');
  expect(parseFormattedDate('03:06:07 PM', 'hh:mm:ss A')?.getHours()).toBe(15);
});

test('日期格式解析支持显示格式并严格校验', () => {
  expect(parseFormattedDate('11/4/2026', 'M/D/YYYY')?.getDate()).toBe(4);
  expect(parseFormattedDate('2026/02/31', 'YYYY/MM/DD')).toBeNull();
});

test('日期值支持毫秒和秒时间戳输出', () => {
  expect(typeof emitValue('2026-11-04', 'x')).toBe('number');
  expect(typeof emitValue('2026-11-04', 'X')).toBe('number');
});
