import './index.scss';
import { withFunctionInstall } from '../../../src/utils/install';

import notify, { createNotifyService } from './notify';
import NotificationComponent from './notification';
import { withInstall } from '../../../src/utils/with-install';

export const Notify = withFunctionInstall(notify, '$notify', createNotifyService);
export const Notification = withInstall(NotificationComponent);
export default Notify;

export type { NotificationHandle, NotificationOptions, NotificationPosition, NotificationType } from './types';
