import dayjs, { type ConfigType, type Dayjs } from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isoWeek from 'dayjs/plugin/isoWeek';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';

 dayjs.extend(advancedFormat);
 dayjs.extend(customParseFormat);
 dayjs.extend(isoWeek);
 dayjs.extend(localizedFormat);
 dayjs.extend(quarterOfYear);
 dayjs.extend(weekOfYear);

export type DateValue = string | number | Date;
export type TimeParts = { hour: number; minute: number; second: number };

export const pad = (value: number) => String(value).padStart(2, '0');

const toDayjs = (value: DateValue | null | undefined): Dayjs | null => {
  if (value == null || value === '') return null;
  if (typeof value === 'string') {
    const quarter = value.match(/^(\d{4})-Q([1-4])$/i);
    if (quarter) return dayjs(new Date(Number(quarter[1]), (Number(quarter[2]) - 1) * 3, 1));
    const formats = value.includes('T') || value.includes(' ') ? ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'] : ['YYYY-MM-DD', 'YYYY-MM'];
    const strict = formats.map((format) => dayjs(value, format, true)).find((date) => date.isValid());
    return strict || null;
  }
  const date = dayjs(value as ConfigType);
  return date.isValid() ? date : null;
};

const strictDate = (value: string, format?: string): Dayjs | null => {
  if (!format) return toDayjs(value);
  const date = dayjs(value, format, true);
  return date.isValid() ? date : null;
};

export const toDate = (value: DateValue | null | undefined): Date | null => {
  const date = toDayjs(value);
  return date ? date.toDate() : null;
};

export const parseFormattedDate = (value: string, format = 'YYYY-MM-DD'): Date | null => {
  const date = strictDate(value, format);
  return date?.toDate() || null;
};

export const dateInputValue = (value: DateValue | null | undefined, withTime = false) => {
  const date = toDayjs(value);
  if (!date) return '';
  return date.format(withTime ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD');
};

export const parseTimeParts = (value: DateValue | null | undefined): TimeParts | null => {
  if (value == null || value === '') return null;
  const text = typeof value === 'string' ? value : undefined;
  const timeMatch = text?.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?/);
  if (timeMatch) {
    let hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    const second = Number(timeMatch[3] || 0);
    const meridiem = timeMatch[4]?.toLowerCase();
    if (meridiem) {
      if (meridiem === 'pm' && hour < 12) hour += 12;
      if (meridiem === 'am' && hour === 12) hour = 0;
    }
    return hour < 24 && minute < 60 && second < 60 ? { hour, minute, second } : null;
  }
  const date = toDayjs(value);
  if (!date) return null;
  return { hour: date.hour(), minute: date.minute(), second: date.second() };
};

export const formatTimeParts = (parts: TimeParts | null, format = 'HH:mm:ss') => {
  if (!parts) return '';
  return dayjs().hour(parts.hour).minute(parts.minute).second(parts.second).format(format);
};

export const timeInputValue = (value: DateValue | null | undefined, format = 'HH:mm:ss') =>
  formatTimeParts(parseTimeParts(value), format);

export const formatDate = (value: DateValue | null | undefined, format = 'YYYY-MM-DD') => {
  const date = toDayjs(value);
  return date ? date.format(format) : '';
};

export const emitValue = (input: string, valueFormat?: string, withTime = false): DateValue | null => {
  if (!input) return null;
  const date = withTime ? strictDate(input, 'YYYY-MM-DDTHH:mm:ss') || toDayjs(input) : toDayjs(input);
  if (!date) return input;
  if (valueFormat === 'x') return date.valueOf();
  if (valueFormat === 'X') return date.unix();
  if (valueFormat === 'timestamp') return date.valueOf();
  if (valueFormat) return date.format(valueFormat);
  return date.toDate();
};

export const sameDay = (a: Date, b: Date) => dayjs(a).isSame(dayjs(b), 'day');
export const monthLabel = (date: Date) => dayjs(date).format('YYYY年M月');
export const getWeekStart = (value: DateValue, firstDayOfWeek = 1) => {
  const date = dayjs(value);
  const offset = (date.day() - firstDayOfWeek + 7) % 7;
  return date.subtract(offset, 'day').startOf('day').toDate();
};
export const getWeekNumber = (value: DateValue, firstDayOfWeek = 1) => {
  const date = dayjs(value);
  if (firstDayOfWeek === 1) return date.isoWeek();
  const startOfWeek = (current: Dayjs) => current.subtract((current.day() - firstDayOfWeek + 7) % 7, 'day').startOf('day');
  const firstWeek = startOfWeek(dayjs(`${date.year()}-01-01`, 'YYYY-MM-DD'));
  const currentWeek = startOfWeek(date);
  return Math.floor(currentWeek.diff(firstWeek, 'day') / 7) + 1;
};
export const getQuarter = (value: DateValue) => dayjs(value).quarter();
