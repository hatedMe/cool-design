import {
  Teleport,
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type PropType
} from 'vue';
import { useFloating, type FloatingReference, type Placement } from '../../../src/utils/use-floating';

type Trigger = 'hover' | 'focus' | 'click' | 'contextmenu';
type AppendTo = string | HTMLElement;
export type PopoverVirtualRef = FloatingReference;

export default defineComponent({
  name: 'i-popover',
  props: {
    content: { type: String, default: '' },
    title: { type: String, default: '' },
    placement: { type: String as PropType<Placement>, default: 'bottom' },
    disabled: Boolean,
    trigger: { type: [String, Array] as PropType<Trigger | Trigger[]>, default: 'hover' },
    width: { type: [String, Number] as PropType<string | number>, default: undefined },
    showAfter: { type: Number, default: 0 },
    hideAfter: { type: Number, default: 200 },
    enterable: { type: Boolean, default: true },
    showArrow: { type: Boolean, default: true },
    effect: { type: String as PropType<'light' | 'dark'>, default: 'light' },
    offset: { type: Number, default: 12 },
    visible: { type: Boolean as PropType<boolean | null>, default: null },
    persistent: Boolean,
    teleported: { type: Boolean, default: true },
    appendTo: { type: [String, Object] as PropType<AppendTo>, default: undefined },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    popperStyle: { type: [String, Array, Object] as PropType<string | CSSProperties | CSSProperties[]>, default: undefined },
    zIndex: { type: Number, default: undefined },
    virtualTriggering: Boolean,
    virtualRef: { type: Object as PropType<PopoverVirtualRef>, default: undefined }
  },
  emits: [
    'update:visible',
    'visible-change',
    'before-show',
    'show',
    'before-hide',
    'hide',
    'before-enter',
    'after-enter',
    'before-leave',
    'after-leave'
  ],
  setup(props, { slots, emit, expose }) {
    const reference = ref<FloatingReference>();
    const floating = ref<HTMLElement>();
    const hovered = ref(false);
    const focused = ref(false);
    const clicked = ref(false);
    const contexted = ref(false);
    const internalVisible = ref(false);
    const shown = ref(false);
    const timer = ref<ReturnType<typeof setTimeout>>();
    const virtualListeners = ref<Array<() => void>>([]);

    const triggers = computed(() => (Array.isArray(props.trigger) ? props.trigger : [props.trigger]));
    const hasReference = computed(() => !!slots.reference);
    const triggered = computed(() => {
      const list = triggers.value;
      return (
        (list.includes('hover') && (hovered.value || focused.value)) ||
        (list.includes('focus') && focused.value) ||
        (list.includes('click') && clicked.value) ||
        (list.includes('contextmenu') && contexted.value)
      );
    });
    const open = computed(() => {
      const controlled = props.visible !== null ? props.visible : internalVisible.value;
      return !props.disabled && controlled && (!!reference.value || !!props.virtualRef);
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
      close: () => closePopover()
    });

    const clearTimer = () => {
      if (timer.value) clearTimeout(timer.value);
      timer.value = undefined;
    };
    const setVisible = (value: boolean) => {
      if (props.visible === null) internalVisible.value = value;
      emit('update:visible', value);
      emit('visible-change', value);
    };
    const openPopover = () => {
      clearTimer();
      if (props.disabled || !triggered.value) return;
      const show = () => {
        if (open.value) return;
        emit('before-enter');
        emit('before-show');
        setVisible(true);
        emit('show');
        nextTick(() => {
          if (open.value) emit('after-enter');
        });
      };
      if (props.showAfter > 0) timer.value = setTimeout(show, props.showAfter);
      else show();
    };
    function closePopover() {
      clearTimer();
      if (triggers.value.includes('click')) clicked.value = false;
      if (triggers.value.includes('contextmenu')) contexted.value = false;
      const hide = () => {
        if (!open.value) return;
        emit('before-leave');
        emit('before-hide');
        setVisible(false);
        emit('hide');
        nextTick(() => {
          if (!open.value) emit('after-leave');
        });
      };
      if (props.hideAfter > 0) timer.value = setTimeout(hide, props.hideAfter);
      else hide();
    }
    const leave = () => {
      if (triggers.value.includes('hover') && !hovered.value && !focused.value) closePopover();
    };
    const onMouseenter = () => {
      if (!triggers.value.includes('hover')) return;
      hovered.value = true;
      openPopover();
    };
    const onMouseleave = () => {
      if (!triggers.value.includes('hover')) return;
      hovered.value = false;
      if (props.enterable) clearTimer();
      leave();
    };
    const onFocusin = () => {
      if (!triggers.value.includes('focus') && !triggers.value.includes('hover')) return;
      focused.value = true;
      openPopover();
    };
    const onFocusout = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget as Node | null;
      if ((reference.value instanceof HTMLElement && reference.value.contains(nextTarget)) || floating.value?.contains(nextTarget)) return;
      focused.value = false;
      if (!hovered.value) closePopover();
    };
    const onClick = () => {
      if (!triggers.value.includes('click')) return;
      clicked.value = !clicked.value;
      if (clicked.value) {
        openPopover();
      } else {
        closePopover();
      }
    };
    const onContextmenu = (event: MouseEvent) => {
      if (!triggers.value.includes('contextmenu')) return;
      event.preventDefault();
      contexted.value = true;
      openPopover();
    };
    const onPanelEnter = () => {
      if (triggers.value.includes('hover') && props.enterable) {
        clearTimer();
        hovered.value = true;
      }
    };
    const onPanelLeave = () => {
      if (triggers.value.includes('hover') && props.enterable) {
        hovered.value = false;
        closePopover();
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
      if (value) shown.value = true;
    });
    watch(() => props.disabled, (disabled) => {
      if (disabled) closePopover();
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
      hide: closePopover,
      update: position.update
    });

    return () => {
      const kept = props.persistent && shown.value && !open.value;
      const width = typeof props.width === 'number' ? `${props.width}px` : props.width;
      const panel = open.value || kept ? (
        <div
          ref={floating}
          class={['i-popover', `i-popover--${props.effect}`, props.popperClass]}
          aria-hidden={kept ? 'true' : undefined}
          style={[position.style.value, props.popperStyle, width ? { width } : undefined, kept ? { display: 'none' } : undefined]}
          data-placement={position.placement.value}
          onMouseenter={onPanelEnter}
          onMouseleave={onPanelLeave}>
          {props.showArrow && (
            <span
              class='i-popover__arrow'
              style={position.arrowStyle.value}
              data-horizontal={position.placement.value.split('-')[0] === 'top' || position.placement.value.split('-')[0] === 'bottom' ? 'center' : position.placement.value.split('-')[0]}
              data-vertical={position.placement.value.split('-')[0] === 'top' || position.placement.value.split('-')[0] === 'bottom' ? position.placement.value.split('-')[0] : position.placement.value.split('-')[1] || 'center'}
            />
          )}
          {props.title && <div class='i-popover__title'>{props.title}</div>}
          <div class='i-popover__content'>
            {hasReference.value || props.virtualTriggering
              ? (slots.default?.() ?? slots.content?.() ?? props.content)
              : (slots.content?.() ?? props.content)}
          </div>
        </div>
      ) : null;
      const content = props.teleported && panel ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
      if (props.virtualTriggering) return content;
      return (
        <>
          <span
            class='i-popover__trigger'
            ref={reference}
            onMouseenter={onMouseenter}
            onMouseleave={onMouseleave}
            onClick={onClick}
            onContextmenu={onContextmenu}
            onFocusin={onFocusin}
            onFocusout={onFocusout}>
            {hasReference.value ? slots.reference?.() : slots.default?.()}
          </span>
          {content}
        </>
      );
    };
  }
});
