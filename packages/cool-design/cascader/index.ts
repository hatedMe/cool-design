import { withInstall } from '../../../src/utils/with-install';
import './index.scss';
import _Cascader from './cascader';

export const Cascader = withInstall(_Cascader);
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
