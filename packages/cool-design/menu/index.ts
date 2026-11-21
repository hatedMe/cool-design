import './index.scss';
import { withInstall, type withInstall as Installed } from '../../../src/utils/with-install';
import Component from './menu';
import Item from './menu-item';
import SubMenuComp from './sub-menu';
import ItemGroup from './menu-item-group';
import type { WithMenuSlots } from './context';

export interface MenuInstance {
  open(index: string): void;
  close(index: string): void;
  updateActiveIndex(index?: string): void;
  handleResize(): void;
}
export interface SubMenuInstance {
  readonly opened: boolean;
}
const InstalledMenu = withInstall<typeof Component, MenuInstance>(Component);
const InstalledSubMenu = withInstall<typeof SubMenuComp, SubMenuInstance>(SubMenuComp);
export const Menu = InstalledMenu as Installed<WithMenuSlots<typeof InstalledMenu, 'default'>>;
export const MenuItem = withInstall(Item) as Installed<WithMenuSlots<typeof Item, 'title' | 'default'>>;
export const SubMenu = InstalledSubMenu as Installed<WithMenuSlots<typeof InstalledSubMenu, 'title' | 'default'>>;
export const MenuItemGroup = withInstall(ItemGroup) as Installed<WithMenuSlots<typeof ItemGroup, 'title' | 'default'>>;
export default Menu;
export type { MenuItem as MenuItemType, MenuItemData, MenuMode, MenuTrigger } from './menu';
export type { MenuItemClicked, MenuItemData as MenuItemOption, MenuPopperClass, MenuRoute, MenuRouterResult } from './context';
