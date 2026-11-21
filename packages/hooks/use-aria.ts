import { computed, type MaybeRef, unref } from 'vue';
export function useAria(values: Record<string, MaybeRef<string | boolean | undefined>>) {
  return computed(() => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, unref(value)]).filter(([, value]) => value !== undefined)));
}
