import { withInstall } from '../../../src/utils/with-install';
import Component from './mention';
import './index.scss';
export type { MentionFilterOption, MentionOption, MentionOptionProps } from './mention';
export const Mention = withInstall(Component);
export default Mention;
