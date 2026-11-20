import { withInstall } from '../../../src/utils/with-install';
import Component from './input';
export interface InputInstance {
  readonly input: HTMLInputElement | undefined;
  readonly textarea: HTMLTextAreaElement | undefined;
  readonly ref: HTMLInputElement | HTMLTextAreaElement | undefined;
  readonly textareaStyle: import('vue').StyleValue;
  readonly autosize: boolean | { minRows?: number; maxRows?: number } | undefined;
  readonly isComposing: boolean;
  readonly passwordVisible: boolean;
  resizeTextarea(): void;
  focus(): void;
  blur(): void;
  select(): void;
  resize(): void;
  clear(): void;
}
export const Input = withInstall<typeof Component, InputInstance>(Component);
export default Input;
