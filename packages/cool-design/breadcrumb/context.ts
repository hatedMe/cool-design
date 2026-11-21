import type { InjectionKey, Ref, Slot } from 'vue';

export interface BreadcrumbContext {
  separator: string;
  separatorIcon: string | Record<string, unknown> | undefined;
  separatorSlot?: Slot;
  register: (uid: number) => void;
  unregister: (uid: number) => void;
  isLast: (uid: number) => boolean;
  items: Ref<number[]>;
}

export const breadcrumbKey: InjectionKey<BreadcrumbContext> = Symbol('i-breadcrumb');
