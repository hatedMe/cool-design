import { describe, expect, it, vi } from 'vitest';
import type { DirectiveBinding } from 'vue';
import { ClickOutside, InfiniteScroll, LoadingDirective } from '..';

type LooseHook = (el: HTMLElement, binding?: DirectiveBinding<unknown>, vnode?: unknown, prev?: unknown) => void;
const hooks = (directive: unknown) => directive as Record<string, LooseHook | undefined>;
const loading = hooks(LoadingDirective);
const outside = hooks(ClickOutside);
const infinite = hooks(InfiniteScroll);

const binding = <T>(value: T, oldValue?: T) => ({ value, oldValue } as DirectiveBinding<T>);

const scrollable = (overrides: { scrollTop?: number; clientHeight?: number; scrollHeight?: number } = {}) => {
  const el = document.createElement('div');
  Object.defineProperties(el, {
    scrollTop: { configurable: true, writable: true, value: overrides.scrollTop ?? 100 },
    clientHeight: { configurable: true, value: overrides.clientHeight ?? 100 },
    scrollHeight: { configurable: true, value: overrides.scrollHeight ?? 200 }
  });
  return el;
};

describe('directives', () => {
  it('toggles a loading mask and removes it on unmount', () => {
    const el = document.createElement('div');
    loading.mounted?.(el, binding(true));
    expect(el.querySelector('.i-loading-mask')).not.toBeNull();
    loading.updated?.(el, binding(false, true));
    expect(el.querySelector('.i-loading-mask')).toBeNull();
    loading.unmounted?.(el);
  });

  it('calls click outside handler and ignores inside clicks', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    outside.mounted?.(el, binding(handler));
    document.body.appendChild(el);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
    outside.unmounted?.(el);
    el.remove();
  });

  it('loads more when scrolling within the configured distance', () => {
    const el = scrollable();
    const load = vi.fn();
    infinite.mounted?.(el, binding(load));
    el.dispatchEvent(new Event('scroll'));
    expect(load).toHaveBeenCalledTimes(1);
    infinite.unmounted?.(el);
  });

  it('respects disabled, distance and immediate=false', async () => {
    const el = scrollable({ scrollTop: 0, clientHeight: 100, scrollHeight: 300 });
    el.setAttribute('infinite-scroll-distance', '20');
    el.setAttribute('infinite-scroll-immediate', 'false');
    const load = vi.fn();
    infinite.mounted?.(el, binding(load));
    await Promise.resolve();
    expect(load).not.toHaveBeenCalled();
    el.dispatchEvent(new Event('scroll'));
    expect(load).not.toHaveBeenCalled();
    Object.defineProperty(el, 'scrollTop', { configurable: true, value: 190 });
    el.dispatchEvent(new Event('scroll'));
    // 节流默认 200ms，首次触发后第二次被节流；等待后应触发。
    expect(load).toHaveBeenCalledTimes(0);
    vi.useFakeTimers();
    try {
      const el2 = scrollable({ scrollTop: 190, clientHeight: 100, scrollHeight: 300 });
      el2.setAttribute('infinite-scroll-distance', '20');
      el2.setAttribute('infinite-scroll-delay', '0');
      const load2 = vi.fn();
      infinite.mounted?.(el2, binding(load2));
      el2.dispatchEvent(new Event('scroll'));
      expect(load2).toHaveBeenCalledTimes(1);
      el2.setAttribute('infinite-scroll-disabled', 'true');
      el2.dispatchEvent(new Event('scroll'));
      expect(load2).toHaveBeenCalledTimes(1);
      infinite.unmounted?.(el2);
    } finally {
      vi.useRealTimers();
    }
    infinite.unmounted?.(el);
  });

  it('triggers immediately when content does not fill container and cleans up', async () => {
    const el = scrollable({ scrollTop: 0, clientHeight: 200, scrollHeight: 100 });
    el.style.overflowY = 'auto';
    el.setAttribute('infinite-scroll-delay', '0');
    const load = vi.fn();
    const removeSpy = vi.spyOn(el, 'removeEventListener');
    infinite.mounted?.(el, binding(load));
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(load).toHaveBeenCalled();
    infinite.unmounted?.(el);
    expect(removeSpy).toHaveBeenCalled();
  });

  it('uses the latest callback after directive updates', () => {
    const el = scrollable({ scrollTop: 100, clientHeight: 100, scrollHeight: 200 });
    el.setAttribute('infinite-scroll-delay', '0');
    const first = vi.fn();
    const second = vi.fn();
    infinite.mounted?.(el, binding(first));
    infinite.updated?.(el, binding(second, first));
    el.dispatchEvent(new Event('scroll'));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    infinite.unmounted?.(el);
  });
});
