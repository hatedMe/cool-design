import { withInstall } from '../../../src/utils/with-install';
import Component from './text';
import './index.scss';
export type { TextSize, TextType } from './text';
export interface TextInstance {
  readonly isTruncated: boolean;
}
export const Text = withInstall<typeof Component, TextInstance>(Component);
export type TextProps = InstanceType<typeof Component>['$props'];
export default Text;
