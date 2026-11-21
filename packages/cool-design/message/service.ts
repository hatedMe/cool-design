import { createVNode, render, type AppContext, type VNode } from 'vue';
import { nextOverlayZIndex } from '../../hooks/use-z-index';
import { positionServices } from '../../../src/utils/service-position';
import { defaultConfig, getAppConfig } from '../config-provider/context';
import MessageComponent, { type MessageIcon, type MessageType } from './message';

export type MessagePlacement = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';

export interface MessageOptions {
  message: string | VNode;
  type?: MessageType;
  duration?: number;
  showClose?: boolean;
  offset?: number;
  zIndex?: number;
  placement?: MessagePlacement;
  dangerouslyUseHTMLString?: boolean;
  center?: boolean;
  plain?: boolean;
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
  closeAll(type?: MessageType): void;
  _context?: AppContext | null;
};

const closers = new Set<{
  close: () => void;
  type: MessageType;
  context: AppContext | null;
  placement: MessagePlacement;
  container: HTMLElement;
  offset: number;
}>();
const grouped = new Map<AppContext | null, Map<string, { handle: MessageHandle; bump: () => void }>>();

function normalize(input: string | MessageOptions, type?: MessageType): MessageOptions {
  const base = typeof input === 'string' ? { message: input } : input;
  return type ? { ...base, type } : { ...base };
}

function messageFn(input: string | MessageOptions, context: AppContext | null): MessageHandle {
  const config = getAppConfig(context) ?? defaultConfig;
  const defaults = config.message;
  const options = normalize(input);
  const opts = {
    ...options,
    placement: options.placement ?? defaults?.placement,
    offset: options.offset ?? defaults?.offset,
    duration: options.duration ?? defaults?.duration,
    grouping: options.grouping ?? defaults?.grouping,
    showClose: options.showClose ?? defaults?.showClose,
    plain: options.plain ?? defaults?.plain
  };
  const placement = opts.placement ?? 'top';
  const offset = opts.offset ?? 20;
  // VNode 消息不参与合并：徽标计数依赖稳定的文本标识。
  const groupKey =
    opts.grouping && typeof opts.message === 'string' ? `${opts.type ?? 'info'}|${placement}|${opts.message}` : undefined;
  const groups = grouped.get(context) ?? new Map();
  if (groupKey) {
    const existing = groups.get(groupKey);
    if (existing) {
      existing.bump();
      return existing.handle;
    }
  }
  if (defaults?.max !== undefined &&
      [...closers].filter((entry) => entry.context === context && entry.placement === placement).length >= defaults.max) {
    return { close: () => {} };
  }
  const container = document.createElement('div');
  container.className = `i-message-container i-message-container--${placement}`;
  container.style.zIndex = String(opts.zIndex ?? nextOverlayZIndex(config.zIndex));
  document.body.appendChild(container);
  const reposition = () => positionServices(
    [...closers].filter((entry) => entry.placement === placement),
    placement.startsWith('top') ? 'top' : 'bottom',
    8
  );
  const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(reposition);
  observer?.observe(container);
  let closed = false;
  let count = 1;
  const entry = { close: () => doClose(), type: (opts.type ?? 'info') as MessageType, context, placement, container, offset };
  const doClose = () => {
    if (closed) return;
    closed = true;
    closers.delete(entry);
    if (groupKey) {
      groups.delete(groupKey);
      if (!groups.size) grouped.delete(context);
    }
    observer?.disconnect();
    render(null, container);
    container.remove();
    reposition();
    opts.onClose?.();
  };
  closers.add(entry);
  const draw = () => {
    const vnode = createVNode(MessageComponent, {
      message: opts.message,
      repeatNum: count,
      type: opts.type ?? 'info',
      duration: opts.duration ?? 3000,
      showClose: opts.showClose ?? false,
      dangerouslyUseHTMLString: opts.dangerouslyUseHTMLString ?? false,
      center: opts.center ?? false,
      plain: opts.plain ?? false,
      customClass: opts.customClass ?? '',
      icon: opts.icon,
      closeIcon: opts.closeIcon,
      onClose: doClose
    });
    vnode.appContext = context;
    render(vnode, container);
    reposition();
  };
  draw();
  const handle: MessageHandle = { close: doClose };
  if (groupKey) {
    groups.set(groupKey, { handle, bump: () => { count++; draw(); } });
    grouped.set(context, groups);
  }
  return handle;
}

export function createMessageService(context?: AppContext): MessageFn {
  const fn = ((input, appContext = fn._context ?? null) => messageFn(input, appContext)) as MessageFn;
  fn._context = context;
  (['primary', 'success', 'warning', 'info', 'error'] as const).forEach((type) => {
    fn[type] = (input, appContext) => fn(normalize(input, type), appContext);
  });
  fn.closeAll = (type) => {
    [...closers].forEach((entry) => {
      if ((!context || entry.context === context) && (!type || entry.type === type)) entry.close();
    });
  };
  return fn;
}

export const message = createMessageService();
export type { MessageType };
