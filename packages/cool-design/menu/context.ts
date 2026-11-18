import type { InjectionKey, Ref } from 'vue';

export type MenuMode = 'horizontal' | 'vertical';
export type MenuTrigger = 'hover' | 'click';

export interface MenuItemData {
  index: string;
  label: string;
  disabled?: boolean;
  route?: string | Record<string, unknown>;
  to?: string | Record<string, unknown>;
  children?: MenuItemData[];
}

export interface MenuContext {
  activeIndex: Ref<string>;
  opened: Ref<string[]>;
  mode: MenuMode;
  collapse: boolean;
  uniqueOpened: boolean;
  menuTrigger: MenuTrigger;
  popperProps: {
    offset: number | undefined;
    effect: 'light' | 'dark';
    popperClass: string;
    teleported: boolean;
    showTimeout: number;
    hideTimeout: number;
  };
  isActive: (index: string) => boolean;
  isOpened: (index: string) => boolean;
  handleSelect: (index: string, indexPath: string[], item?: unknown) => void;
  handleOpen: (index: string, indexPath: string[]) => void;
  handleClose: (index: string, indexPath: string[]) => void;
}

export const menuKey: InjectionKey<MenuContext> = Symbol('i-menu');
export const menuPathKey: InjectionKey<string[]> = Symbol('i-menu-path');
