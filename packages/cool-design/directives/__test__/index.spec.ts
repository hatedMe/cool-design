import { describe, expect, it, vi } from 'vitest';
import type { DirectiveBinding } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { ClickOutside, InfiniteScroll, LoadingDirective, VPopover } from '..';
import type { PopoverDirectiveValue } from '../../popover/popover';

type LooseHook = (el: HTMLElement, binding?: DirectiveBinding<unknown>, vnode?: unknown, prev?: unknown) => void;
const hooks = (directive: unknown) => directive as Record<string, LooseHook | undefined>;
const loading = hooks(LoadingDirective);
const outside = hooks(ClickOutside);
const infinite = hooks(InfiniteScroll);

const binding = <T>(value: T, oldValue?: T, modifiers?: Record<string, boolean>) =>
  ({ value, oldValue, modifiers } as DirectiveBinding<T>);

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

  it('modifiers 让全屏遮罩挂到 body 并锁定滚动', () => {
    const el = document.createElement('div');
    const mods = { fullscreen: true, lock: true, body: true };
    loading.mounted?.(el, binding(true, undefined, mods));
    const mask = document.querySelector<HTMLElement>('.i-loading-mask');
    expect(mask).not.toBeNull();
    expect(mask?.parentElement).toBe(document.body);
    expect(mask?.classList.contains('is-fullscreen')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    loading.updated?.(el, binding(false, true, mods));
    expect(document.querySelector('.i-loading-mask')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('element-loading-* 元素属性声明文案、背景与图标', () => {
    const el = document.createElement('div');
    el.setAttribute('element-loading-text', '自定义文案');
    el.setAttribute('element-loading-background', 'rgba(0, 0, 0, 0.4)');
    el.setAttribute('element-loading-spinner', 'icon-refresh');
    loading.mounted?.(el, binding(true));
    const mask = el.querySelector<HTMLElement>('.i-loading-mask');
    expect(mask?.textContent).toContain('自定义文案');
    expect(mask?.style.background).toBe('rgba(0, 0, 0, 0.4)');
    expect(mask?.querySelector('.i-loading-mask__icon')?.className).toContain('icon-refresh');
    loading.unmounted?.(el);
  });

  it('选项对象声明 SVG 指示器并应用 viewBox 与尺寸', () => {
    const el = document.createElement('div');
    loading.mounted?.(el, binding({ svg: '<circle cx="12" cy="12" r="10" />', svgViewBox: '0 0 24 24', svgSize: 48 }));
    const svgWrap = el.querySelector<HTMLElement>('.i-loading-mask__svg');
    expect(svgWrap).not.toBeNull();
    const svg = svgWrap?.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg?.getAttribute('width')).toBe('48');
    expect(svg?.innerHTML).toContain('circle');
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

  it('v-popover 为元素挂载浮层并随指令更新卸载', async () => {
    const el = document.createElement('button');
    el.textContent = '触发';
    document.body.appendChild(el);
    const popover = hooks(VPopover);
    popover.mounted?.(el, binding('初始说明' as PopoverDirectiveValue));
    await flushPromises();
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flushPromises();
    const panel = document.querySelector<HTMLElement>('.i-popover');
    expect(panel?.textContent).toContain('初始说明');
    // 更新值时重建浮层
    popover.updated?.(el, binding({ content: '更新说明' } as PopoverDirectiveValue, '初始说明' as PopoverDirectiveValue));
    await flushPromises();
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flushPromises();
    expect(document.querySelector<HTMLElement>('.i-popover')?.textContent).toContain('更新说明');
    popover.unmounted?.(el);
    await flushPromises();
    expect(document.querySelector('.i-popover')).toBeNull();
    el.remove();
  });
});