import { withInstall } from '../../../src/utils/with-install';
import Component from './message-box';
import { alert, confirm, msgbox, prompt } from './confirm';
export { useMessageBox, alert, confirm, msgbox, prompt } from './confirm';
export type {
  MessageBoxAction,
  MessageBoxBeforeClose,
  MessageBoxInstance,
  MessageBoxOptions,
  MessageBoxPromptResult,
  MessageBoxType
} from './types';
export const MessageBox = Object.assign(withInstall(Component), { msgbox, alert, confirm, prompt });
export default MessageBox;
