import { withInstall } from '../../../src/utils/with-install';
import Component from './time-select';
import './index.scss';
export interface TimeSelectInstance {
  focus(): void;
  blur(): void;
}
export const TimeSelect = withInstall<typeof Component, TimeSelectInstance>(Component);
export default TimeSelect;
