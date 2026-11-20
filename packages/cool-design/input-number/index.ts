import { withInstall } from '../../../src/utils/with-install';
import Component from './input-number';

export interface InputNumberInstance {
  focus(): void;
  blur(): void;
}
export const InputNumber = withInstall<typeof Component, InputNumberInstance>(Component);
export default InputNumber;
