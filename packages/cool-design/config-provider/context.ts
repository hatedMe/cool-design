import { computed, inject, type ComputedRef, type InjectionKey, type Ref } from 'vue';
export type Size = 'small' | 'default' | 'large';
export interface Config {
  size: Size;
  theme: 'light' | 'dark';
  themeVars: Record<string, string>;
}
export const defaultConfig: Config = { size: 'default', theme: 'light', themeVars: {} };
export const configKey: InjectionKey<ComputedRef<Config>> = Symbol('config');
export const overlayKey: InjectionKey<Ref<HTMLElement | undefined>> = Symbol('overlay');
export const useConfig = () =>
  inject(
    configKey,
    computed(() => defaultConfig)
  );
