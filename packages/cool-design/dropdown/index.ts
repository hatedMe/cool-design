import './index.scss';
import type { App } from 'vue';
import { withInstall } from '../../../src/utils/with-install';
import Component from './dropdown';
import Menu from './dropdown-menu';
import Item from './dropdown-item';
import type { WithSlots } from './slots';

export interface DropdownInstance {
  handleOpen(): void;
  handleClose(): void;
}
type Install = { install: (app: App) => void };
type InstalledDropdown = ReturnType<typeof withInstall<typeof Component, DropdownInstance>>;

export const Dropdown = withInstall<typeof Component, DropdownInstance>(Component) as WithSlots<InstalledDropdown, 'default' | 'dropdown'> & Install;
export const DropdownMenu = withInstall(Menu) as WithSlots<typeof Menu, 'default'> & Install;
export const DropdownItem = withInstall(Item);
export default Dropdown;
export type DropdownProps = InstanceType<typeof Component>['$props'];
export type { DropdownItem as DropdownItemOption, DropdownSize, DropdownPlacement, DropdownType } from './dropdown';
export type { DropdownItemInstance } from './dropdown-item';
export type { DropdownTrigger, DropdownCommand } from './context';
