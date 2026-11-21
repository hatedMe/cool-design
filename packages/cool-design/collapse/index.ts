import type { CollapseName } from './context';
import { withInstall } from '../../../src/utils/with-install';
import Component from './collapse';
import Item from './collapse-item';

export interface CollapseInstance {
  readonly activeNames: CollapseName[];
  setActiveNames(names: CollapseName | CollapseName[]): void;
}
export const Collapse = withInstall<typeof Component, CollapseInstance>(Component);
export interface CollapseItemInstance {
  readonly isActive: boolean;
}
export const CollapseItem = withInstall<typeof Item, CollapseItemInstance>(Item);
export default Collapse;
export type { CollapseBeforeCollapse, CollapseIconPosition, CollapseName } from './context';
