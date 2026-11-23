import {
  computed,
  createVNode,
  defineComponent,
  getCurrentInstance,
  h,
  onScopeDispose,
  provide,
  render,
  type AppContext,
  type ComputedRef
} from 'vue';
import ConfigProvider from '../config-provider';
import { configKey, defaultConfig, getAppConfig, useConfig, type Config } from '../config-provider/context';
import Box from './message-box';
import type { MessageBoxAction, MessageBoxOptions, MessageBoxPromptResult } from './types';

/** 活动实例的取消队列，供 MessageBox.close() 关闭全部 */
const activeClosers = new Set<() => void>();

function open(
  message: string,
  title: string,
  options: MessageBoxOptions,
  context: AppContext | null,
  config?: ComputedRef<Config>,
  register?: (close: () => void) => () => void
): Promise<'confirm' | MessageBoxPromptResult> {
  const container = document.createElement('div');
  const host =
    typeof options.container === 'string'
      ? document.querySelector<HTMLElement>(options.container)
      : options.container;
  (host ?? document.body).appendChild(container);
  return new Promise((resolve, reject) => {
    let settled = false;
    let unregister = () => {};
    const cleanup = () => {
      unregister();
      activeClosers.delete(globalClose);
      queueMicrotask(() => {
        render(null, container);
        container.remove();
      });
    };
    const finishConfirm = (value?: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (options.showInput) resolve({ value: value ?? '', action: 'confirm' });
      else resolve('confirm');
    };
    const finishReject = (action: 'cancel' | 'close') => {
      if (settled) return;
      settled = true;
      cleanup();
      // 语义约定：未开启 distinguishCancelAndClose 时，close 归并为 cancel
      reject(options.distinguishCancelAndClose ? action : action === 'close' ? 'cancel' : action);
    };
    // 登记全局关闭队列，供 MessageBox.close() 关闭全部实例
    const globalClose = () => finishReject('cancel');
    activeClosers.add(globalClose);
    unregister = register?.(() => finishReject('cancel')) || unregister;
    const Root = defineComponent({
      setup() {
        const inherited = config ?? computed(() => getAppConfig(context) ?? defaultConfig);
        provide(configKey, inherited);
        return () => h(
          ConfigProvider,
          { namespace: inherited.value.namespace },
          () =>
            h(Box, {
              ...options,
              modelValue: true,
              message,
              title,
              onConfirm: (value?: string) => finishConfirm(value),
              onCancel: () => finishReject('cancel'),
              onClose: () => finishReject('close')
            })
        );
      }
    });
    const vnode = createVNode(Root);
    vnode.appContext = context;
    render(vnode, container);
  });
}

export const msgbox = (
  options: MessageBoxOptions & { message: string; title?: string },
  appContext: AppContext | null = null
): Promise<'confirm' | MessageBoxPromptResult> => {
  const { message, title = '', ...rest } = options;
  return open(message, title, rest, appContext);
};

/** 关闭当前全部消息确认框（按取消语义拒绝） */
export const closeAll = () => {
  [...activeClosers].forEach((close) => close());
};

export const alert = (
  message: string,
  title = '',
  options: MessageBoxOptions = {},
  appContext: AppContext | null = null
): Promise<'confirm'> =>
  open(message, title, { showCancelButton: false, ...options }, appContext) as Promise<'confirm'>;

export const confirm = (
  message: string,
  title = '',
  options: MessageBoxOptions = {},
  appContext: AppContext | null = null
): Promise<'confirm'> => open(message, title, options, appContext) as Promise<'confirm'>;

export const prompt = (
  message: string,
  title = '',
  options: MessageBoxOptions = {},
  appContext: AppContext | null = null
): Promise<MessageBoxPromptResult> =>
  open(message, title, { showInput: true, ...options }, appContext) as Promise<MessageBoxPromptResult>;

export function useMessageBox() {
  const context = getCurrentInstance()?.appContext || null;
  const config = useConfig();
  const pending = new Set<() => void>();
  onScopeDispose(() => {
    pending.forEach((close) => close());
    pending.clear();
  });
  const register = (close: () => void) => {
    pending.add(close);
    return () => pending.delete(close);
  };
  return {
    msgbox: (options: MessageBoxOptions & { message: string; title?: string }) => {
      const { message, title = '', ...rest } = options;
      return open(message, title, rest, context, config, register);
    },
    alert: (message: string, title = '', options: MessageBoxOptions = {}) =>
      open(message, title, { showCancelButton: false, ...options }, context, config, register) as Promise<'confirm'>,
    confirm: (message: string, title = '', options: MessageBoxOptions = {}) =>
      open(message, title, options, context, config, register) as Promise<'confirm'>,
    prompt: (message: string, title = '', options: MessageBoxOptions = {}) =>
      open(message, title, { showInput: true, ...options }, context, config, register) as Promise<MessageBoxPromptResult>
  };
}

export type { MessageBoxAction };
