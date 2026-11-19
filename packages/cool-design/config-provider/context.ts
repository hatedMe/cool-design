import { computed, getCurrentInstance, inject, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import zhCn from './locale/zh-cn';
export { default as zhCn } from './locale/zh-cn';
export { default as en } from './locale/en';
export interface Language {
  name: string;
  el: Record<string, unknown>;
}
export type ValueOnClear = string | number | boolean | null | (() => unknown);
export type Size = 'small' | 'default' | 'large';
export interface Config {
  size: Size;
  theme: 'light' | 'dark';
  themeVars: Record<string, string>;
  zIndex: number;
  emptyValues?: unknown[];
  valueOnClear?: ValueOnClear;
  locale?: Language;
}
export const defaultConfig: Config = { size: 'default', theme: 'light', themeVars: {}, zIndex: 2000, locale: zhCn };
export const configKey: InjectionKey<ComputedRef<Config>> = Symbol('config');
export const overlayKey: InjectionKey<Ref<HTMLElement | undefined>> = Symbol('overlay');
export const useConfig = () => (getCurrentInstance() && inject(configKey, undefined)) || computed(() => defaultConfig);

export function useLocale() {
  const config = useConfig();
  const locale = computed(() => config.value.locale || zhCn);
  const t = (path: string, fallback = path): string => {
    const value = path
      .split('.')
      .reduce<unknown>(
        (current, key) =>
          current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, key)
            ? (current as Record<string, unknown>)[key]
            : undefined,
        locale.value
      );
    return typeof value === 'string' ? value : fallback;
  };
  return { locale, t };
}
