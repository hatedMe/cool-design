import { withInstall } from '../../../src/utils/with-install';
import Component from './affix';
import './index.scss';
export type { AffixPosition } from './affix';
export interface AffixInstance {
  update(): void;
}
export const Affix = withInstall<typeof Component, AffixInstance>(Component);
export default Affix;
