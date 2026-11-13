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

const infiniteHandler = Symbol('infinite-handler');
type InfiniteElement = HTMLElement & { [infiniteHandler]?: EventListener };

export const InfiniteScroll: Directive<InfiniteElement, () => void> = {
  mounted: (el, binding) => {
    const distance = Number(el.getAttribute('infinite-scroll-distance') ?? 0);
    const disabled = () => el.getAttribute('infinite-scroll-disabled') === 'true';
    const handler: EventListener = () => {
      if (disabled() || typeof binding.value !== 'function') return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - distance) binding.value();
    };
    el[infiniteHandler] = handler;
    el.addEventListener('scroll', handler);
  },
  unmounted: (el) => {
    if (el[infiniteHandler]) el.removeEventListener('scroll', el[infiniteHandler]);
    delete el[infiniteHandler];
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
