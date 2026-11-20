import { computed, type MaybeRef, unref } from 'vue';
import { useConfig } from '../cool-design/config-provider/context';
export const DEFAULT_EMPTY_VALUES = ['', undefined, null];
export function useEmptyValues(options: { emptyValues?: MaybeRef<unknown[] | undefined>; valueOnClear?: MaybeRef<unknown> } = {}) {
  const config = useConfig();
  const emptyValues = computed(() => unref(options.emptyValues) ?? config.value.emptyValues ?? DEFAULT_EMPTY_VALUES);
  const valueOnClear = computed(() => {
    const local = unref(options.valueOnClear);
    return local !== undefined ? local : config.value.valueOnClear;
  });
  const getValueOnClear = (defaultValue?: unknown) => {
    const value = valueOnClear.value;
    if (typeof value === 'function') return value();
    return value === undefined ? defaultValue : value;
  };
  const isEmptyValue = (value: unknown) => emptyValues.value.some((empty) => Object.is(empty, value));
  return { emptyValues, valueOnClear, getValueOnClear, isEmptyValue };
}
