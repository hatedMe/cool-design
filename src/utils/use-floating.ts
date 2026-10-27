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
} from "vue";
import { overlayKey } from "../../package/config-provider/context";
import { isTopOverlay, isTopFocusOverlay, pushOverlay, removeOverlay } from "./overlay-stack";
export type Placement = "top" | "bottom" | "left" | "right";
interface FloatingController {
  target: ComputedRef<HTMLElement>;
  style: Ref<CSSProperties>;
  placement: Ref<Placement>;
  restoreFocus: () => void;
  update: () => void;
}
export function useFloating(options: {
  open: Ref<boolean>;
  reference: Ref<HTMLElement | undefined>;
  floating: Ref<HTMLElement | undefined>;
  placement: () => Placement;
  close: () => void;
  trapFocus?: boolean;
}): FloatingController {
  const host = inject(overlayKey, undefined);
  const token = Symbol("floating");
  let active = false;
  let observer: ResizeObserver | undefined;
  const style = ref<CSSProperties>({ position: "fixed", visibility: "hidden" });
  const placement = ref<Placement>(options.placement());
  let zIndex = 2001;
  const target = computed(() => host?.value || document.body);
  const items = () =>
    Array.from(
      options.floating.value?.querySelectorAll<HTMLElement>(
        'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]'
      ) || []
    );
  const focusFirst = () => (items()[0] || options.floating.value)?.focus();
  const restoreFocus = () =>
    options.reference.value?.querySelector<HTMLElement>("button,a[href],input,select,textarea,[tabindex]")?.focus();
  const update = () => {
    const anchor = options.reference.value;
    const panel = options.floating.value;
    if (!active || !anchor || !panel) return;
    const a = anchor.getBoundingClientRect(),
      p = panel.getBoundingClientRect();
    const width = document.documentElement.clientWidth || window.innerWidth,
      height = document.documentElement.clientHeight || window.innerHeight;
    const gap = 8;
    const available = {
      top: a.top - gap,
      bottom: height - a.bottom - gap,
      left: a.left - gap,
      right: width - a.right - gap
    };
    const opposite: Record<Placement, Placement> = { top: "bottom", bottom: "top", left: "right", right: "left" };
    let side = options.placement();
    const extent = side === "top" || side === "bottom" ? p.height : p.width;
    if (available[side] < extent && available[opposite[side]] > available[side]) side = opposite[side];
    let x = a.left + (a.width - p.width) / 2,
      y = a.top + (a.height - p.height) / 2;
    if (side === "top") y = a.top - p.height - gap;
    if (side === "bottom") y = a.bottom + gap;
    if (side === "left") x = a.left - p.width - gap;
    if (side === "right") x = a.right + gap;
    x = Math.max(gap, Math.min(x, width - p.width - gap));
    y = Math.max(gap, Math.min(y, height - p.height - gap));
    placement.value = side;
    style.value = { position: "fixed", left: `${x}px`, top: `${y}px`, zIndex, visibility: "visible" };
  };
  const contains = (target: Node | null) =>
    !!target && (!!options.reference.value?.contains(target) || !!options.floating.value?.contains(target));
  const outside = (event: Event) => {
    if (isTopOverlay(token) && !contains(event.target as Node)) options.close();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isTopOverlay(token)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      options.close();
      return;
    }
    if (event.key !== "Tab" || !options.trapFocus || !isTopFocusOverlay(token)) return;
    const list = items(),
      first = list[0],
      last = list[list.length - 1];
    if (!first) {
      event.preventDefault();
      options.floating.value?.focus();
    } else if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === options.floating.value)
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || !options.floating.value?.contains(document.activeElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  };
  const focusin = (event: FocusEvent) => {
    if (options.trapFocus && isTopFocusOverlay(token) && !options.floating.value?.contains(event.target as Node))
      focusFirst();
  };
  const cleanup = (restore = false) => {
    if (!active) return;
    const shouldRestore =
      restore &&
      options.trapFocus &&
      isTopFocusOverlay(token) &&
      options.floating.value?.contains(document.activeElement);
    active = false;
    removeOverlay(token);
    window.removeEventListener("resize", update);
    window.removeEventListener("scroll", update, true);
    document.removeEventListener("pointerdown", outside, true);
    document.removeEventListener("keydown", keydown, true);
    document.removeEventListener("focusin", focusin);
    observer?.disconnect();
    observer = undefined;
    if (shouldRestore) restoreFocus();
  };
  onMounted(() =>
    watch(
      options.open,
      async (open) => {
        cleanup(!open);
        if (!open) return;
        active = true;
        zIndex = pushOverlay(token, options.trapFocus);
        style.value = { position: "fixed", visibility: "hidden", zIndex };
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        document.addEventListener("pointerdown", outside, true);
        document.addEventListener("keydown", keydown, true);
        document.addEventListener("focusin", focusin);
        await nextTick();
        if (!active || !options.open.value) return;
        update();
        if (options.trapFocus) focusFirst();
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(update);
          if (options.reference.value) observer.observe(options.reference.value);
          if (options.floating.value) observer.observe(options.floating.value);
        }
      },
      { immediate: true, flush: "sync" }
    )
  );
  watch(options.placement, () => nextTick(update));
  onBeforeUnmount(() => cleanup(true));
  return { target, style, placement, restoreFocus, update };
}
