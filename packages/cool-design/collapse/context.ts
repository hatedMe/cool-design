import type { ComputedRef, InjectionKey, Ref } from 'vue';

export type CollapseName = string | number;
export type CollapseIconPosition = 'left' | 'right';
export type CollapseBeforeCollapse = (next: CollapseName[], name: CollapseName) => boolean | Promise<boolean> | void;
export type CollapseHeader = Ref<HTMLButtonElement | undefined>;

export interface CollapseContext {
  activeNames: Ref<CollapseName[]>;
  toggle: (name: CollapseName) => void;
  register: (header: CollapseHeader) => number;
  unregister: (header: CollapseHeader) => void;
  expandIconPosition: ComputedRef<CollapseIconPosition>;
}

export const collapseKey: InjectionKey<CollapseContext> = Symbol('collapse');
