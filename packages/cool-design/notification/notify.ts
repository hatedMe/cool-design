import { createVNode, render, type AppContext } from 'vue';
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

const containers = new Map<NotificationPosition, HTMLElement>();
const closers = new Set<() => void>();

function normalize(input: NotifyInput | undefined, type?: NotificationType): NotificationOptions {
  const base: NotificationOptions = typeof input === 'string' ? { message: input } : (input ?? {});
  return type ? { ...base, type } : { ...base };
}

function getContainer(position: NotificationPosition, offset: number): HTMLElement {
  let container = containers.get(position);
  if (!container || !container.isConnected) {
    container = document.createElement('div');
    container.className = `i-notification-container i-notification-container--${position}`;
    document.body.appendChild(container);
    containers.set(position, container);
  }
  const base = 20 + offset;
  container.style.top = '';
  container.style.bottom = '';
  container.style.left = '';
  container.style.right = '';
  if (position.startsWith('top')) container.style.top = `${base}px`;
  else container.style.bottom = `${base}px`;
  if (position.endsWith('right')) container.style.right = '20px';
  else container.style.left = '20px';
  return container;
}

function notifyFn(input?: NotifyInput, appContext?: AppContext | null): NotificationHandle {
  const options = normalize(input);
  const position = options.position ?? 'top-right';
  const offset = options.offset ?? 0;
  const container = getContainer(position, offset);
  const wrapper = document.createElement('div');
  container.appendChild(wrapper);
  let closed = false;
  const doClose = () => {
    if (closed) return;
    closed = true;
    closers.delete(doClose);
    render(null, wrapper);
    wrapper.remove();
    if (container.childElementCount === 0) {
      container.remove();
      containers.delete(position);
    }
    options.onClose?.();
  };
  closers.add(doClose);
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
    onClose: doClose
  });
  vnode.appContext =
    appContext ?? (notifyFn as NotifyFn)._context ?? null;
  render(vnode, wrapper);
  return { close: doClose };
}

const fn = notifyFn as NotifyFn;
(['primary', 'success', 'warning', 'info', 'error', 'danger'] as NotificationType[]).forEach((type) => {
  fn[type] = (input?: NotifyInput, appContext?: AppContext | null) =>
    notifyFn(normalize(input, type), appContext);
});
fn.closeAll = () => {
  [...closers].forEach((close) => close());
};

export default fn;
