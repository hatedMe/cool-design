import { computed, type MaybeRef, unref } from 'vue';
import { useConfig } from '../cool-design/config-provider/context';
export const DEFAULT_EMPTY_VALUES = ['', undefined, null];
function equalEmptyValue(value: unknown, empty: unknown): boolean {
  if (Object.is(value, empty)) return true;
  return Array.isArray(value) && Array.isArray(empty) && value.length === empty.length &&
    value.every((item, index) => equalEmptyValue(item, empty[index]));
}

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
  const isEmptyValue = (value: unknown) => emptyValues.value.some((empty) => equalEmptyValue(value, empty));
  return { emptyValues, valueOnClear, getValueOnClear, isEmptyValue };
}
