import type { CascaderNode } from './types';
import { withInstall } from '../../../src/utils/with-install';
import './index.scss';
import _Cascader from './cascader';

export interface CascaderInstance {
  focus(): void;
  blur(): void;
  togglePopperVisibility(visible?: boolean): void;
  getCheckedNodes(leafOnly?: boolean): CascaderNode[];
}
export const Cascader = withInstall<typeof _Cascader, CascaderInstance>(_Cascader);
export default Cascader;
export type {
  CascaderFilterMethod,
  CascaderItemValue,
  CascaderLazyLoad,
  CascaderLazyNode,
  CascaderModelValue,
  CascaderNode,
  CascaderNodePath,
  CascaderNodeValue,
  CascaderOption,
  CascaderPropsMapping
} from './types';
