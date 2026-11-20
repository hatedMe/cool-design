import { withInstall } from '../../../src/utils/with-install';
import Component from './input-tag';
import './index.scss';
export type { InputTagTagEffect, InputTagTagType, InputTagTrigger } from './input-tag';
export interface InputTagInstance {
  focus(): void;
  blur(): void;
}
export const InputTag = withInstall<typeof Component, InputTagInstance>(Component);
export default InputTag;
