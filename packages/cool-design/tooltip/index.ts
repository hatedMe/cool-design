import { withInstall } from '../../../src/utils/with-install';
import Component from './tooltip';
export interface TooltipInstance {
  show(): void;
  hide(): void;
  update(): void;
  updatePopper(): void;
}
export const Tooltip = withInstall<typeof Component, TooltipInstance>(Component);
export default Tooltip;
