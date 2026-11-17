import { withInstall } from '../../../src/utils/with-install';
import Component from './cascader-panel';
import './index.scss';
export type {
  CascaderItemValue,
  CascaderModelValue,
  CascaderNode,
  CascaderNodeValue,
  CascaderOption,
  CascaderPropsMapping
} from '../cascader/types';
export const CascaderPanel = withInstall(Component);
export default CascaderPanel;
