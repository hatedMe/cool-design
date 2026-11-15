import { createVNode, render, type AppContext } from 'vue';
import LoadingComponent from './loading';
import { lockScroll, unlockScroll } from './scroll-lock';

export interface LoadingServiceOptions {
  target?: HTMLElement | string;
  body?: boolean;
  fullscreen?: boolean;
  lock?: boolean;
  text?: string;
  background?: string;
  customClass?: string;
}

export interface LoadingInstance {
  close(): void;
}

let fullscreenInstance: LoadingInstance | null = null;

function resolveTarget(target?: HTMLElement | string): HTMLElement {
  if (typeof target === 'string') return (document.querySelector(target) as HTMLElement) ?? document.body;
  if (target instanceof HTMLElement) return target;
  return document.body;
}

export function service(
  options: LoadingServiceOptions = {},
  appContext?: AppContext | null
): LoadingInstance {
  const fullscreen = options.fullscreen ?? true;
  if (fullscreen && fullscreenInstance) return fullscreenInstance;
  const target = resolveTarget(options.target);
  const useBody = fullscreen || options.body || target === document.body;
  const parent = useBody ? document.body : target;
  let changedPosition = false;
  let positionBackup = '';
  if (!useBody) {
    if (getComputedStyle(target).position === 'static') {
      positionBackup = target.style.position;
      target.style.position = 'relative';
      changedPosition = true;
    }
  }
  if (options.lock) lockScroll();
  const container = document.createElement('div');
  container.className = 'i-loading-service';
  if (!useBody) {
    container.style.position = 'absolute';
    container.style.inset = '0';
    container.style.zIndex = '1000';
  } else if (!fullscreen && options.body && target !== document.body) {
    const rect = target.getBoundingClientRect();
    container.style.position = 'fixed';
    container.style.top = `${rect.top}px`;
    container.style.left = `${rect.left}px`;
    container.style.width = `${rect.width}px`;
    container.style.height = `${rect.height}px`;
    container.style.zIndex = '1000';
  }
  parent.appendChild(container);
  const vnode = createVNode(LoadingComponent, {
    loading: true,
    text: options.text ?? '正在加载…',
    background: options.background ?? '',
    fullscreen,
    overlay: !fullscreen,
    customClass: options.customClass ?? ''
  });
  vnode.appContext = appContext ?? null;
  render(vnode, container);
  let closed = false;
  const instance: LoadingInstance = {
    close() {
      if (closed) return;
      closed = true;
      render(null, container);
      container.remove();
      if (changedPosition) target.style.position = positionBackup;
      if (options.lock) unlockScroll();
      if (fullscreen && fullscreenInstance === instance) fullscreenInstance = null;
    }
  };
  if (fullscreen) fullscreenInstance = instance;
  return instance;
}
