import './index.scss';
import { withInstall } from '../../../src/utils/with-install';
import Component from './tabs';
import Pane from './tab-pane';

export interface TabsInstance {
  setActive(name: string | number, event?: Event): Promise<void>;
}
export const Tabs = withInstall<typeof Component, TabsInstance>(Component);
export const TabPane = withInstall(Pane);
export default Tabs;
export type { TabPane as TabPaneOption, TabsType, TabPosition, TabsEditAction } from './tabs';
