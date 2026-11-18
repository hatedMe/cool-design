import {
  Teleport,
  cloneVNode,
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  watch,
  type Component,
  type PropType
} from 'vue';
import Button from '../button';
import type { ButtonType } from '../button/types';
import Icon from '../icon';
import { useFloating, type Placement } from '../../../src/utils/use-floating';
let id = 0;
export default defineComponent({
  name: 'i-popconfirm',
  props: {
    modelValue: { type: Boolean, default: undefined },
    title: { type: String, default: '确定执行此操作吗？' },
    placement: { type: String as PropType<Placement>, default: 'bottom' },
    confirmButtonText: { type: String, default: '确定' },
    cancelButtonText: { type: String, default: '取消' },
    disabled: Boolean,
    confirmButtonType: { type: String, default: 'primary' },
    cancelButtonType: { type: String, default: 'default' },
    icon: { type: [String, Object, Function] as PropType<string | Component>, default: undefined },
    iconColor: { type: String, default: '#f90' },
    hideIcon: Boolean,
    effect: { type: String as PropType<'light' | 'dark'>, default: 'light' },
    width: { type: [String, Number] as PropType<string | number>, default: undefined },
    teleported: { type: Boolean, default: true },
    appendTo: { type: [String, Object] as PropType<string | HTMLElement>, default: undefined },
    persistent: Boolean,
    hideAfter: { type: Number, default: 0 }
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  setup(props, { slots, emit }) {
    const internal = ref(false);
    const shown = ref(false);
    const reference = ref<HTMLElement>(),
      floating = ref<HTMLElement>();
    const hideTimer = ref<ReturnType<typeof setTimeout>>();
    let acted = false;
    const panelId = `i-popconfirm-${++id}`;
    const open = computed(() => !props.disabled && (props.modelValue ?? internal.value));
    const setOpen = (value: boolean) => {
      internal.value = value;
      emit('update:modelValue', value);
    };
    const finish = (action: 'confirm' | 'cancel', event?: MouseEvent) => {
      if (!open.value) return;
      if (!acted) {
        acted = true;
        emit(action, event);
      }
      setOpen(false);
    };
    const confirm = (event?: MouseEvent) => {
      if (!open.value || acted) return;
      acted = true;
      emit('confirm', event);
      // hideAfter 语义：确认后自动关闭的延迟
      if (props.hideAfter > 0) hideTimer.value = setTimeout(() => setOpen(false), props.hideAfter);
      else setOpen(false);
    };
    const position = useFloating({
      open,
      reference,
      floating,
      placement: () => props.placement,
      appendTo: () => props.appendTo,
      close: () => finish('cancel'),
      trapFocus: true
    });
    watch(
      open,
      (value) => {
        if (hideTimer.value) {
          clearTimeout(hideTimer.value);
          hideTimer.value = undefined;
        }
        if (value) {
          acted = false;
          shown.value = true;
        }
      },
      { flush: 'sync' }
    );
    onBeforeUnmount(() => {
      if (hideTimer.value) clearTimeout(hideTimer.value);
    });
    const toggle = () => {
      if (props.disabled) return;
      if (open.value) finish('cancel');
      else {
        acted = false;
        setOpen(true);
      }
    };
    return () => {
      const kept = props.persistent && shown.value && !open.value;
      const panel = open.value || kept ? (
        <section
          ref={floating}
          id={panelId}
          class={['i-popconfirm', `i-popconfirm--${props.effect}`]}
          style={{
            ...position.style.value,
            width: typeof props.width === 'number' ? `${props.width}px` : props.width,
            ...(kept ? { display: 'none' } : undefined)
          }}
          data-placement={position.placement.value}
          role='dialog'
          aria-labelledby={`${panelId}-title`}
          aria-hidden={kept ? 'true' : undefined}
          tabindex={-1}>
          <p id={`${panelId}-title`} class='i-popconfirm__title'>
            {!props.hideIcon &&
              (slots.icon?.() ??
                (props.icon ? (
                  <Icon icon={props.icon} color={props.iconColor} />
                ) : (
                  <span class='i-popconfirm__icon' style={{ color: props.iconColor }} aria-hidden='true'>
                    ⚠{' '}
                  </span>
                )))}
            {props.title}
          </p>
          {slots.actions?.({ confirm, cancel: (event?: MouseEvent) => finish('cancel', event) }) ?? (
            <div class='i-popconfirm__actions'>
              <Button
                size='small'
                type={props.cancelButtonType as ButtonType}
                onClick={(event: MouseEvent) => finish('cancel', event)}>
                {props.cancelButtonText}
              </Button>
              <Button
                size='small'
                type={props.confirmButtonType as ButtonType}
                data-popconfirm-confirm
                onClick={(event: MouseEvent) => confirm(event)}>
                {props.confirmButtonText}
              </Button>
            </div>
          )}
        </section>
      ) : null;
      const content = props.teleported && panel ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
      return (
        <>
          <span class='i-popconfirm__trigger' ref={reference} onClick={toggle}>
            {(slots.reference?.() ?? slots.default?.())?.map((vnode) =>
              cloneVNode(vnode, {
                'aria-haspopup': 'dialog',
                'aria-expanded': open.value,
                'aria-controls': open.value ? panelId : undefined
              })
            )}
          </span>
          {content}
        </>
      );
    };
  }
});
