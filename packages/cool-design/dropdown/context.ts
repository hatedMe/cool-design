import type { InjectionKey } from 'vue';

export type DropdownTrigger = 'hover' | 'click' | 'contextmenu';
export type DropdownCommand = string | number | Record<string, unknown>;

export interface DropdownContext {
  hideOnClick: boolean;
  disabled: boolean;
  handleCommand: (command: DropdownCommand) => void;
  close: (reason?: string) => void;
}

export const dropdownKey: InjectionKey<DropdownContext> = Symbol('i-dropdown');
