import { computed, inject, type InjectionKey, type MaybeRef, type Ref, unref } from 'vue';
import type { Size } from '../../packages/cool-design/config-provider/context';
export const sizeKey: InjectionKey<Ref<Size | undefined>> = Symbol('size');
export function useSize(size?: MaybeRef<Size | undefined>) {
  const inherited = inject(sizeKey, undefined);
  return computed(() => unref(size) || inherited?.value || 'default');
}
