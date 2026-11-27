import { withInstall } from '../../../src/utils/with-install';
import Component from './switch';
export interface SwitchInstance {
  focus(): void;
}
export const Switch = withInstall<typeof Component, SwitchInstance>(Component);
export default Switch;
