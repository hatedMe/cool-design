import { computed, defineComponent, inject, nextTick, onBeforeUnmount, onMounted, provide, shallowRef, watch, type CSSProperties, type PropType, type StyleValue } from 'vue';
import { createPopper, type Instance, type Options, type Placement, type State } from '@popperjs/core';
import { useNamespace } from '../../hooks/use-namespace';
import { useZIndex } from '../../hooks/use-z-index';
import { popperKey, popperContentKey } from './context';

const styleProp = [String, Array, Object, Boolean] as PropType<StyleValue | boolean>;
export default defineComponent({
  name: 'i-popper-content',
  props: {
    boundariesPadding: { type: Number, default: 0 },
    offset: { type: Number, default: 12 },
    arrowOffset: { type: Number, default: 5 },
    placement: { type: String as PropType<Placement>, default: 'bottom' },
    strategy: { type: String as PropType<Options['strategy']>, default: 'absolute' },
    fallbackPlacements: Array as PropType<Placement[]>,
    popperOptions: { type: Object as PropType<Partial<Options>>, default: () => ({}) },
    gpuAcceleration: { type: Boolean, default: true },
    enterable: { type: Boolean, default: true },
    stopPopperMouseEvent: { type: Boolean, default: true },
    visible: Boolean,
    pure: Boolean,
    focusOnShow: Boolean,
    trapping: Boolean,
    virtualTriggering: Boolean,
    loop: Boolean,
    effect: { type: String, default: 'dark' },
    id: String,
    ariaLabel: String,
    className: [String, Array, Object, Boolean] as PropType<unknown>,
    popperClass: [String, Array, Object, Boolean] as PropType<unknown>,
    style: styleProp,
    popperStyle: styleProp,
    referenceEl: Object as PropType<HTMLElement>,
    triggerTargetEl: Object as PropType<HTMLElement>,
    zIndex: Number
  },
  emits: ['mouseenter', 'mouseleave', 'focus', 'blur', 'close'],
  setup(props, { slots, expose, emit }) {
    const context = inject(popperKey)!;
    const ns = useNamespace('popper');
    const element = shallowRef<HTMLElement>();
    const arrow = shallowRef<HTMLElement>();
    const styles = shallowRef<State['styles']>({});
    const attributes = shallowRef<State['attributes']>({});
    const { nextZIndex } = useZIndex();
    const zIndex = shallowRef(props.zIndex ?? nextZIndex());
    const reference = computed(() => props.referenceEl ?? context.referenceRef.value ?? context.triggerRef.value);
    const contentStyle = computed(() => [{ zIndex: zIndex.value }, styles.value.popper ?? {}, props.popperStyle || {}, props.style || {}] as StyleValue);
    const arrowStyle = computed(() => (styles.value.arrow ?? {}) as CSSProperties);
    provide(popperContentKey, { arrowRef: arrow, arrowStyle });
    const options = (): Partial<Options> => ({
      placement: props.placement,
      strategy: props.strategy,
      ...props.popperOptions,
      modifiers: [
        { name: 'offset', options: { offset: [0, props.offset] } },
        { name: 'preventOverflow', options: { padding: props.boundariesPadding } },
        { name: 'flip', options: { padding: props.boundariesPadding, fallbackPlacements: props.fallbackPlacements } },
        { name: 'computeStyles', options: { gpuAcceleration: props.gpuAcceleration } },
        { name: 'arrow', options: { element: arrow.value, padding: props.arrowOffset } },
        { name: 'eventListeners', enabled: props.visible },
        ...(props.popperOptions.modifiers ?? []),
        { name: 'capture', enabled: true, phase: 'afterWrite', fn({ state }) { styles.value = { ...state.styles }; attributes.value = { ...state.attributes }; } }
      ]
    });
    let instance: Instance | undefined;
    let previousFocus: HTMLElement | undefined;
    const focusable = () => [...(element.value?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]') ?? [])]
      .filter(node => node.tabIndex >= 0 && !node.hidden && node.getAttribute('aria-hidden') !== 'true' && getComputedStyle(node).display !== 'none');
    const focusFirst = () => (focusable()[0] ?? element.value)?.focus({ preventScroll: true });
    const updatePopper = (shouldUpdateZIndex = true) => {
      if (shouldUpdateZIndex) zIndex.value = props.zIndex ?? nextZIndex();
      return instance?.update();
    };
    onMounted(() => {
      watch([reference, element], ([target, content], _, cleanup) => {
        context.contentRef.value = content;
        if (!target || !content) return;
        const current = createPopper(target, content, options());
        instance = current;
        context.popperInstanceRef.value = current;
        cleanup(() => {
          current.destroy();
          if (instance === current) instance = undefined;
          if (context.popperInstanceRef.value === current) context.popperInstanceRef.value = undefined;
        });
      }, { immediate: true, flush: 'post' });
      watch(() => ({ ...props }), () => { void instance?.setOptions(options()); zIndex.value = props.zIndex ?? zIndex.value; }, { deep: true });
      watch(arrow, () => { void instance?.setOptions(options()); });
      watch(() => props.visible, async visible => {
        if (visible) {
          previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
          await nextTick();
          if (props.visible && props.focusOnShow) focusFirst();
        } else if (element.value?.contains(document.activeElement)) previousFocus?.focus({ preventScroll: true });
      }, { immediate: true });
      const trap = (event: FocusEvent) => {
        if (props.visible && props.trapping && event.target instanceof Node && !element.value?.contains(event.target)) focusFirst();
      };
      document.addEventListener('focusin', trap);
      onBeforeUnmount(() => document.removeEventListener('focusin', trap));
    });
    watch([element, () => props.triggerTargetEl, context.role, () => props.id, () => props.ariaLabel], (_, __, cleanup) => {
      const target = props.triggerTargetEl ?? element.value;
      if (!target) return;
      const values = { role: context.role.value, id: props.id, 'aria-label': props.ariaLabel, 'aria-modal': context.role.value === 'dialog' ? 'false' : undefined };
      const previous = Object.keys(values).map(key => [key, target.getAttribute(key)] as const);
      Object.entries(values).forEach(([key, value]) => value === undefined ? target.removeAttribute(key) : target.setAttribute(key, value));
      cleanup(() => previous.forEach(([key, value]) => value === null ? target.removeAttribute(key) : target.setAttribute(key, value)));
    }, { flush: 'post' });
    onBeforeUnmount(() => {
      if (element.value?.contains(document.activeElement)) previousFocus?.focus({ preventScroll: true });
      if (context.contentRef.value === element.value) context.contentRef.value = undefined;
    });
    expose({ popperContentRef: element, popperInstanceRef: context.popperInstanceRef, updatePopper, contentStyle });
    const onKeydown = (event: KeyboardEvent) => {
      if (!props.visible) return;
      if (event.key === 'Escape') emit('close');
      if (event.key !== 'Tab' || (!props.loop && !props.trapping)) return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) { event.preventDefault(); element.value?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === element.value)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    return () => <div
      {...attributes.value.popper}
      ref={element}
      class={[ns.b(), `is-${props.effect}`, props.pure && 'is-pure', props.className, props.popperClass]}
      style={contentStyle.value}
      tabindex={-1}
      onMouseenter={(event: MouseEvent) => emit('mouseenter', event)}
      onMouseleave={(event: MouseEvent) => emit('mouseleave', event)}
      onMousedown={(event: MouseEvent) => { if (props.stopPopperMouseEvent) event.stopPropagation(); }}
      onFocusin={() => emit('focus')}
      onFocusout={(event: FocusEvent) => { if (!(event.relatedTarget instanceof Node) || !element.value?.contains(event.relatedTarget)) emit('blur'); }}
      onKeydown={onKeydown}>{slots.default?.()}</div>;
  }
});
