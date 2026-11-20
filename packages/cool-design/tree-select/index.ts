import { withInstall } from '../../../src/utils/with-install';
import type { SelectInstance } from '../select';
import type { TreeExposed } from '../tree/types';
import Component from './tree-select';
import './index.scss';
export interface TreeSelectInstance extends Pick<TreeExposed,
  'filter' | 'getNode' | 'getCheckedKeys' | 'getCheckedNodes' | 'getHalfCheckedKeys' | 'getHalfCheckedNodes' |
  'setCheckedKeys' | 'setCheckedNodes' | 'setChecked' | 'setCurrentKey' | 'setCurrentNode' | 'getCurrentKey' |
  'getCurrentNode' | 'updateKeyChildren' | 'remove' | 'append' | 'insertBefore' | 'insertAfter'> {
  readonly selectRef: SelectInstance | null | undefined;
  readonly treeRef: TreeExposed | null | undefined;
  readonly selectedLabel: string | string[];
  focus(): void;
  blur(): void;
}
export const TreeSelect = withInstall<typeof Component, TreeSelectInstance>(Component);
export default TreeSelect;
export type { TreeSelectNode } from './tree-select';
