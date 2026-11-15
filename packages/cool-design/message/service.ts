import { createVNode, render, type AppContext } from 'vue';
import MessageComponent, { type MessageType } from './message';

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
  const container = getContainer(placement, offset);
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
      containers.delete(placement);
    }
    opts.onClose?.();
  };
  closers.add(doClose);
  const vnode = createVNode(MessageComponent, {
    message: opts.message,
    type: opts.type ?? 'info',
    duration: opts.duration ?? 3000,
    showClose: opts.showClose ?? false,
    dangerouslyUseHTMLString: opts.dangerouslyUseHTMLString ?? false,
    center: opts.center ?? false,
    customClass: opts.customClass ?? '',
    onClose: doClose
  });
  vnode.appContext = appContext ?? (messageFn as MessageFn)._context ?? null;
  render(vnode, wrapper);
  return { close: doClose };
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
