import {
  Teleport,
  cloneVNode,
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type PropType
} from 'vue';
import { useFloating, type FloatingReference, type Placement } from '../../../src/utils/use-floating';

let id = 0;
type Trigger = 'hover' | 'focus' | 'click' | 'contextmenu';
type AppendTo = string | HTMLElement;
export type TooltipVirtualRef = FloatingReference;

export default defineComponent({
  name: 'i-tooltip',
  props: {
    content: { type: String, default: '' },
    rawContent: Boolean,
    placement: { type: String as PropType<Placement>, default: 'bottom' },
    disabled: Boolean,
    trigger: { type: String as PropType<Trigger>, default: 'hover' },
    showAfter: { type: Number, default: 0 },
    hideAfter: { type: Number, default: 200 },
    enterable: { type: Boolean, default: true },
    showArrow: { type: Boolean, default: true },
    effect: { type: String as PropType<'light' | 'dark'>, default: 'dark' },
    offset: { type: Number, default: 12 },
    visible: { type: Boolean as PropType<boolean | null>, default: null },
    teleported: { type: Boolean, default: true },
    appendTo: { type: [String, Object] as PropType<AppendTo>, default: undefined },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    popperStyle: { type: [String, Array, Object] as PropType<string | CSSProperties | CSSProperties[]>, default: undefined },
    zIndex: { type: Number, default: undefined },
    virtualTriggering: Boolean,
    virtualRef: { type: Object as PropType<TooltipVirtualRef>, default: undefined }
  },
  emits: ['update:visible', 'before-show', 'show', 'before-hide', 'hide', 'open', 'close', 'visible-change'],
  setup(props, { slots, emit, expose }) {
    const reference = ref<FloatingReference>();
    const floating = ref<HTMLElement>();
    const hovered = ref(false);
    const focused = ref(false);
    const clicked = ref(false);
    const contexted = ref(false);
    const internalVisible = ref(false);
    const timer = ref<ReturnType<typeof setTimeout>>();
    const tooltipId = `i-tooltip-${++id}`;
    const wasOpen = ref(false);
    const virtualListeners = ref<Array<() => void>>([]);

    const triggered = computed(() => {
      if (props.trigger === 'click') return clicked.value;
      if (props.trigger === 'focus') return focused.value;
      if (props.trigger === 'contextmenu') return contexted.value;
      return hovered.value || focused.value;
    });
    const open = computed(() => {
      const controlled = props.visible !== null ? props.visible : internalVisible.value;
      return !props.disabled && controlled && !!(props.content || slots.content) && (!!reference.value || !!props.virtualRef);
    });
    const position = useFloating({
      open,
      reference,
      floating,
      placement: () => props.placement,
      offset: () => props.offset,
      appendTo: () => props.appendTo,
      zIndex: () => props.zIndex,
      closeOnOutside: () => !props.virtualTriggering && props.visible === null,
      close: () => closeTooltip()
    });

    const clearTimer = () => {
      if (timer.value) clearTimeout(timer.value);
      timer.value = undefined;
    };
    const setVisible = (value: boolean) => {
      if (props.visible === null) internalVisible.value = value;
      emit('update:visible', value);
    };
    const openTooltip = () => {
      clearTimer();
      if (props.disabled || !triggered.value) return;
      const show = () => {
        if (open.value) return;
        emit('before-show');
        setVisible(true);
        emit('show');
      };
      if (props.showAfter > 0) timer.value = setTimeout(show, props.showAfter);
      else show();
    };
    function closeTooltip() {
      clearTimer();
      if (props.trigger === 'click') clicked.value = false;
      if (props.trigger === 'contextmenu') contexted.value = false;
      const hide = () => {
        if (!open.value) return;
        emit('before-hide');
        if (props.visible === null) internalVisible.value = false;
        emit('update:visible', false);
        emit('hide');
      };
      if (props.hideAfter > 0) timer.value = setTimeout(hide, props.hideAfter);
      else hide();
    }
    const leave = () => {
      if (props.trigger === 'hover' && !hovered.value && !focused.value) closeTooltip();
    };
    const onMouseenter = () => {
      if (props.trigger !== 'hover') return;
      hovered.value = true;
      openTooltip();
    };
    const onMouseleave = () => {
      if (props.trigger !== 'hover') return;
      hovered.value = false;
      if (props.enterable) clearTimer();
      leave();
    };
    const onFocusin = () => {
      if (props.trigger !== 'focus' && props.trigger !== 'hover') return;
      focused.value = true;
      openTooltip();
    };
    const onFocusout = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget as Node | null;
      if ((reference.value instanceof HTMLElement && reference.value.contains(nextTarget)) || floating.value?.contains(nextTarget)) return;
      focused.value = false;
      if (!hovered.value) closeTooltip();
    };
    const onClick = () => {
      if (props.trigger !== 'click') return;
      clicked.value = !clicked.value;
      if (clicked.value) {
        openTooltip();
      } else {
        closeTooltip();
      }
    };
    const onContextmenu = (event: MouseEvent) => {
      if (props.trigger !== 'contextmenu') return;
      event.preventDefault();
      contexted.value = true;
      openTooltip();
    };
    const onPanelEnter = () => {
      if (props.trigger === 'hover' && props.enterable) {
        clearTimer();
        hovered.value = true;
      }
    };
    const onPanelLeave = () => {
      if (props.trigger === 'hover' && props.enterable) {
        hovered.value = false;
        closeTooltip();
      }
    };
    const bindVirtualReference = () => {
      virtualListeners.value.forEach((remove) => {
        remove();
      });
      virtualListeners.value = [];
      if (!props.virtualTriggering || !props.virtualRef) {
        if (props.virtualTriggering) reference.value = undefined;
        return;
      }
      reference.value = props.virtualRef;
      const target = props.virtualRef;
      if (!(target instanceof HTMLElement)) return;
      const add = (event: string, handler: EventListener) => {
        target.addEventListener(event, handler);
        virtualListeners.value.push(() => target.removeEventListener(event, handler));
      };
      add('mouseenter', onMouseenter as EventListener);
      add('mouseleave', onMouseleave as EventListener);
      add('focusin', onFocusin as EventListener);
      add('focusout', onFocusout as EventListener);
      add('click', onClick as EventListener);
      add('contextmenu', onContextmenu as EventListener);
    };
    watch(() => [props.virtualTriggering, props.virtualRef], bindVirtualReference, { immediate: true });
    watch(open, (value) => {
      if (value === wasOpen.value) return;
      wasOpen.value = value;
      emit(value ? 'open' : 'close', value);
      emit('visible-change', value);
    });
    watch(() => props.disabled, (disabled) => {
      if (disabled) closeTooltip();
    });
    onMounted(bindVirtualReference);
    onBeforeUnmount(() => {
      clearTimer();
      virtualListeners.value.forEach((remove) => {
        remove();
      });
    });
    expose({
      show: () => {
        if (props.disabled || props.visible !== null) return;
        clearTimer();
        internalVisible.value = true;
      },
      hide: closeTooltip,
      update: position.update
    });

    return () => {
      const panel = open.value ? (
        <div
          id={tooltipId}
          ref={floating}
          class={['i-tooltip', `i-tooltip--${props.effect}`, props.popperClass]}
          role='tooltip'
          style={[position.style.value, props.popperStyle]}
          data-placement={position.placement.value}
          onMouseenter={onPanelEnter}
          onMouseleave={onPanelLeave}>
          {props.showArrow && (
            <span
              class='i-tooltip__arrow'
              style={position.arrowStyle.value}
              data-horizontal={position.placement.value.split('-')[0] === 'top' || position.placement.value.split('-')[0] === 'bottom' ? 'center' : position.placement.value.split('-')[0]}
              data-vertical={position.placement.value.split('-')[0] === 'top' || position.placement.value.split('-')[0] === 'bottom' ? position.placement.value.split('-')[0] : position.placement.value.split('-')[1] || 'center'}
            />
          )}
          {slots.content?.() ?? (props.rawContent ? <span innerHTML={props.content} /> : props.content)}
        </div>
      ) : null;
      const content = props.teleported && panel ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
      if (props.virtualTriggering) return content;
      return (
        <>
          <span
            class='i-tooltip__trigger'
            ref={reference}
            onMouseenter={onMouseenter}
            onMouseleave={onMouseleave}
            onClick={onClick}
            onContextmenu={onContextmenu}
            onFocusin={onFocusin}
            onFocusout={onFocusout}>
            {slots.default?.().map((vnode) =>
              cloneVNode(vnode, {
                'aria-describedby': open.value
                  ? [vnode.props?.['aria-describedby'], tooltipId].filter(Boolean).join(' ')
                  : vnode.props?.['aria-describedby']
              })
            )}
          </span>
          {content}
        </>
      );
    };
  }
});
