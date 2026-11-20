import { withInstall } from '../../../src/utils/with-install';
import Component from './tree-select';
import './index.scss';
export interface TreeSelectInstance {
  focus(): void;
  blur(): void;
}
export const TreeSelect = withInstall<typeof Component, TreeSelectInstance>(Component);
export default TreeSelect;
export type { TreeSelectNode } from './tree-select';
