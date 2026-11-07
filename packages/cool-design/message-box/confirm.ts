import {
  createVNode,
  defineComponent,
  getCurrentInstance,
  h,
  onScopeDispose,
  render,
  type AppContext,
  type ComputedRef
} from 'vue';
import ConfigProvider from '../config-provider';
import { useConfig, type Config } from '../config-provider/context';
import Box from './message-box';
import type { MessageBoxAction, MessageBoxOptions } from './types';
function open(
  message: string,
  title: string,
  options: MessageBoxOptions,
  context: AppContext | null,
  config?: ComputedRef<Config>,
  register?: (close: () => void) => () => void
): Promise<MessageBoxAction> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return new Promise((resolve) => {
    let settled = false;
    let unregister = () => {};
    const finish = (action: MessageBoxAction) => {
      if (settled) return;
      settled = true;
      unregister();
      queueMicrotask(() => {
        render(null, container);
        container.remove();
        resolve(action);
      });
    };
    unregister = register?.(() => finish('cancel')) || unregister;
    const Root = defineComponent({
      setup: () => () =>
        h(
          ConfigProvider,
          config ? { theme: config.value.theme, size: config.value.size, themeVars: config.value.themeVars } : {},
          () =>
            h(Box, {
              ...options,
              modelValue: true,
              message,
              title,
              onConfirm: () => finish('confirm'),
              onCancel: () => finish('cancel')
            })
        )
    });
    const vnode = createVNode(Root);
    vnode.appContext = context;
    render(vnode, container);
  });
}
export const confirm = (message: string, title = '操作确认', options: MessageBoxOptions = {}) =>
  open(message, title, options, null);
export function useMessageBox() {
  const context = getCurrentInstance()?.appContext || null;
  const config = useConfig();
  const pending = new Set<() => void>();
  onScopeDispose(() => {
    pending.forEach((close) => close());
    pending.clear();
  });
  return {
    confirm: (message: string, title = '操作确认', options: MessageBoxOptions = {}) =>
      open(message, title, options, context, config, (close) => {
        pending.add(close);
        return () => pending.delete(close);
      })
  };
}
