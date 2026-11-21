import { withInstall } from '../../../src/utils/with-install';
import { ElPopoverDirective } from '../directives';
import type { TooltipInstance } from '../tooltip';
import Component from './popover';
export interface PopoverInstance {
  readonly popperRef: TooltipInstance['popperRef'] | undefined;
  show(): void;
  hide(): void;
  update: TooltipInstance['update'];
  updatePopper: TooltipInstance['updatePopper'];
}
export type PopoverProps = InstanceType<typeof Component>['$props'];
export const Popover: ReturnType<typeof withInstall<typeof Component, PopoverInstance>> & { directive: typeof ElPopoverDirective } = Object.assign(withInstall<typeof Component, PopoverInstance>(Component), { directive: ElPopoverDirective });
export default Popover;
export type { PopoverDirectiveValue, PopoverVirtualRef } from './popover';
