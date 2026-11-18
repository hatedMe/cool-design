import './index.scss';
import { withInstall } from '../../../src/utils/with-install';
import Component from './dropdown';
import Menu from './dropdown-menu';
import Item from './dropdown-item';

export const Dropdown = withInstall(Component);
export const DropdownMenu = withInstall(Menu);
export const DropdownItem = withInstall(Item);
export default Dropdown;
export type { DropdownItem as DropdownItemOption, DropdownSize, DropdownPlacement } from './dropdown';
export type { DropdownTrigger, DropdownCommand } from './context';
