import type { InjectionKey } from 'vue';
import type { DropdownItemInstance } from './dropdown-item';

export type DropdownTrigger = 'hover' | 'click' | 'contextmenu';
export type DropdownCommand = string | number | Record<string, unknown>;

export interface DropdownContext {
  disabled: boolean;
  role: string;
  id?: string;
  handleCommand: (command: DropdownCommand, instance: DropdownItemInstance, event: MouseEvent | KeyboardEvent) => void;
}

export const dropdownKey: InjectionKey<DropdownContext> = Symbol('i-dropdown');
