import { computed, defineComponent, getCurrentInstance, normalizeClass, normalizeStyle, shallowRef, type PropType } from 'vue';
import type { FloatingReference, Placement } from '../../../src/utils/use-floating';
import type { TooltipInstance } from '../tooltip';
import Tooltip, { tooltipProps } from '../tooltip/tooltip';

type Trigger = 'hover' | 'focus' | 'click' | 'contextmenu';
export type PopoverVirtualRef = FloatingReference;
export type PopoverDirectiveValue =
  | string
  | {
      content?: string;
      title?: string;
      placement?: Placement;
      trigger?: Trigger | Trigger[];
      effect?: 'light' | 'dark';
      offset?: number;
      showArrow?: boolean;
      disabled?: boolean;
    };

type PopoverSlots = Readonly<{
  reference: () => unknown;
  default: (scope: { hide: () => void }) => unknown;
  content: () => unknown;
}>;

const Popover = defineComponent({
  name: 'i-popover',
  props: {
    content: tooltipProps.content,
    title: { type: String, default: '' },
    placement: tooltipProps.placement,
    disabled: tooltipProps.disabled,
    trigger: tooltipProps.trigger,
    triggerKeys: { type: Array as PropType<string[]>, default: () => ['Enter', 'NumpadEnter', 'Space'] },
    transition: tooltipProps.transition,
    width: { type: [String, Number], default: 150 },
    showAfter: tooltipProps.showAfter,
    hideAfter: tooltipProps.hideAfter,
    autoClose: tooltipProps.autoClose,
    enterable: tooltipProps.enterable,
    showArrow: tooltipProps.showArrow,
    arrowOffset: tooltipProps.arrowOffset,
    effect: { type: String, default: 'light' },
    offset: { type: Number, default: undefined },
    fallbackPlacements: tooltipProps.fallbackPlacements,
    strategy: tooltipProps.strategy,
    popperOptions: tooltipProps.popperOptions,
    visible: tooltipProps.visible,
    persistent: { type: Boolean, default: true },
    teleported: tooltipProps.teleported,
    appendTo: tooltipProps.appendTo,
    popperClass: tooltipProps.popperClass,
    popperStyle: tooltipProps.popperStyle,
    zIndex: tooltipProps.zIndex,
    virtualTriggering: tooltipProps.virtualTriggering,
    virtualRef: tooltipProps.virtualRef
  },
  emits: {
    'update:visible': (visible: boolean) => typeof visible === 'boolean',
    'visible-change': (visible: boolean) => typeof visible === 'boolean',
    'before-show': () => true,
    show: () => true,
    'before-hide': () => true,
    hide: () => true,
    'before-enter': () => true,
    'after-enter': () => true,
    'before-leave': () => true,
    'after-leave': () => true
  },
  setup(props, { slots: contextSlots, emit, expose }) {
    const slots: Partial<PopoverSlots> = contextSlots;
    const owner = getCurrentInstance();
    const tooltip = shallowRef<TooltipInstance>();
    const hasUpdateHandler = () => !!owner?.vnode.props?.['onUpdate:visible'];
    const hide = () => {
      if (props.visible === true && !hasUpdateHandler()) emit('update:visible', false);
      else tooltip.value?.hide();
    };
    const update = () => tooltip.value?.update();

    expose({
      popperRef: computed(() => tooltip.value?.popperRef),
      show: () => tooltip.value?.show(),
      hide,
      update,
      updatePopper: update
    });

    return () => {
      const { title, width, popperClass, popperStyle, ...floatingProps } = props;
      const scopedSlot = { hide };
      const defaultIsContent = !!slots.reference || props.virtualTriggering;
      return (
        <Tooltip
          ref={tooltip}
          {...floatingProps}
          ariaLabel={title || undefined}
          triggerClass='i-popover__trigger'
          arrowClass='i-popover__arrow'
          popperClass={normalizeClass(['i-popover', `i-popover--${props.effect}`, popperClass])}
          popperStyle={normalizeStyle([{ width: typeof width === 'number' ? `${width}px` : width }, popperStyle])}
          gpuAcceleration={props.transition === 'el-fade-in-linear'}
          closeOnOutside={props.virtualTriggering ? undefined : true}
          onUpdate:visible={props.visible == null || hasUpdateHandler() ? (value: boolean) => emit('update:visible', value) : undefined}
          onVisible-change={(value: boolean) => emit('visible-change', value)}
          onBefore-show={() => {
            emit('before-enter');
            emit('before-show');
          }}
          onShow={() => { emit('show'); emit('after-enter'); }}
          onBefore-hide={() => {
            emit('before-leave');
            emit('before-hide');
          }}
          onHide={() => {
            emit('hide');
            emit('update:visible', false);
            emit('after-leave');
          }}
          v-slots={{
            default: () => slots.reference?.() ?? slots.default?.(scopedSlot),
            content: () => (
              <>
                {title && <div class='i-popover__title'>{title}</div>}
                <div class='i-popover__content'>
                  {(defaultIsContent ? slots.default?.(scopedSlot) : undefined) ?? slots.content?.() ?? props.content}
                </div>
              </>
            )
          }}
        />
      );
    };
  }
});

// Vue 3.2 的 $slots 使用字符串索引，在公开实例上替换为声明的插槽。
type PopoverOptions = { [K in keyof typeof Popover]: (typeof Popover)[K] };
type PopoverComponent = PopoverOptions & (
  new (...args: ConstructorParameters<typeof Popover>) => Omit<InstanceType<typeof Popover>, '$slots'> & {
    $slots: PopoverSlots;
  }
);

export default (Popover as PopoverOptions) as PopoverComponent;
