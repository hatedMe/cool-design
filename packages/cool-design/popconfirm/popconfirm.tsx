import { useNamespace } from '../../hooks/use-namespace';
import { computed, defineComponent, getCurrentInstance, ref, shallowRef, watch, type Component, type PropType, type VNodeChild } from 'vue';
import Button from '../button';
import type { ButtonType } from '../button/types';
import Icon from '../icon';
import Tooltip, { type TooltipInstance } from '../tooltip';
import { tooltipProps } from '../tooltip/tooltip';

export interface PopconfirmActions {
  confirm(event?: MouseEvent): void;
  cancel(event?: MouseEvent): void;
}

interface PopconfirmSlots {
  reference?: () => VNodeChild;
  default?: () => VNodeChild;
  icon?: () => VNodeChild;
  actions?: (actions: PopconfirmActions) => VNodeChild;
}

const Popconfirm = defineComponent({
  name: 'i-popconfirm',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: undefined },
    visible: tooltipProps.visible,
    title: { type: String, default: '确定执行此操作吗？' },
    confirmButtonText: { type: String, default: '确定' },
    cancelButtonText: { type: String, default: '取消' },
    confirmButtonType: { type: String, default: 'primary' },
    cancelButtonType: { type: String, default: 'default' },
    icon: { type: [String, Object, Function] as PropType<string | Component>, default: undefined },
    iconColor: { type: String, default: '#f90' },
    hideIcon: Boolean,
    effect: { type: String as PropType<'light' | 'dark'>, default: 'light' },
    width: [String, Number],
    disabled: tooltipProps.disabled,
    trigger: { type: tooltipProps.trigger.type, default: 'click' },
    triggerKeys: tooltipProps.triggerKeys,
    placement: tooltipProps.placement,
    transition: tooltipProps.transition,
    showArrow: tooltipProps.showArrow,
    popperOptions: tooltipProps.popperOptions,
    teleported: tooltipProps.teleported,
    appendTo: tooltipProps.appendTo,
    persistent: tooltipProps.persistent,
    hideAfter: tooltipProps.hideAfter,
    virtualTriggering: tooltipProps.virtualTriggering,
    virtualRef: tooltipProps.virtualRef
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    'update:visible': (value: boolean) => typeof value === 'boolean',
    confirm: (event?: MouseEvent) => event === undefined || event instanceof MouseEvent,
    cancel: (event?: MouseEvent) => event === undefined || event instanceof MouseEvent
  },
  setup(props, { attrs, slots: contextSlots, emit, expose }) {
    const slots: PopconfirmSlots = contextSlots;
    const ns = useNamespace('popconfirm');
    const owner = getCurrentInstance();
    const tooltip = shallowRef<TooltipInstance>();
    const internal = ref(false);
    const locallyClosed = ref(false);
    watch([() => props.modelValue, () => props.visible, () => props.disabled],
      () => { locallyClosed.value = false; }, { flush: 'sync' });
    const visible = computed(() => props.modelValue ??
      (props.visible == null ? internal.value : props.visible && !locallyClosed.value));
    const open = computed(() => visible.value && !props.disabled &&
      (!props.virtualTriggering || !!props.virtualRef));
    let acted = false;
    watch(open, (value) => {
      if (value) acted = false;
    }, { flush: 'sync' });
    const setVisible = (value: boolean) => {
      if (props.visible == null || props.modelValue != null) internal.value = value;
      emit('update:modelValue', value);
      emit('update:visible', value);
    };
    const hide = () => tooltip.value?.onClose();
    const finish = (action: 'confirm' | 'cancel', event?: MouseEvent) => {
      if (!open.value || acted) return;
      acted = true;
      if (action === 'confirm') emit('confirm', event);
      else emit('cancel', event);
      tooltip.value?.onClose(event);
    };
    const confirm = (event?: MouseEvent) => finish('confirm', event);
    const cancel = (event?: MouseEvent) => finish('cancel', event);
    const dismiss = (event: Event) => {
      if (!acted) {
        acted = true;
        emit('cancel', event instanceof MouseEvent ? event : undefined);
      }
      tooltip.value?.hide(event);
    };

    expose({
      popperRef: computed(() => tooltip.value?.popperRef),
      show: () => tooltip.value?.onOpen(),
      hide
    });

    return () => {
      const { modelValue, visible: controlledVisible, title, confirmButtonText, cancelButtonText, confirmButtonType, cancelButtonType,
        icon, iconColor, hideIcon, width, ...floatingProps } = props;
      const passive = modelValue == null && controlledVisible != null && !owner?.vnode.props?.['onUpdate:visible'];
      return (
        <Tooltip
          ref={tooltip}
          {...attrs}
          {...floatingProps}
          visible={visible.value}
          onUpdate:visible={passive ? undefined : setVisible}
          onControlledClose={passive ? () => { locallyClosed.value = true; } : undefined}
          onDismiss={dismiss}
          trapFocus
          closeOnOutside
          contentRole='dialog'
          ariaLabel={title}
          triggerClass={ns.e('trigger')}
          popperClass={[ns.b(), ns.m(props.effect)]}
          popperStyle={{ width: typeof width === 'number' ? `${width}px` : width }}
          fallbackPlacements={['bottom', 'top', 'right', 'left']}
          v-slots={{
            default: () => slots.reference?.() ?? slots.default?.(),
            content: () => (
              <>
                <p class={ns.e('title')}>
                  {!hideIcon &&
                    (slots.icon?.() ??
                      (icon ? (
                        <Icon icon={icon} color={iconColor} />
                      ) : (
                        <span class={ns.e('icon')} style={{ color: iconColor }} aria-hidden='true'>
                          {'⚠ '}
                        </span>
                      )))}
                  {title}
                </p>
                {slots.actions?.({ confirm, cancel }) ?? (
                  <div class={ns.e('actions')}>
                    <Button size='small' type={cancelButtonType as ButtonType} onClick={cancel}>
                      {cancelButtonText}
                    </Button>
                    <Button size='small' type={confirmButtonType as ButtonType} data-popconfirm-confirm onClick={confirm}>
                      {confirmButtonText}
                    </Button>
                  </div>
                )}
              </>
            )
          }}
        />
      );
    };
  }
});

// Vue 3.2 的 $slots 带有字符串索引，公开实例使用组件声明的插槽类型。
type PopconfirmOptions = { [K in keyof typeof Popconfirm]: (typeof Popconfirm)[K] };
type PopconfirmComponent = PopconfirmOptions & (
  new (...args: ConstructorParameters<typeof Popconfirm>) => Omit<InstanceType<typeof Popconfirm>, '$slots'> & {
    $slots: PopconfirmSlots;
  }
);

export default (Popconfirm as PopconfirmOptions) as PopconfirmComponent;
