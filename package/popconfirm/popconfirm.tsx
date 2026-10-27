import { Teleport, cloneVNode, computed, defineComponent, ref, watch, type PropType } from 'vue';
import Button from '../button';
import type { ButtonType } from '../button/types';
import { useFloating, type Placement } from '../../src/utils/use-floating';
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
    hideIcon: Boolean,
    width: { type: [String, Number] as PropType<string | number>, default: undefined }
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  setup(props, { slots, emit }) {
    const internal = ref(false);
    const reference = ref<HTMLElement>(),
      floating = ref<HTMLElement>();
    let acted = false;
    const panelId = `i-popconfirm-${++id}`;
    const open = computed(() => !props.disabled && (props.modelValue ?? internal.value));
    const setOpen = (value: boolean) => {
      internal.value = value;
      emit('update:modelValue', value);
    };
    const finish = (action: 'confirm' | 'cancel') => {
      if (!open.value || acted) return;
      acted = true;
      setOpen(false);
      emit(action);
    };
    const position = useFloating({
      open,
      reference,
      floating,
      placement: () => props.placement,
      close: () => finish('cancel'),
      trapFocus: true
    });
    watch(
      open,
      (value) => {
        if (value) acted = false;
      },
      { flush: 'sync' }
    );
    const toggle = () => {
      if (props.disabled) return;
      if (open.value) finish('cancel');
      else {
        acted = false;
        setOpen(true);
      }
    };
    return () => (
      <>
        <span class='i-popconfirm__trigger' ref={reference} onClick={toggle}>
          {slots.default?.().map((vnode) =>
            cloneVNode(vnode, {
              'aria-haspopup': 'dialog',
              'aria-expanded': open.value,
              'aria-controls': open.value ? panelId : undefined
            })
          )}
        </span>
        {open.value && (
          <Teleport to={position.target.value}>
            <section
              ref={floating}
              id={panelId}
              class='i-popconfirm'
              style={{
                ...position.style.value,
                width: typeof props.width === 'number' ? `${props.width}px` : props.width
              }}
              data-placement={position.placement.value}
              role='dialog'
              aria-labelledby={`${panelId}-title`}
              tabindex={-1}>
              <p id={`${panelId}-title`}>
                {!props.hideIcon && <span aria-hidden='true'>⚠ </span>}
                {props.title}
              </p>
              <div class='i-popconfirm__actions'>
                <Button size='small' type={props.cancelButtonType as ButtonType} onClick={() => finish('cancel')}>
                  {props.cancelButtonText}
                </Button>
                <Button
                  size='small'
                  type={props.confirmButtonType as ButtonType}
                  data-popconfirm-confirm
                  onClick={() => finish('confirm')}>
                  {props.confirmButtonText}
                </Button>
              </div>
            </section>
          </Teleport>
        )}
      </>
    );
  }
});
