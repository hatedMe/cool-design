import { createVNode, render, type AppContext } from 'vue';
import MessageComponent, { type MessageIcon, type MessageType } from './message';

export type MessagePlacement = 'top' | 'bottom';

export interface MessageOptions {
  message: string;
  type?: MessageType;
  duration?: number;
  showClose?: boolean;
  offset?: number;
  placement?: MessagePlacement;
  dangerouslyUseHTMLString?: boolean;
  center?: boolean;
  customClass?: string;
  icon?: MessageIcon;
  closeIcon?: MessageIcon;
  grouping?: boolean;
  onClose?: () => void;
}

export interface MessageHandle {
  close(): void;
}

type MessageFn = {
  (options: string | MessageOptions, appContext?: AppContext | null): MessageHandle;
  success(options: string | MessageOptions, appContext?: AppContext | null): MessageHandle;
  warning(options: string | MessageOptions, appContext?: AppContext | null): MessageHandle;
  info(options: string | MessageOptions, appContext?: AppContext | null): MessageHandle;
  error(options: string | MessageOptions, appContext?: AppContext | null): MessageHandle;
  primary(options: string | MessageOptions, appContext?: AppContext | null): MessageHandle;
  closeAll(): void;
  _context?: AppContext | null;
};

const containers = new Map<MessagePlacement, HTMLElement>();
const closers = new Set<() => void>();
const grouped = new Map<string, { handle: MessageHandle; bump: () => void }>();

function getContainer(placement: MessagePlacement, offset: number): HTMLElement {
  let container = containers.get(placement);
  if (!container || !container.isConnected) {
    container = document.createElement('div');
    container.className = `i-message-container i-message-container--${placement}`;
    document.body.appendChild(container);
    containers.set(placement, container);
  }
  if (placement === 'top') container.style.top = `${offset}px`;
  else container.style.bottom = `${offset}px`;
  return container;
}

function normalize(input: string | MessageOptions, type?: MessageType): MessageOptions {
  const base = typeof input === 'string' ? { message: input } : input;
  return type ? { ...base, type } : { ...base };
}

function messageFn(input: string | MessageOptions, appContext?: AppContext | null): MessageHandle {
  const opts = normalize(input);
  const placement = opts.placement ?? 'top';
  const offset = opts.offset ?? 20;
  const groupKey = opts.grouping ? `${opts.type ?? 'info'}|${placement}|${opts.message}` : undefined;
  if (groupKey) {
    const existing = grouped.get(groupKey);
    if (existing) {
      existing.bump();
      return existing.handle;
    }
  }
  const container = getContainer(placement, offset);
  const wrapper = document.createElement('div');
  container.appendChild(wrapper);
  let closed = false;
  let count = 1;
  const doClose = () => {
    if (closed) return;
    closed = true;
    closers.delete(doClose);
    if (groupKey) grouped.delete(groupKey);
    render(null, wrapper);
    wrapper.remove();
    if (container.childElementCount === 0) {
      container.remove();
      containers.delete(placement);
    }
    opts.onClose?.();
  };
  closers.add(doClose);
  const draw = () => {
    const vnode = createVNode(MessageComponent, {
      message: count > 1 ? `${opts.message} ×${count}` : opts.message,
      type: opts.type ?? 'info',
      duration: opts.duration ?? 3000,
      showClose: opts.showClose ?? false,
      dangerouslyUseHTMLString: opts.dangerouslyUseHTMLString ?? false,
      center: opts.center ?? false,
      customClass: opts.customClass ?? '',
      icon: opts.icon,
      closeIcon: opts.closeIcon,
      onClose: doClose
    });
    vnode.appContext = appContext ?? (messageFn as MessageFn)._context ?? null;
    render(vnode, wrapper);
  };
  draw();
  const handle: MessageHandle = { close: doClose };
  if (groupKey) grouped.set(groupKey, { handle, bump: () => { count++; draw(); } });
  return handle;
}

const fn = messageFn as MessageFn;
(['primary', 'success', 'warning', 'info', 'error'] as const).forEach((type) => {
  fn[type] = (input: string | MessageOptions, appContext?: AppContext | null) =>
    messageFn(normalize(input, type), appContext);
});
fn.closeAll = () => {
  [...closers].forEach((close) => close());
};

export const message = fn;
export type { MessageType };
