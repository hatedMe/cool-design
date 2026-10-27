export type DateValue = string | number | Date;

export const pad = (value: number) => String(value).padStart(2, '0');

export const toDate = (value: DateValue | null | undefined): Date | null => {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  const date = typeof value === 'number' ? new Date(value) : new Date(String(value).replace(/-/g, '/'));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const dateInputValue = (value: DateValue | null | undefined, withTime = false) => {
  const date = toDate(value);
  if (!date) return '';
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return withTime ? `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
};

export const timeInputValue = (value: DateValue | null | undefined) => {
  const date = toDate(value);
  if (!date) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const formatDate = (value: DateValue | null | undefined, format = 'YYYY-MM-DD') => {
  const date = toDate(value);
  if (!date) return '';
  return format
    .replace(/YYYY/g, String(date.getFullYear()))
    .replace(/MM/g, pad(date.getMonth() + 1))
    .replace(/DD/g, pad(date.getDate()))
    .replace(/HH/g, pad(date.getHours()))
    .replace(/mm/g, pad(date.getMinutes()))
    .replace(/ss/g, pad(date.getSeconds()));
};

export const emitValue = (input: string, valueFormat?: string, withTime = false): DateValue | null => {
  if (!input) return null;
  const date = toDate(input);
  if (!date) return input;
  if (valueFormat === 'x') return date.getTime();
  if (valueFormat === 'timestamp') return date.getTime();
  if (valueFormat) return formatDate(date, valueFormat);
  return withTime ? date : date;
};

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const monthLabel = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月`;
