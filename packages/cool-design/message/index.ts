import { withInstall } from '../../../src/utils/with-install';
import { withFunctionInstall } from '../../../src/utils/install';
import Component from './message';
import { createMessageService, message } from './service';
export const Message = withInstall(Component);
export const ElMessage = withFunctionInstall(message, '$message', createMessageService);
export default Message;
export type { MessageType } from './message';
export type { MessageHandle, MessageOptions, MessagePlacement } from './service';
