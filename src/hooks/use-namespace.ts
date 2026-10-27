import { computed, getCurrentInstance, inject, type InjectionKey, type Ref } from 'vue';

export const namespaceKey: InjectionKey<Ref<string | undefined>> = Symbol('namespace');
export const defaultNamespace = 'i';

export function useNamespace(block: string, override?: Ref<string | undefined>) {
  const injected = override || (getCurrentInstance() ? inject(namespaceKey, undefined) : undefined);
  const namespace = computed(() => injected?.value || defaultNamespace);
  const bem = (suffix = '', element = '', modifier = '') => {
    let value = `${namespace.value}-${block}`;
    if (suffix) value += `-${suffix}`;
    if (element) value += `__${element}`;
    if (modifier) value += `--${modifier}`;
    return value;
  };
  return {
    namespace,
    b: (suffix = '') => bem(suffix),
    e: (element = '') => (element ? bem('', element) : ''),
    m: (modifier = '') => (modifier ? bem('', '', modifier) : ''),
    be: (suffix = '', element = '') => (suffix && element ? bem(suffix, element) : ''),
    em: (element = '', modifier = '') => (element && modifier ? bem('', element, modifier) : ''),
    bm: (suffix = '', modifier = '') => (suffix && modifier ? bem(suffix, '', modifier) : ''),
    is: (name: string, state = true) => (name && state ? `is-${name}` : ''),
    cssVar: (values: Record<string, string>) =>
      Object.fromEntries(Object.entries(values).map(([k, v]) => [`--${namespace.value}-${k}`, v])),
    cssVarBlock: (values: Record<string, string>) =>
      Object.fromEntries(Object.entries(values).map(([k, v]) => [`--${namespace.value}-${block}-${k}`, v]))
  };
}
