import { withInstall } from '../../../src/utils/with-install';
import DatePickerComponent from './date-picker';
import TimePickerComponent from './time-picker';
import DateTimePickerComponent from './date-time-picker';
import CalendarComponent from './calendar';
import type { CalendarSelectDateType } from './calendar';
import type { DateValue } from './date';

export interface DatePickerInstance {
  focus(): void;
  blur(): void;
  handleOpen(): void;
  handleClose(): void;
}
export type DateTimePickerInstance = DatePickerInstance;
export type TimePickerInstance = DatePickerInstance;
export interface CalendarInstance {
  readonly selectedDay: Date | null;
  pickDay(day: DateValue): void;
  selectDate(type: CalendarSelectDateType): void;
  calculateValidatedDateRange(start: DateValue | null | undefined, end: DateValue | null | undefined): Date[];
}
export const DatePicker = withInstall<typeof DatePickerComponent, DatePickerInstance>(DatePickerComponent);
export const TimePicker = withInstall<typeof TimePickerComponent, TimePickerInstance>(TimePickerComponent);
export const DateTimePicker = withInstall<typeof DateTimePickerComponent, DateTimePickerInstance>(DateTimePickerComponent);
export const Calendar = withInstall<typeof CalendarComponent, CalendarInstance>(CalendarComponent);
export type { DatePickerType } from './date-picker';
export { DatePickerComponent, TimePickerComponent, DateTimePickerComponent, CalendarComponent };
export default DatePicker;
