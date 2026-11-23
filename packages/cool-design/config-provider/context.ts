import { computed, getCurrentInstance, inject, shallowReactive, type AppContext, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import type { TransitionProps } from 'vue';
import type { ButtonType } from '../button/types';
import type { LinkType, LinkUnderline } from '../link/link';
import type { MessagePlacement } from '../message/service';
import type { TableOverflowTooltipOptions, TableTooltipFormatter } from '../table/types';
import { defaultNamespace } from '../../hooks/use-namespace';
import zhCn from './locale/zh-cn';
export { default as zhCn } from './locale/zh-cn';
export { default as en } from './locale/en';
export interface Language {
  name: string;
  el: Record<string, unknown>;
}
export type ValueOnClear = string | number | boolean | null | (() => unknown);
export type Size = 'small' | 'default' | 'large';
export interface ButtonConfigContext {
  type?: ButtonType;
  plain?: boolean;
  text?: boolean;
  round?: boolean;
  dashed?: boolean;
  autoInsertSpace?: boolean;
}
export interface LinkConfigContext {
  type?: LinkType;
  underline?: LinkUnderline | boolean;
}
export interface DialogConfigContext {
  alignCenter?: boolean;
  draggable?: boolean;
  overflow?: boolean;
  transition?: string | TransitionProps;
}
export interface MessageConfigContext {
  max?: number;
  grouping?: boolean;
  duration?: number;
  offset?: number;
  showClose?: boolean;
  plain?: boolean;
  placement?: MessagePlacement;
}
export interface TableConfigContext {
  showOverflowTooltip?: boolean | TableOverflowTooltipOptions;
  tooltipEffect?: string;
  tooltipOptions?: TableOverflowTooltipOptions;
  tooltipFormatter?: TableTooltipFormatter;
}
export interface Config {
  namespace?: string;
  button?: ButtonConfigContext;
  link?: LinkConfigContext;
  dialog?: DialogConfigContext;
  message?: MessageConfigContext;
  table?: TableConfigContext;
  size: Size;
  theme: 'light' | 'dark';
  themeVars: Record<string, string>;
  zIndex: number;
  emptyValues?: unknown[];
  valueOnClear?: ValueOnClear;
  locale?: Language;
}
export const defaultConfig: Config = { namespace: defaultNamespace, size: 'default', theme: 'light', themeVars: {}, zIndex: 2000, locale: zhCn };
export function getThemeStyle(config: Config, cssVarName: (name: string) => string) {
  return {
    [cssVarName('control-height')]: { small: '28px', default: '32px', large: '40px' }[config.size],
    ...config.themeVars
  };
}

const appConfigs = new WeakMap<AppContext, Set<ComputedRef<Config>>>();

function getAppConfigs(context: AppContext) {
  let configs = appConfigs.get(context);
  if (!configs) {
    configs = shallowReactive(new Set<ComputedRef<Config>>());
    appConfigs.set(context, configs);
  }
  return configs;
}

export function registerAppConfig(context: AppContext, config: ComputedRef<Config>) {
  const configs = getAppConfigs(context);
  configs.add(config);
  return () => { configs.delete(config); };
}

export function getAppConfig(context: AppContext | null | undefined) {
  return context ? Array.from(getAppConfigs(context)).pop()?.value : undefined;
}

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
