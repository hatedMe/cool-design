import type { CSSProperties, InjectionKey, PropType, Ref, StyleValue, VNode } from 'vue';

export type MenuMode = 'horizontal' | 'vertical';
export type MenuTrigger = 'hover' | 'click';
export type MenuRoute = string | Record<string, unknown>;
export type MenuPopperClass = string | boolean | Record<string, unknown> | MenuPopperClass[];

export interface MenuItemClicked {
  index: string;
  indexPath: string[];
  route?: MenuRoute;
  to?: MenuRoute;
}

// 与 Vue Router 的 NavigationFailure 结构兼容，菜单无需依赖路由包。
export type MenuRouterResult = Promise<void | Error>;

export const menuPopperProps = {
  popperClass: { type: [String, Array, Object, Boolean] as PropType<MenuPopperClass>, default: undefined },
  popperStyle: { type: [String, Array, Object, Boolean] as PropType<StyleValue | boolean>, default: undefined }
};

export interface MenuItemData {
  index: string;
  label: string;
  disabled?: boolean;
  route?: MenuRoute;
  to?: MenuRoute;
  children?: MenuItemData[];
}

export interface MenuContext {
  activeIndex: Ref<string>;
  opened: Ref<string[]>;
  mode: MenuMode;
  collapse: boolean;
  uniqueOpened: boolean;
  menuTrigger: MenuTrigger;
  activeColorVar: string;
  activeTextColor: string;
  themeStyle: CSSProperties;
  popperProps: {
    offset: number;
    effect: string;
    popperClass?: MenuPopperClass;
    popperStyle?: StyleValue | boolean;
    teleported?: boolean;
    persistent: boolean;
    showTimeout: number;
    hideTimeout: number;
  };
  isActive: (index: string) => boolean;
  collapsedClass: (childNamespace: string, element: 'collapsed-button' | 'collapsed-trigger') => string | undefined;
  isOpened: (index: string) => boolean;
  handleSelect: (item: MenuItemClicked) => void;
  handleOpen: (index: string, indexPath: string[]) => void;
  handleClose: (index: string, indexPath: string[]) => void;
  scheduleClose: (index: string, indexPath: string[], delay: number) => void;
  cancelClose: (index: string) => void;
  registerPath: (path: Ref<string[]>) => () => void;
}

interface MenuBranch {
  overflow?: Ref<boolean>;
  expanded: Ref<boolean>;
  hold: () => void;
  leave: (event: MouseEvent) => void;
  popupGroupClass: (childNamespace: string, childMenu: MenuContext | undefined) => string | undefined;
}

export const menuKey: InjectionKey<MenuContext> = Symbol('i-menu');
export const menuPathKey: InjectionKey<Ref<string[]>> = Symbol('i-menu-path');
export const menuBranchKey: InjectionKey<MenuBranch> = Symbol('i-menu-branch');

// 替换 Vue 3.2 的通用插槽索引签名，保留原构造器与静态成员。
export type WithMenuSlots<C extends abstract new (...args: never[]) => { $slots: unknown }, Names extends string> =
  Omit<C, never> & (new (...args: ConstructorParameters<C>) => Omit<InstanceType<C>, '$slots'> & {
    $slots: Readonly<Partial<Record<Names, () => VNode[]>>>;
  });
