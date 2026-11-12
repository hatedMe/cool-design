import { withInstall } from '../../../src/utils/with-install';
import Component from './tree';
import './index.scss';

export const Tree = withInstall(Component);
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
