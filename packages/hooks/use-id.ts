import { computed, getCurrentInstance, inject, type InjectionKey, type MaybeRef, type Ref, unref } from 'vue';
export interface IdInjection {
  prefix: number;
  current: number;
}
export const idKey: InjectionKey<IdInjection> = Symbol('id');
const fallback: IdInjection = { prefix: Math.floor(Math.random() * 10000), current: 0 };
export function useId(deterministicId?: MaybeRef<string>): Ref<string> {
  const state = getCurrentInstance() ? inject(idKey, fallback) : fallback;
  return computed(() => unref(deterministicId) || `i-id-${state.prefix}-${state.current++}`);
}
