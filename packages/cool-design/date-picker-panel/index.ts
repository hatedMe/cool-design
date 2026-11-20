import { withInstall } from '../../../src/utils/with-install';
import Component, { type DatePickerPanelSlots } from './date-picker-panel';
import './index.scss';

export const DatePickerPanel = withInstall<typeof Component, { $slots: DatePickerPanelSlots }>(Component);
export default DatePickerPanel;
export { datePickerPanelProps, datePickerPanelEmits } from './date-picker-panel';
export type {
  DatePickerPanelCalendarRange, DatePickerPanelEmits, DatePickerPanelModelValue, DatePickerPanelNavigation,
  DatePickerPanelProps, DatePickerPanelShortcut, DatePickerPanelSlots, DatePickerPanelTimeRules
} from './date-picker-panel';
export type { DatePickerPanelCell } from '../date-picker/date-picker-panel';
export type DatePickerPanelInstance = InstanceType<typeof DatePickerPanel>;
