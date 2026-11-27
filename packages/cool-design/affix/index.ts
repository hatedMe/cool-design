import { withInstall } from '../../../src/utils/with-install';
import Component from './affix';
import './index.scss';
export type { AffixPosition, AffixScrollEvent, AffixTargetContainer } from './affix';
export interface AffixInstance {
  update(): void;
  updateRoot(): Promise<void>;
}
export const Affix = withInstall<typeof Component, AffixInstance>(Component);
export type AffixProps = InstanceType<typeof Affix>['$props'];
export default Affix;
