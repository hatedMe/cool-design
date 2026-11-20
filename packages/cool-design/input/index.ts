import { withInstall } from '../../../src/utils/with-install';
import Component from './input';
export interface InputInstance {
  focus(): void;
  blur(): void;
  select(): void;
  resize(): void;
  clear(): void;
}
export const Input = withInstall<typeof Component, InputInstance>(Component);
export default Input;
