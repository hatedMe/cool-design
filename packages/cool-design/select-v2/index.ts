import { withInstall } from '../../../src/utils/with-install';
import Component from './select-v2';
import './index.scss';
export type { SelectV2FilterMethod, SelectV2OptionFilterMethod, SelectV2RemoteMethod, SelectV2Option, SelectV2PropsMapping, SelectV2Value } from './types';
export interface SelectV2Instance {
  focus(): void;
  blur(): void;
}
export const SelectV2 = withInstall<typeof Component, SelectV2Instance>(Component);
export default SelectV2;
