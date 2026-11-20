import { createVNode, render, type AppContext } from 'vue';
import { nextOverlayZIndex } from '../../hooks/use-z-index';
import { positionServices } from '../../../src/utils/service-position';
import { defaultConfig, getAppConfig } from '../config-provider/context';
import Notification from './notification';
import type { NotificationHandle, NotificationOptions, NotificationPosition, NotificationType } from './types';

/** 支持字符串简写：Notify('消息') 等价于 Notify({ message: '消息' }) */
type NotifyInput = string | NotificationOptions;

type NotifyFn = {
  (options?: NotifyInput, appContext?: AppContext | null): NotificationHandle;
  primary(options?: NotifyInput, appContext?: AppContext | null): NotificationHandle;
  success(options?: NotifyInput, appContext?: AppContext | null): NotificationHandle;
  warning(options?: NotifyInput, appContext?: AppContext | null): NotificationHandle;
  info(options?: NotifyInput, appContext?: AppContext | null): NotificationHandle;
  error(options?: NotifyInput, appContext?: AppContext | null): NotificationHandle;
  danger(options?: NotifyInput, appContext?: AppContext | null): NotificationHandle;
  closeAll(): void;
  _context?: AppContext | null;
};

const instances = new Set<{
  close: () => void;
  context: AppContext | null;
  position: NotificationPosition;
  container: HTMLElement;
  offset: number;
}>();

function normalize(input: NotifyInput | undefined, type?: NotificationType): NotificationOptions {
  const base: NotificationOptions = typeof input === 'string' ? { message: input } : (input ?? {});
  return type ? { ...base, type } : { ...base };
}

function notifyFn(input: NotifyInput | undefined, context: AppContext | null): NotificationHandle {
  const options = normalize(input);
  const position = options.position ?? 'top-right';
  const offset = 20 + (options.offset ?? 0);
  const config = getAppConfig(context) ?? defaultConfig;
  const container = document.createElement('div');
  container.className = `i-notification-container i-notification-container--${position}`;
  container.style[position.endsWith('right') ? 'right' : 'left'] = '20px';
  container.style.zIndex = String(options.zIndex ?? nextOverlayZIndex(config.zIndex));
  document.body.appendChild(container);
  const reposition = () => positionServices(
    [...instances].filter((entry) => entry.position === position),
    position.startsWith('top') ? 'top' : 'bottom',
    16
  );
  const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(reposition);
  observer?.observe(container);
  const entry = {
    context, position, container, offset,
    close() {
      if (!instances.delete(entry)) return;
      observer?.disconnect();
      render(null, container);
      container.remove();
      reposition();
      options.onClose?.();
    }
  };
  instances.add(entry);
  const vnode = createVNode(Notification, {
    title: options.title,
    message: options.message,
    size: options.size,
    type: options.type,
    dangerouslyUseHTMLString: options.dangerouslyUseHTMLString,
    customClass: options.customClass,
    duration: options.duration ?? 4500,
    showClose: options.showClose ?? true,
    onClick: options.onClick,
    onClose: entry.close
  });
  vnode.appContext = context;
  render(vnode, container);
  reposition();
  return { close: entry.close };
}

export function createNotifyService(context?: AppContext): NotifyFn {
  const fn = ((input, appContext = fn._context ?? null) => notifyFn(input, appContext)) as NotifyFn;
  fn._context = context;
  (['primary', 'success', 'warning', 'info', 'error', 'danger'] as const).forEach((type) => {
    fn[type] = (input, appContext) => fn(normalize(input, type), appContext);
  });
  fn.closeAll = () => {
    [...instances].forEach((entry) => {
      if (!context || entry.context === context) entry.close();
    });
  };
  return fn;
}

export default createNotifyService();
