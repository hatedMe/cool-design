import { describe, expect, it, vi } from 'vitest';
import type { DirectiveBinding } from 'vue';
import { ClickOutside, InfiniteScroll, LoadingDirective } from '..';

const binding = <T>(value: T, oldValue?: T) => ({ value, oldValue } as DirectiveBinding<T>);

describe('directives', () => {
  it('toggles a loading mask and removes it on unmount', () => {
    const el = document.createElement('div');
    LoadingDirective.mounted?.(el, binding(true));
    expect(el.querySelector('.i-loading-mask')).not.toBeNull();
    LoadingDirective.updated?.(el, binding(false, true));
    expect(el.querySelector('.i-loading-mask')).toBeNull();
    LoadingDirective.unmounted?.(el);
  });

  it('calls click outside handler and ignores inside clicks', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    ClickOutside.mounted?.(el, binding(handler));
    document.body.appendChild(el);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
    ClickOutside.unmounted?.(el);
    el.remove();
  });

  it('loads more when scrolling within the configured distance', () => {
    const el = document.createElement('div');
    Object.defineProperties(el, {
      scrollTop: { configurable: true, value: 100 },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 200 }
    });
    const load = vi.fn();
    InfiniteScroll.mounted?.(el, binding(load));
    el.dispatchEvent(new Event('scroll'));
    expect(load).toHaveBeenCalledTimes(1);
    InfiniteScroll.unmounted?.(el);
  });
});
