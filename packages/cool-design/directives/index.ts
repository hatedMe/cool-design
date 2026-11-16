import type { App, Directive } from 'vue';

type LoadingValue = boolean | { text?: string; background?: string; fullscreen?: boolean; lock?: boolean };
const loadingLock = Symbol('loading-lock');
type LoadingElement = HTMLElement & { [loadingLock]?: boolean };

const loadingMask = (el: HTMLElement) => el.querySelector<HTMLElement>(':scope > .i-loading-mask');

const setLoading = (el: HTMLElement, value: LoadingValue) => {
  const options = typeof value === 'object' ? value : {};
  const active = typeof value === 'boolean' ? value : true;
  let mask = loadingMask(el);
  if (!active) {
    mask?.remove();
    el.removeAttribute('aria-busy');
    if ((el as LoadingElement)[loadingLock]) document.body.style.overflow = '';
    return;
  }
  if (!mask) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    mask = document.createElement('div');
    mask.className = 'i-loading-mask';
    mask.setAttribute('role', 'status');
    mask.setAttribute('aria-live', 'polite');
    const spinner = document.createElement('span');
    spinner.className = 'i-loading-mask__spinner';
    spinner.setAttribute('aria-hidden', 'true');
    mask.append(spinner, document.createElement('span'));
    el.appendChild(mask);
  }
  const text = mask.lastElementChild as HTMLElement;
  text.textContent = options.text ?? '';
  mask.classList.toggle('is-fullscreen', Boolean(options.fullscreen));
  if (options.background) mask.style.background = options.background;
  el.setAttribute('aria-busy', 'true');
  if (options.lock) document.body.style.overflow = 'hidden';
};

export const LoadingDirective: Directive<LoadingElement, LoadingValue> = {
  mounted: (el, binding) => {
    setLoading(el, binding.value);
    el[loadingLock] = typeof binding.value === 'object' && Boolean(binding.value.lock);
  },
  updated: (el, binding) => {
    setLoading(el, binding.value);
    el[loadingLock] = typeof binding.value === 'object' && Boolean(binding.value.lock);
  },
  unmounted: (el) => {
    loadingMask(el)?.remove();
    el.removeAttribute('aria-busy');
    if (el[loadingLock]) document.body.style.overflow = '';
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

export const installDirectives = (app: App) => {
  if (typeof app.directive !== 'function') return;
  app.directive('loading', LoadingDirective);
  app.directive('click-outside', ClickOutside);
  app.directive('infinite-scroll', InfiniteScroll);
};

export default directives;
