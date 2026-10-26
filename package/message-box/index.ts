import { withInstall } from "../../src/utils/with-install";
import Component from "./message-box";
import { confirm } from "./confirm";
export { useMessageBox } from "./confirm";
export type { MessageBoxAction, MessageBoxOptions } from "./types";
export const MessageBox = Object.assign(withInstall(Component), { confirm });
export default MessageBox;
