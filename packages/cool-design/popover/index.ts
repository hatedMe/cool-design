import { withInstall } from '../../../src/utils/with-install';
import { ElPopoverDirective } from '../directives';
import Component from './popover';
export const Popover: ReturnType<typeof withInstall<typeof Component>> & { directive: typeof ElPopoverDirective } = Object.assign(withInstall(Component), { directive: ElPopoverDirective });
export default Popover;
export type { PopoverDirectiveValue, PopoverVirtualRef } from './popover';
