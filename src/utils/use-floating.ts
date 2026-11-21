import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type CSSProperties,
  type Ref,
  type ComputedRef
} from 'vue';
import { createPopper, type Instance, type Options, type Placement as PopperPlacement, type State, type VirtualElement } from '@popperjs/core';
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
export type FloatingReference = HTMLElement | VirtualElement;
export type FloatingOptions = { offset?: number; placement?: Placement };
export type PopperOptions = Partial<Options>;

interface FloatingController {
  target: ComputedRef<HTMLElement | string>;
  style: Ref<CSSProperties>;
  placement: Ref<PopperPlacement>;
  arrowStyle: Ref<CSSProperties>;
  attributes: Ref<State['attributes']>;
  instance: Ref<Instance | undefined>;
  restoreFocus: () => void;
  update: () => Promise<Partial<State>> | void;
}

const placementParts = (value: Placement): [BasePlacement, 'start' | 'end' | undefined] => {
  const [side, align] = value.split('-') as [BasePlacement, 'start' | 'end' | undefined];
  return [side, align];
};

export function useFloating(options: {
  open: Ref<boolean>;
  reference: Ref<FloatingReference | undefined>;
  floating: Ref<HTMLElement | undefined>;
  placement: () => PopperPlacement;
  fallbackPlacements?: () => PopperPlacement[] | undefined;
  close: (event: Event) => void;
  trapFocus?: boolean;
  offset?: () => number;
  appendTo?: () => AppendTo;
  zIndex?: () => number | undefined;
  closeOnEscape?: () => boolean;
  closeOnOutside?: () => boolean;
  options?: () => FloatingOptions | undefined;
  popper?: {
    options: () => PopperOptions | undefined;
    strategy: () => Options['strategy'];
    gpuAcceleration: () => boolean;
    roundOffsets?: () => boolean;
    arrow?: () => HTMLElement | undefined;
    arrowOffset?: () => number;
    eventListeners?: () => boolean;
    teleported?: () => boolean;
  };
}): FloatingController {
  const host = inject(overlayKey, undefined);
  const token = Symbol('floating');
  let active = false;
  let observer: ResizeObserver | undefined;
  const initialStrategy = options.popper?.options()?.strategy ?? options.popper?.strategy() ?? 'fixed';
  const style = ref<CSSProperties>({ position: initialStrategy, visibility: 'hidden' });
  const arrowStyle = ref<CSSProperties>({});
  const placement = ref(options.placement());
  const attributes = shallowRef<State['attributes']>({});
  const instance = shallowRef<Instance>();
  const { nextZIndex } = useZIndex();
  let zIndex = 2001;
  const target = computed(() => {
    const value = options.appendTo?.();
    if (typeof document === 'undefined') return typeof value === 'string' ? value : 'body';
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
  const referenceElement = () => {
    const anchor = options.reference.value;
    return anchor && ('nodeType' in anchor ? anchor : anchor.contextElement);
  };
  const restoreFocus = () => {
    const anchor = referenceElement();
    const focusable = 'button,a[href],input,select,textarea,[tabindex]';
    if (anchor instanceof HTMLElement) {
      const focusTarget = anchor.matches(focusable) ? anchor : anchor.querySelector<HTMLElement>(focusable);
      focusTarget?.focus({ preventScroll: true });
    }
  };
  const updateLegacy = () => {
    const anchor = options.reference.value;
    const panel = options.floating.value;
    if (!active || !anchor || !panel) return;
    const a = anchor.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const width = document.documentElement.clientWidth || window.innerWidth;
    const height = document.documentElement.clientHeight || window.innerHeight;
    const configured = options.options?.();
    const gap = Math.max(0, configured?.offset ?? options.offset?.() ?? 8);
    const available = {
      top: a.top - gap,
      bottom: height - a.bottom - gap,
      left: a.left - gap,
      right: width - a.right - gap
    };
    const opposite: Record<BasePlacement, BasePlacement> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    const requested = (configured?.placement ?? options.placement()) as Placement;
    const [requestedSide, requestedAlign] = placementParts(requested);
    let side = requestedSide;
    let align = requestedAlign;
    const candidates = [requested, ...((options.fallbackPlacements?.() || []) as Placement[])];
    const fits = (candidate: Placement) => {
      const [candidateSide] = placementParts(candidate);
      const extent = candidateSide === 'top' || candidateSide === 'bottom' ? p.height : p.width;
      return available[candidateSide] >= extent;
    };
    const selected = candidates.find(fits);
    if (selected) {
      [side, align] = placementParts(selected);
    } else {
      const extent = side === 'top' || side === 'bottom' ? p.height : p.width;
      if (available[side] < extent && available[opposite[side]] > available[side]) side = opposite[side];
    }
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
    const offsetParent = panel.offsetParent;
    const parent = offsetParent instanceof HTMLElement && getComputedStyle(panel).position === 'fixed'
      ? offsetParent
      : undefined;
    const origin = parent?.getBoundingClientRect();
    // Convert the viewport coordinates to layout pixels at the fixed containing block's padding edge.
    const scaleX = parent?.offsetWidth && origin?.width ? origin.width / parent.offsetWidth : 1;
    const scaleY = parent?.offsetHeight && origin?.height ? origin.height / parent.offsetHeight : 1;
    const left = parent && origin ? (x - origin.left) / scaleX - parent.clientLeft + parent.scrollLeft : x;
    const top = parent && origin ? (y - origin.top) / scaleY - parent.clientTop + parent.scrollTop : y;
    style.value = {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      zIndex,
      visibility: 'visible'
    };
    const arrow = 8;
    arrowStyle.value =
      side === 'top' || side === 'bottom'
        ? { left: `${Math.max(arrow, Math.min((a.left + a.width / 2 - x) / scaleX, p.width / scaleX - arrow))}px` }
        : { top: `${Math.max(arrow, Math.min((a.top + a.height / 2 - y) / scaleY, p.height / scaleY - arrow))}px` };
  };
  const update = () => options.popper ? instance.value?.update() : updateLegacy();
  const observeElements = () => {
    observer?.disconnect();
    const anchor = referenceElement();
    if (anchor) observer?.observe(anchor);
    if (options.floating.value) observer?.observe(options.floating.value);
  };
  const destroyPopper = () => {
    instance.value?.destroy();
    instance.value = undefined;
  };
  if (options.popper) {
    const config = options.popper;
    const popperOptions = computed<Options>(() => {
      const overrides = config.options();
      const arrow = config.arrow?.();
      return {
        placement: options.placement(),
        strategy: config.strategy(),
        ...overrides,
        modifiers: [
          { name: 'offset', options: { offset: [0, options.offset?.() ?? 12] } },
          { name: 'preventOverflow', options: { padding: 0 } },
          { name: 'flip', options: { padding: 5, fallbackPlacements: options.fallbackPlacements?.() } },
          { name: 'computeStyles', options: {
            gpuAcceleration: config.gpuAcceleration(), roundOffsets: config.roundOffsets?.() ?? true
          } },
          { name: 'arrow', enabled: !!arrow, options: { element: arrow, padding: config.arrowOffset?.() ?? 5 } },
          { name: 'eventListeners', enabled: config.eventListeners?.() ?? options.open.value },
          ...overrides?.modifiers ?? [],
          { name: 'applyStyles', enabled: false },
          {
            name: 'updateState', enabled: true, phase: 'afterWrite',
            effect: ({ state, instance }) => {
              // Popper reads the offset parent during its first update, including after public setOptions calls.
              state.elements.popper.style.position = state.options.strategy;
              return () => {
                // Discard output from modifiers that may be disabled by the next setOptions.
                instance.state.styles = {};
                instance.state.attributes = {};
              };
            },
            fn: ({ state }) => {
              placement.value = state.placement;
              style.value = { position: state.options.strategy, zIndex, ...state.styles.popper as CSSProperties };
              arrowStyle.value = { ...state.styles.arrow as CSSProperties };
              attributes.value = Object.fromEntries(
                Object.entries(state.attributes).map(([name, attrs]) => [name, Object.fromEntries(
                  Object.entries(attrs).filter(([, value]) => value !== false)
                    .map(([key, value]) => [key, value === true ? '' : value])
                )])
              );
            }
          }
        ]
      };
    });
    const teleportTarget = () => config.teleported?.() === false ? undefined : target.value;
    watch([options.reference, options.floating, popperOptions, teleportTarget, referenceElement],
      ([anchor, panel, config, container, context], [oldAnchor, oldPanel, , oldContainer, oldContext]) => {
        if (!anchor || !panel || anchor !== oldAnchor || panel !== oldPanel || container !== oldContainer || context !== oldContext) {
          destroyPopper();
          observeElements();
          if (anchor && panel) instance.value = createPopper(anchor, panel, config);
        } else {
          void instance.value?.setOptions(config);
        }
      }, { deep: true, flush: 'post' });
  }
  const contains = (value: Node | null) =>
    !!value &&
    ((options.reference.value instanceof HTMLElement && options.reference.value.contains(value)) ||
      !!options.floating.value?.contains(value));
  const outside = (event: Event) => {
    if (options.closeOnOutside?.() === false) return;
    if (isTopOverlay(token) && !contains(event.target as Node)) options.close(event);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.isComposing && options.closeOnEscape?.() !== false && isTopOverlay(token)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      options.close(event);
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
    if (!options.popper) {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    }
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
      if (!options.popper) {
        style.value = { position: 'fixed', visibility: 'hidden', zIndex };
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
      }
      document.addEventListener('pointerdown', outside, true);
      document.addEventListener('keydown', keydown, true);
      document.addEventListener('focusin', focusin);
      await nextTick();
      if (!active || !options.open.value) return;
      update();
      if (options.trapFocus) focusFirst();
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(update);
        observeElements();
      }
    }, { immediate: true, flush: 'sync' })
  );
  if (!options.popper) watch(options.placement, () => nextTick(update));
  onBeforeUnmount(() => {
    cleanup(true);
    destroyPopper();
  });
  return { target, style, placement, arrowStyle, attributes, instance, restoreFocus, update };
}
