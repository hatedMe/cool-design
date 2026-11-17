import { withInstall } from '../../../src/utils/with-install';
import Component from './select-v2';
import './index.scss';
export type { SelectV2Option, SelectV2PropsMapping, SelectV2Value } from './types';
export const SelectV2 = withInstall(Component);
export default SelectV2;
