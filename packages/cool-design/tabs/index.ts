import './index.scss';
import type { App, VNode } from 'vue';
import { withInstall } from '../../../src/utils/with-install';
import Component from './tabs';
import Pane from './tab-pane';
import type { TabNavInstance, TabsPaneName } from './tabs';

export interface TabsInstance {
  readonly currentName: TabsPaneName;
  readonly tabNavRef: TabNavInstance | undefined;
  setActive(name: TabsPaneName, event?: Event): Promise<void>;
}

export interface TabsSlots {
  default?: (scope: { name: TabsPaneName }) => VNode[];
  'add-icon'?: () => VNode[];
}

export interface TabPaneSlots {
  default?: () => VNode[];
  label?: () => VNode[];
}

type WithSlots<C extends abstract new (...args: never[]) => { $slots: unknown }, Slots> =
  Omit<C, never> & { install(app: App): void } &
  (new (...args: ConstructorParameters<C>) => Omit<InstanceType<C>, '$slots'> & { $slots: Slots });

type InstalledTabs = ReturnType<typeof withInstall<typeof Component, TabsInstance>>;
export const Tabs: WithSlots<InstalledTabs, TabsSlots> = withInstall<typeof Component, TabsInstance>(Component) as WithSlots<InstalledTabs, TabsSlots>;
export const TabPane: WithSlots<typeof Pane, TabPaneSlots> = withInstall(Pane) as WithSlots<typeof Pane, TabPaneSlots>;
export default Tabs;
export type TabsProps = InstanceType<typeof Component>['$props'];
export type TabPaneProps = InstanceType<typeof Pane>['$props'];
export type { TabPane as TabPaneOption, TabBarInstance, TabNavInstance, TabPosition, TabsBeforeLeave, TabsClickPane, TabsEditAction, TabsPaneName, TabsType } from './tabs';
