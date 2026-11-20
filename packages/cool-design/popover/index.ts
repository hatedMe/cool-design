import { withInstall } from '../../../src/utils/with-install';
import { ElPopoverDirective } from '../directives';
import Component from './popover';
export interface PopoverInstance {
  show(): void;
  hide(): void;
  update(): void;
  updatePopper(): void;
}
export const Popover: ReturnType<typeof withInstall<typeof Component, PopoverInstance>> & { directive: typeof ElPopoverDirective } = Object.assign(withInstall<typeof Component, PopoverInstance>(Component), { directive: ElPopoverDirective });
export default Popover;
export type { PopoverDirectiveValue, PopoverVirtualRef } from './popover';
