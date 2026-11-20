import { withInstall } from '../../../src/utils/with-install';
import Component from './select';
export interface SelectInstance {
  readonly selectedLabel: string | string[];
  focus(): HTMLElement | undefined;
  blur(): HTMLElement | undefined;
  togglePopperVisible(visible?: boolean): void;
}
export const Select = withInstall<typeof Component, SelectInstance>(Component);
export default Select;
export type { SelectRemoteOption, SelectPropsMapping, SelectTagType } from './select';
