import { withInstall } from '../../../src/utils/with-install';
import Component from './dialog';
import type { DialogContentInstance } from './dialog-content';
export type { DialogBeforeClose, DialogModalClass } from './dialog';
export type { DialogContentInstance, DialogHeaderScope, DialogSlots } from './dialog-content';
export interface DialogInstance {
  readonly visible: boolean;
  readonly dialogContentRef: DialogContentInstance | undefined;
  handleClose(): void;
  resetPosition(): void;
}
export const Dialog = withInstall<typeof Component, DialogInstance>(Component);
export default Dialog;
