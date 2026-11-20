import { withInstall } from '../../../src/utils/with-install';
import Component from './mention';
import './index.scss';
export type { MentionFilterOption, MentionOption, MentionOptionProps } from './mention';
export interface MentionInstance {
  readonly input: HTMLInputElement | HTMLTextAreaElement | null | undefined;
  readonly dropdownVisible: boolean;
}
export const Mention = withInstall<typeof Component, MentionInstance>(Component);
export default Mention;
