import { withInstall } from '../../../src/utils/with-install';
import Component from './tabs';
import Pane from './tab-pane';

export const Tabs = withInstall(Component);
export const TabPane = withInstall(Pane);
export default Tabs;
export type { TabPane as TabPaneOption, TabsType, TabPosition, TabsEditAction } from './tabs';
