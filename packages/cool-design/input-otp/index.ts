import { withInstall } from '../../../src/utils/with-install';
import Component from './input-otp';
import './index.scss';
export type { InputOtpSeparator, InputOtpType } from './input-otp';
export interface InputOtpInstance {
  focus(): void;
  blur(): void;
  readonly inputRefs: HTMLInputElement[];
}
export const InputOtp = withInstall<typeof Component, InputOtpInstance>(Component);
export default InputOtp;
