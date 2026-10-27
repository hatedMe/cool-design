import { computed, getCurrentInstance, inject, type InjectionKey, type MaybeRef, type Ref, unref } from 'vue';
import type { Size } from '../cool-design/config-provider/context';
export const sizeKey: InjectionKey<Ref<Size | undefined>> = Symbol('size');
export function useSize(size?: MaybeRef<Size | undefined>) {
  const inherited = getCurrentInstance() ? inject(sizeKey, undefined) : undefined;
  return computed(() => unref(size) || inherited?.value || 'default');
}
