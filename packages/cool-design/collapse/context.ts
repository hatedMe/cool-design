import type { ComputedRef, InjectionKey, Ref } from 'vue';

export type CollapseName = string | number;
export type CollapseIconPosition = 'left' | 'right';
export type CollapseBeforeCollapse = (next: CollapseName[], name: CollapseName) => boolean | Promise<boolean> | void;

export interface CollapseContext {
  activeNames: Ref<CollapseName[]>;
  toggle: (name: CollapseName) => void;
  register: (uid: symbol) => number;
  unregister: (uid: symbol) => void;
  expandIconPosition: ComputedRef<CollapseIconPosition>;
}

export const collapseKey: InjectionKey<CollapseContext> = Symbol('collapse');
