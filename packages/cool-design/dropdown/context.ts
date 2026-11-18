import type { InjectionKey } from 'vue';

export type DropdownTrigger = 'hover' | 'click' | 'contextmenu';
export type DropdownCommand = string | number | Record<string, unknown>;

export interface DropdownContext {
  hideOnClick: boolean;
  disabled: boolean;
  role: string;
  handleCommand: (command: DropdownCommand, instance?: unknown) => void;
  close: (reason?: string) => void;
}

export const dropdownKey: InjectionKey<DropdownContext> = Symbol('i-dropdown');
