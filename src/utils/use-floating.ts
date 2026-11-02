import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type Ref,
  type ComputedRef
} from 'vue';
import { overlayKey } from '../../packages/cool-design/config-provider/context';
import { isTopOverlay, isTopFocusOverlay, pushOverlay, removeOverlay } from './overlay-stack';
import { useZIndex } from '../../packages/hooks/use-z-index';

export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

type BasePlacement = 'top' | 'bottom' | 'left' | 'right';
type AppendTo = string | HTMLElement | undefined;
export type FloatingReference = HTMLElement | { getBoundingClientRect: () => DOMRect };

interface FloatingController {
  target: ComputedRef<HTMLElement>;
  style: Ref<CSSProperties>;
  placement: Ref<Placement>;
  arrowStyle: Ref<CSSProperties>;
  restoreFocus: () => void;
  update: () => void;
}

const placementParts = (value: Placement): [BasePlacement, 'start' | 'end' | undefined] => {
  const [side, align] = value.split('-') as [BasePlacement, 'start' | 'end' | undefined];
  return [side, align];
};

export function useFloating(options: {
  open: Ref<boolean>;
  reference: Ref<FloatingReference | undefined>;
  floating: Ref<HTMLElement | undefined>;
  placement: () => Placement;
  close: () => void;
  trapFocus?: boolean;
  offset?: () => number;
  appendTo?: () => AppendTo;
  zIndex?: () => number | undefined;
  closeOnOutside?: () => boolean;
}): FloatingController {
  const host = inject(overlayKey, undefined);
  const token = Symbol('floating');
  let active = false;
  let observer: ResizeObserver | undefined;
  const style = ref<CSSProperties>({ position: 'fixed', visibility: 'hidden' });
  const arrowStyle = ref<CSSProperties>({});
  const placement = ref<Placement>(options.placement());
  const { nextZIndex } = useZIndex();
  let zIndex = 2001;
  const target = computed(() => {
    const value = options.appendTo?.();
    if (value instanceof HTMLElement) return value;
    if (typeof value === 'string') {
      try {
        const element = document.querySelector<HTMLElement>(value);
        if (element) return element;
      } catch {
        // Invalid selectors fall back to the configured host.
      }
    }
    return host?.value || document.body;
  });
  const items = () =>
    Array.from(
      options.floating.value?.querySelectorAll<HTMLElement>(
        'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]'
      ) || []
    );
  const focusFirst = () => (items()[0] || options.floating.value)?.focus();
  const restoreFocus = () => {
    if (options.reference.value instanceof HTMLElement)
      options.reference.value.querySelector<HTMLElement>('button,a[href],input,select,textarea,[tabindex]')?.focus();
  };
  const update = () => {
    const anchor = options.reference.value;
    const panel = options.floating.value;
    if (!active || !anchor || !panel) return;
    const a = anchor.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const width = document.documentElement.clientWidth || window.innerWidth;
    const height = document.documentElement.clientHeight || window.innerHeight;
    const gap = Math.max(0, options.offset?.() ?? 8);
    const available = {
      top: a.top - gap,
      bottom: height - a.bottom - gap,
      left: a.left - gap,
      right: width - a.right - gap
    };
    const opposite: Record<BasePlacement, BasePlacement> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    const requested = options.placement();
    const [requestedSide, align] = placementParts(requested);
    let side = requestedSide;
    const extent = side === 'top' || side === 'bottom' ? p.height : p.width;
    if (available[side] < extent && available[opposite[side]] > available[side]) side = opposite[side];
    const actualPlacement = align ? `${side}-${align}` as Placement : side;
    let x = a.left + (a.width - p.width) / 2;
    let y = a.top + (a.height - p.height) / 2;
    if (side === 'top' || side === 'bottom') {
      if (align === 'start') x = a.left;
      if (align === 'end') x = a.right - p.width;
      y = side === 'top' ? a.top - p.height - gap : a.bottom + gap;
    } else {
      if (align === 'start') y = a.top;
      if (align === 'end') y = a.bottom - p.height;
      x = side === 'left' ? a.left - p.width - gap : a.right + gap;
    }
    x = Math.max(gap, Math.min(x, width - p.width - gap));
    y = Math.max(gap, Math.min(y, height - p.height - gap));
    placement.value = actualPlacement;
    style.value = {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      zIndex,
      visibility: 'visible'
    };
    const arrow = 8;
    arrowStyle.value =
      side === 'top' || side === 'bottom'
        ? { left: `${Math.max(arrow, Math.min(a.left + a.width / 2 - x, p.width - arrow))}px` }
        : { top: `${Math.max(arrow, Math.min(a.top + a.height / 2 - y, p.height - arrow))}px` };
  };
  const contains = (value: Node | null) =>
    !!value &&
    ((options.reference.value instanceof HTMLElement && options.reference.value.contains(value)) ||
      !!options.floating.value?.contains(value));
  const outside = (event: Event) => {
    if (options.closeOnOutside?.() === false) return;
    if (isTopOverlay(token) && !contains(event.target as Node)) options.close();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isTopOverlay(token)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      options.close();
      return;
    }
    if (event.key !== 'Tab' || !options.trapFocus || !isTopFocusOverlay(token)) return;
    const list = items(), first = list[0], last = list[list.length - 1];
    if (!first) {
      event.preventDefault();
      options.floating.value?.focus();
    } else if (event.shiftKey && (document.activeElement === first || document.activeElement === options.floating.value)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !options.floating.value?.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  };
  const focusin = (event: FocusEvent) => {
    if (options.trapFocus && isTopFocusOverlay(token) && !options.floating.value?.contains(event.target as Node)) focusFirst();
  };
  const cleanup = (restore = false) => {
    if (!active) return;
    const shouldRestore = restore && options.trapFocus && isTopFocusOverlay(token) && options.floating.value?.contains(document.activeElement);
    active = false;
    removeOverlay(token);
    window.removeEventListener('resize', update);
    window.removeEventListener('scroll', update, true);
    document.removeEventListener('pointerdown', outside, true);
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener('focusin', focusin);
    observer?.disconnect();
    observer = undefined;
    if (shouldRestore) restoreFocus();
  };
  onMounted(() =>
    watch(options.open, async (open) => {
      cleanup(!open);
      if (!open) return;
      active = true;
      const stackZIndex = pushOverlay(token, options.trapFocus);
      zIndex = options.zIndex?.() ?? Math.max(stackZIndex, nextZIndex());
      style.value = { position: 'fixed', visibility: 'hidden', zIndex };
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      document.addEventListener('pointerdown', outside, true);
      document.addEventListener('keydown', keydown, true);
      document.addEventListener('focusin', focusin);
      await nextTick();
      if (!active || !options.open.value) return;
      update();
      if (options.trapFocus) focusFirst();
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(update);
        const referenceElement = options.reference.value;
        if (referenceElement && 'nodeType' in referenceElement) observer.observe(referenceElement as Element);
        if (options.floating.value) observer.observe(options.floating.value);
      }
    }, { immediate: true, flush: 'sync' })
  );
  watch(options.placement, () => nextTick(update));
  onBeforeUnmount(() => cleanup(true));
  return { target, style, placement, arrowStyle, restoreFocus, update };
}
