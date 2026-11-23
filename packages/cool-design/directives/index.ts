import type { App, ComponentInternalInstance, ComputedRef, Directive, DirectiveBinding, VNode } from 'vue';
import { createApp, h, isVNode, shallowRef, watchSyncEffect } from 'vue';
import PopoverComponent from '../popover/popover';
import type { PopoverDirectiveValue } from '../popover/popover';
import { lockScroll, retainPosition, unlockScroll } from '../loading/scroll-lock';
import { configKey, getThemeStyle, type Config } from '../config-provider/context';
import { defaultNamespace } from '../../hooks/use-namespace';

type LoadingValue = boolean | {
  text?: string;
  background?: string;
  fullscreen?: boolean;
  lock?: boolean;
  body?: boolean;
  spinner?: string;
  svg?: string;
  svgViewBox?: string;
  svgSize?: number;
};
const loadingEffect = Symbol('loading-effect');
type LoadingEffect = { update(options: ResolvedLoadingOptions): void; stop(): void };
const loadingPosition = Symbol('loading-position');
const loadingLock = Symbol('loading-lock');
const loadingMaskKey = Symbol('loading-mask');
type LoadingElement = HTMLElement & {
  [loadingEffect]?: LoadingEffect;
  [loadingMaskKey]?: HTMLElement;
  [loadingLock]?: boolean;
  [loadingPosition]?: () => void;
};

const readStringAttr = (el: HTMLElement, name: string): string => {
  try {
    return el.getAttribute(name) ?? '';
  } catch {
    return '';
  }
};

const readSvgSizeAttr = (el: HTMLElement): number => {
  try {
    const value = el.getAttribute('element-loading-svg-size');
    if (value === null || value === '') return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
};

interface ResolvedLoadingOptions {
  active: boolean;
  text: string;
  background: string;
  fullscreen: boolean;
  lock: boolean;
  body: boolean;
  spinner: string;
  svg: string;
  svgViewBox: string;
  svgSize: number;
}

// 选项对象优先，其次 element-loading-* 元素属性，最后指令 modifiers。
const resolveLoadingOptions = (
  el: HTMLElement,
  value: LoadingValue,
  modifiers: Record<string, boolean>
): ResolvedLoadingOptions => {
  const options = typeof value === 'object' ? value : {};
  return {
    active: typeof value === 'boolean' ? value : true,
    text: options.text ?? readStringAttr(el, 'element-loading-text'),
    background: options.background ?? readStringAttr(el, 'element-loading-background'),
    fullscreen: options.fullscreen ?? Boolean(modifiers.fullscreen),
    lock: options.lock ?? Boolean(modifiers.lock),
    body: options.body ?? Boolean(modifiers.body),
    spinner: options.spinner ?? readStringAttr(el, 'element-loading-spinner'),
    svg: options.svg ?? readStringAttr(el, 'element-loading-svg'),
    svgViewBox: options.svgViewBox ?? readStringAttr(el, 'element-loading-svg-view-box'),
    svgSize: options.svgSize ?? readSvgSizeAttr(el)
  };
};

const buildLoadingSpinner = (options: ResolvedLoadingOptions, namespace: string): HTMLElement => {
  if (options.svg) {
    const wrapper = document.createElement('span');
    wrapper.className = `${namespace}-loading-mask__svg`;
    wrapper.setAttribute('aria-hidden', 'true');
    try {
      const viewBox = options.svgViewBox ? ` viewBox="${options.svgViewBox.replace(/"/g, '&quot;')}"` : '';
      const parsed = new DOMParser().parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg"${viewBox}>${options.svg}</svg>`,
        'image/svg+xml'
      );
      const svg = parsed.documentElement;
      if (options.svgSize) {
        svg.setAttribute('width', String(options.svgSize));
        svg.setAttribute('height', String(options.svgSize));
      }
      svg.setAttribute('class', `${namespace}-loading-mask__svg-item`);
      wrapper.appendChild(svg);
    } catch {
      // 解析失败时回退默认旋转描边。
      return buildLoadingSpinner({ ...options, svg: '', spinner: '' }, namespace);
    }
    return wrapper;
  }
  if (options.spinner) {
    const icon = document.createElement('i');
    icon.className = `iconfont ${namespace}-icon ${namespace}-loading-mask__icon ${options.spinner}`;
    icon.setAttribute('aria-hidden', 'true');
    return icon;
  }
  const spinner = document.createElement('span');
  spinner.className = `${namespace}-loading-mask__spinner`;
  spinner.setAttribute('aria-hidden', 'true');
  return spinner;
};

const setLoading = (el: LoadingElement, options: ResolvedLoadingOptions, config?: Config) => {
  let mask = el[loadingMaskKey];
  const target = options.fullscreen || options.body ? document.body : el;
  const local = options.active && target === el;
  if (local) {
    el[loadingPosition] ??= retainPosition(el);
  } else {
    el[loadingPosition]?.();
    delete el[loadingPosition];
  }
  const locked = options.active && options.lock;
  if (locked && !el[loadingLock]) lockScroll();
  if (!locked && el[loadingLock]) unlockScroll();
  el[loadingLock] = locked;
  if (!options.active) {
    mask?.remove();
    delete el[loadingMaskKey];
    el.removeAttribute('aria-busy');
    return;
  }
  if (!mask) {
    mask = document.createElement('div');
    mask.setAttribute('role', 'status');
    mask.setAttribute('aria-live', 'polite');
    el[loadingMaskKey] = mask;
  }
  const namespace = config?.namespace || defaultNamespace;
  mask.className = `${namespace}-loading-mask`;
  mask.classList.toggle('is-fullscreen', options.fullscreen);
  mask.removeAttribute('style');
  if (config && !local) {
    mask.classList.add(`${namespace}-theme-scope`);
    mask.dataset.theme = config.theme;
    const style = getThemeStyle(config, (name) => `--${namespace}-${name}`);
    for (const [name, value] of Object.entries(style)) mask.style.setProperty(name, value);
  } else {
    delete mask.dataset.theme;
  }
  if (options.background) mask.style.background = options.background;
  const textNode = document.createElement('span');
  textNode.className = `${namespace}-loading-mask__text`;
  textNode.textContent = options.text;
  mask.replaceChildren(buildLoadingSpinner(options, namespace), textNode);
  if (mask.parentElement !== target) target.appendChild(mask);
  el.setAttribute('aria-busy', 'true');
};

export const LoadingDirective: Directive<LoadingElement, LoadingValue> = {
  mounted(el, binding, vnode) {
    const provides = getDirectiveProvides(el, binding, vnode);
    const config = provides?.[configKey as symbol] as ComputedRef<Config> | undefined;
    const options = shallowRef(resolveLoadingOptions(el, binding.value, binding.modifiers ?? {}));
    const stop = watchSyncEffect(() => setLoading(el, options.value, config?.value));
    el[loadingEffect] = { update(value) { options.value = value; }, stop };
  },
  updated(el, binding) {
    el[loadingEffect]?.update(resolveLoadingOptions(el, binding.value, binding.modifiers ?? {}));
  },
  unmounted(el) {
    el[loadingEffect]?.stop();
    delete el[loadingEffect];
    el[loadingPosition]?.();
    delete el[loadingPosition];
    el[loadingMaskKey]?.remove();
    delete el[loadingMaskKey];
    el.removeAttribute('aria-busy');
    if (el[loadingLock]) unlockScroll();
    delete el[loadingLock];
  }
};

const outsideHandler = Symbol('outside-handler');
type OutsideElement = HTMLElement & { [outsideHandler]?: (event: Event) => void };

export const ClickOutside: Directive<OutsideElement, (event: Event) => void> = {
  mounted: (el, binding) => {
    const handler = (event: Event) => {
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      if (path.includes(el) || el.contains(event.target as Node)) return;
      if (typeof binding.value === 'function') binding.value(event);
    };
    el[outsideHandler] = handler;
    document.addEventListener('click', handler, true);
  },
  updated: (el, binding) => {
    if (el[outsideHandler]) document.removeEventListener('click', el[outsideHandler], true);
    const handler = (event: Event) => {
      if (el.contains(event.target as Node)) return;
      if (typeof binding.value === 'function') binding.value(event);
    };
    el[outsideHandler] = handler;
    document.addEventListener('click', handler, true);
  },
  unmounted: (el) => {
    if (el[outsideHandler]) document.removeEventListener('click', el[outsideHandler], true);
    delete el[outsideHandler];
  }
};

const infiniteState = Symbol('infinite-state');
interface InfiniteState {
  load: () => void;
  getLoad: () => unknown;
  scrollListener: EventListener;
  container: HTMLElement | Window;
  observer?: MutationObserver;
  timeout?: ReturnType<typeof setTimeout>;
  lastCall: number;
  destroyed: boolean;
}
type InfiniteElement = HTMLElement & { [infiniteState]?: InfiniteState };

const readBooleanAttr = (el: HTMLElement, name: string, defaultValue: boolean): boolean => {
  try {
    const value = el.getAttribute(name);
    if (value === null) return defaultValue;
    if (value === '' || value === 'true') return true;
    if (value === 'false') return false;
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

const readNumberAttr = (el: HTMLElement, name: string, defaultValue: number): number => {
  try {
    const value = el.getAttribute(name);
    if (value === null || value === '') return defaultValue;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
};

const isScrollableElement = (el: HTMLElement): boolean => {
  try {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') return true;
  } catch {
    // 忽略样式读取异常，继续用滚动尺寸判断。
  }
  try {
    return el.scrollHeight > el.clientHeight;
  } catch {
    return false;
  }
};

const getScrollContainer = (el: HTMLElement): HTMLElement | Window => {
  try {
    let current: HTMLElement | null = el;
    while (current) {
      if (current === document.body || current === document.documentElement) return window;
      if (isScrollableElement(current)) return current;
      current = current.parentElement;
    }
  } catch {
    // 异常时回退到 window，保证指令不抛出。
  }
  return window;
};

const getScrollMetrics = (container: HTMLElement | Window) => {
  try {
    if (container === window) {
      const scrollTop = window.scrollY ?? document.documentElement.scrollTop ?? document.body.scrollTop ?? 0;
      const clientHeight = window.innerHeight ?? document.documentElement.clientHeight ?? 0;
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight ?? 0,
        document.body.scrollHeight ?? 0
      );
      return { scrollTop, clientHeight, scrollHeight };
    }
    const el = container as HTMLElement;
    return { scrollTop: el.scrollTop, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight };
  } catch {
    return { scrollTop: 0, clientHeight: 0, scrollHeight: 0 };
  }
};

const setupInfiniteScroll = (el: InfiniteElement, getLoad: () => unknown) => {
  const state = el[infiniteState];
  if (!state) return;
  state.getLoad = getLoad;
  const container = getScrollContainer(el);
  state.container = container;

  const shouldTrigger = () => {
    if (readBooleanAttr(el, 'infinite-scroll-disabled', false)) return false;
    const distance = readNumberAttr(el, 'infinite-scroll-distance', 0);
    const { scrollTop, clientHeight, scrollHeight } = getScrollMetrics(container);
    return scrollTop + clientHeight >= scrollHeight - distance;
  };

  const callLoad = () => {
    if (state.destroyed) return;
    if (!shouldTrigger()) return;
    const load = state.getLoad();
    if (typeof load !== 'function') return;
    try {
      (load as () => void)();
    } catch {
      // 业务回调异常不应破坏滚动监听。
    }
  };

  const throttled = () => {
    const delay = readNumberAttr(el, 'infinite-scroll-delay', 200);
    if (delay <= 0) {
      callLoad();
      return;
    }
    const now = Date.now();
    if (now - state.lastCall >= delay) {
      state.lastCall = now;
      callLoad();
      return;
    }
    if (!state.timeout) {
      const remaining = delay - (now - state.lastCall);
      state.timeout = setTimeout(() => {
        state.timeout = undefined;
        state.lastCall = Date.now();
        callLoad();
      }, Math.max(remaining, 0));
    }
  };

  state.load = throttled;
  const listener: EventListener = () => throttled();
  state.scrollListener = listener;
  container.addEventListener('scroll', listener, { passive: true });

  const immediate = readBooleanAttr(el, 'infinite-scroll-immediate', true);
  if (immediate) {
    // 初次检查：内容未填满容器时立即触发一次。
    queueMicrotask(() => {
      if (!state.destroyed) throttled();
    });
    if (typeof MutationObserver !== 'undefined') {
      try {
        const observer = new MutationObserver(() => {
          if (!state.destroyed && readBooleanAttr(el, 'infinite-scroll-immediate', true)) throttled();
        });
        observer.observe(el, { childList: true, subtree: true });
        state.observer = observer;
      } catch {
        // 忽略观察器创建失败。
      }
    }
  }
};

const teardownInfiniteScroll = (el: InfiniteElement) => {
  const state = el[infiniteState];
  if (!state) return;
  state.destroyed = true;
  try {
    state.container.removeEventListener('scroll', state.scrollListener);
  } catch {
    // 忽略清理异常。
  }
  try {
    state.observer?.disconnect();
  } catch {
    // 忽略清理异常。
  }
  if (state.timeout) clearTimeout(state.timeout);
  delete el[infiniteState];
};

export const InfiniteScroll: Directive<InfiniteElement, () => void> = {
  mounted: (el, binding) => {
    el[infiniteState] = {
      load: () => {},
      getLoad: () => binding.value,
      scrollListener: () => {},
      container: window,
      lastCall: 0,
      destroyed: false
    };
    setupInfiniteScroll(el, () => binding.value);
  },
  updated: (el, binding) => {
    const state = el[infiniteState];
    if (!state) {
      el[infiniteState] = {
        load: () => {},
        getLoad: () => binding.value,
        scrollListener: () => {},
        container: window,
        lastCall: 0,
        destroyed: false
      };
      setupInfiniteScroll(el, () => binding.value);
      return;
    }
    // 属性与回调每次读取最新值；容器可能变化时重新绑定。
    const nextContainer = getScrollContainer(el);
    if (nextContainer !== state.container) {
      try {
        state.container.removeEventListener('scroll', state.scrollListener);
      } catch {
        // 忽略清理异常。
      }
      teardownInfiniteScroll(el);
      el[infiniteState] = {
        load: () => {},
        getLoad: () => binding.value,
        scrollListener: () => {},
        container: window,
        lastCall: 0,
        destroyed: false
      };
      setupInfiniteScroll(el, () => binding.value);
    } else {
      state.getLoad = () => binding.value;
    }
    if (readBooleanAttr(el, 'infinite-scroll-immediate', true)) {
      queueMicrotask(() => {
        if (!state.destroyed) state.load();
      });
    }
  },
  unmounted: (el) => {
    teardownInfiniteScroll(el);
  }
};

export const directives = { loading: LoadingDirective, clickOutside: ClickOutside, infiniteScroll: InfiniteScroll };

// v-popover 指令：基于 Popover 虚拟触发能力，为任意元素挂载浮层。
const popoverState = Symbol('popover-directive');
interface PopoverDirectiveState {
  app: ReturnType<typeof createApp>;
  host: HTMLElement;
}
type PopoverElement = HTMLElement & { [popoverState]?: PopoverDirectiveState };

// 插槽的声明组件与渲染组件可能不同。沿已挂载的 VNode 找到渲染位置，
// Teleport 与 Fragment 的子节点也保留在这棵逻辑树中。
function findDirectiveOwner(node: VNode, owner: ComponentInternalInstance, el: HTMLElement): ComponentInternalInstance | undefined {
  if (node.component) return findDirectiveOwner(node.component.subTree, node.component, el);
  if (node.el === el) return owner;
  if (node.suspense?.activeBranch) return findDirectiveOwner(node.suspense.activeBranch, owner, el);
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (!isVNode(child)) continue;
      const found = findDirectiveOwner(child, owner, el);
      if (found) return found;
    }
  }
}

function getDirectiveProvides(el: HTMLElement, binding: DirectiveBinding, vnode: VNode) {
  const context = binding.instance?.$ ?? (vnode as VNode & { ctx?: ComponentInternalInstance })?.ctx;
  if (!context) return;
  const owner = findDirectiveOwner(context.subTree, context, el) ?? context;
  return (owner as ComponentInternalInstance & Pick<App['_context'], 'provides'>).provides;
}

const mountPopover = (el: PopoverElement, binding: DirectiveBinding<PopoverDirectiveValue>, vnode: VNode) => {
  const { value } = binding;
  const options = typeof value === 'string' ? { content: value } : value ?? {};
  const host = document.createElement('div');
  const app = createApp(() =>
    h(PopoverComponent, {
      virtualTriggering: true,
      virtualRef: el,
      content: options.content ?? '',
      title: options.title ?? '',
      placement: options.placement ?? 'bottom',
      trigger: options.trigger ?? 'hover',
      effect: options.effect ?? 'light',
      offset: options.offset ?? 12,
      showArrow: options.showArrow ?? true,
      disabled: options.disabled ?? false
    })
  );
  const provides = getDirectiveProvides(el, binding, vnode);
  if (provides) app._context.provides = Object.create(provides);
  app.mount(host);
  el[popoverState] = { app, host };
};

export const VPopover: Directive<PopoverElement, PopoverDirectiveValue> = {
  mounted: (el, binding, vnode) => {
    if (!binding.value) return;
    mountPopover(el, binding, vnode);
  },
  updated: (el, binding, vnode) => {
    const state = el[popoverState];
    if (!binding.value) {
      if (state) {
        state.app.unmount();
        state.host.remove();
        delete el[popoverState];
      }
      return;
    }
    if (state && binding.oldValue !== binding.value) {
      state.app.unmount();
      state.host.remove();
      delete el[popoverState];
    }
    if (!el[popoverState]) mountPopover(el, binding, vnode);
  },
  unmounted: (el) => {
    const state = el[popoverState];
    if (!state) return;
    state.app.unmount();
    state.host.remove();
    delete el[popoverState];
  }
};

function withDirectiveInstall<T extends Directive>(name: string, directive: T) {
  return Object.assign(directive, {
    install(app: App) {
      if (!app.directive(name)) app.directive(name, directive);
    }
  });
}

export const ElInfiniteScroll = withDirectiveInstall('infinite-scroll', InfiniteScroll);
export const ElPopoverDirective = withDirectiveInstall('popover', VPopover);

export const installDirectives = (app: App) => {
  if (typeof app.directive !== 'function') return;
  if (!app.directive('loading')) app.directive('loading', LoadingDirective);
  app.directive('click-outside', ClickOutside);
  app.use(ElInfiniteScroll);
  app.use(ElPopoverDirective);
};

export default directives;
