import { withInstall } from '../../../src/utils/with-install';
import Component from './menu';
import Item from './menu-item';
import SubMenuComp from './sub-menu';
import ItemGroup from './menu-item-group';

export const Menu = withInstall(Component);
export const MenuItem = withInstall(Item);
export const SubMenu = withInstall(SubMenuComp);
export const MenuItemGroup = withInstall(ItemGroup);
export default Menu;
export type { MenuItem as MenuItemType, MenuItemData, MenuMode, MenuTrigger } from './menu';
export type { MenuItemData as MenuItemOption } from './context';
