import { withInstall } from '../../../src/utils/with-install';
import Component from './dialog';
export interface DialogInstance {
  handleClose(): void;
  resetPosition(): void;
}
export const Dialog = withInstall<typeof Component, DialogInstance>(Component);
export default Dialog;
