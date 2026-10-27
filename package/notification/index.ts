import "./index.scss";
import { withFunctionInstall } from "../../src/utils/install";

import notify from "./notify";
import NotificationComponent from "./notification";
import { withInstall } from "../../src/utils/with-install";

export const Notify = withFunctionInstall(notify, "$notify");
export const Notification = withInstall(NotificationComponent);
export default Notify;

export type { NotificationOptions, NotificationType } from "./types";
