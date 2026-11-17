import { withInstall } from '../../../src/utils/with-install';
import Component from './tree-v2';
import './index.scss';
export type {
  TreeV2CheckedInfo,
  TreeV2Data,
  TreeV2FilterMethod,
  TreeV2Key,
  TreeV2Node,
  TreeV2PropsMapping
} from './types';
export const TreeV2 = withInstall(Component);
export default TreeV2;
