import { withInstall } from '../../../src/utils/with-install';
import Component from './anchor';
import Link from './anchor-link';
import './index.scss';
export type { AnchorContainer, AnchorDirection, AnchorType } from './anchor';
export type { AnchorContext } from './context';
export interface AnchorInstance {
  scrollTo(href: string): void;
}
export const Anchor = withInstall<typeof Component, AnchorInstance>(Component);
export const AnchorLink = withInstall(Link);
export default Anchor;
