import './index.scss';
import { withInstall } from '../../../src/utils/with-install';
import Component from './drawer';
export type { DrawerBeforeClose, DrawerDirection, DrawerResizableOptions, DrawerResizePayload } from './drawer';
export interface DrawerInstance {
  handleClose(): void;
}
export const Drawer = withInstall<typeof Component, DrawerInstance>(Component);
export default Drawer;
