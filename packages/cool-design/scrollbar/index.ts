import { withInstall } from '../../../src/utils/with-install';
import Component from './scrollbar';
import './index.scss';
export type { ScrollbarDirection, ScrollbarStyle } from './scrollbar';
export interface ScrollbarInstance {
  handleScroll(): void;
  scrollTo(options: ScrollToOptions): void;
  scrollTo(x: number, y: number): void;
  setScrollTop(top: number): void;
  setScrollLeft(left: number): void;
  update(): void;
  readonly wrapRef: HTMLElement | null | undefined;
}
export const Scrollbar = withInstall<typeof Component, ScrollbarInstance>(Component);
export default Scrollbar;
