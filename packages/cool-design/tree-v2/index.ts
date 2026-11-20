import type { TreeV2Exposed } from './types';
import { withInstall } from '../../../src/utils/with-install';
import Component from './tree-v2';
import './index.scss';
export type {
  TreeV2CheckedInfo,
  TreeV2Data,
  TreeV2Exposed,
  TreeV2FilterMethod,
  TreeV2Key,
  TreeV2Node,
  TreeV2PropsMapping
} from './types';
export type TreeV2Instance = TreeV2Exposed;
export const TreeV2 = withInstall<typeof Component, TreeV2Instance>(Component);
export default TreeV2;
