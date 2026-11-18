import type { App, AppContext } from 'vue';
import { withInstall } from '../../../src/utils/with-install';
import Component from './message-box';
import { alert, closeAll, confirm, msgbox, prompt } from './confirm';
export { useMessageBox, alert, confirm, msgbox, prompt } from './confirm';
export type {
  MessageBoxAction,
  MessageBoxBeforeClose,
  MessageBoxInstance,
  MessageBoxOptions,
  MessageBoxPromptResult,
  MessageBoxType
} from './types';

/** MessageBox 直接调用的参数类型：与 msgbox 一致 */
type MessageBoxCallOptions = Parameters<typeof msgbox>[0];

/** 声明式组件（带安装器），供模板中使用 */
const MessageBoxComponent = withInstall(Component);

/**
 * MessageBox 可直接调用（等价于 msgbox），同时保留
 * msgbox / alert / confirm / prompt 便捷方法、close 静态方法与组件注册能力。
 */
const MessageBox = Object.assign(
  (options: MessageBoxCallOptions, appContext: AppContext | null = null) => msgbox(options, appContext),
  {
    msgbox,
    alert,
    confirm,
    prompt,
    close: closeAll,
    install: (app: App) => MessageBoxComponent.install(app)
  }
);

export { MessageBoxComponent, closeAll as closeAllMessageBoxes };
export default MessageBox;
