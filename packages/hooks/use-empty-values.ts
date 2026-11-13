import { computed, type MaybeRef, unref } from 'vue';
export const DEFAULT_EMPTY_VALUES = ['', undefined, null];
export function useEmptyValues(options: { emptyValues?: MaybeRef<unknown[]>; valueOnClear?: MaybeRef<unknown> } = {}) {
  const emptyValues = computed(() => unref(options.emptyValues) || DEFAULT_EMPTY_VALUES);
  const valueOnClear = computed(() => unref(options.valueOnClear));
  const isEmptyValue = (value: unknown) => emptyValues.value.some((empty) => Object.is(empty, value));
  return { emptyValues, valueOnClear, isEmptyValue };
}
