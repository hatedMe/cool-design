import { withInstall } from '../../../src/utils/with-install';
import Component from './tree';
import './index.scss';

import type { TreeExposed } from './types';
export type { TreeExposed as TreeInstance } from './types';
export const Tree = withInstall<typeof Component, TreeExposed>(Component);
export default Tree;
export type {
  TreeAllowDrag,
  TreeAllowDrop,
  TreeBooleanFunction,
  TreeCheckedInfo,
  TreeData,
  TreeDropType,
  TreeExposed,
  TreeFilterMethod,
  TreeKey,
  TreeLabelFunction,
  TreeLoadFunction,
  TreeNode,
  TreeNodeParam,
  TreePropsMapping,
  TreeRenderContent
} from './types';
