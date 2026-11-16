import { withInstall } from '../../../src/utils/with-install';
import Component from './collapse';
import Item from './collapse-item';

export const Collapse = withInstall(Component);
export const CollapseItem = withInstall(Item);
export default Collapse;
export type { CollapseBeforeCollapse, CollapseIconPosition, CollapseName } from './context';
