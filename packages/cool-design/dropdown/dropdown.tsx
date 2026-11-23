import { cloneVNode, defineComponent, provide, ref, shallowRef, type ExtractPropTypes, type PropType } from 'vue';
import { defaultNamespace, useNamespace } from '../../hooks/use-namespace';
import { dropdownKey, type DropdownCommand, type DropdownTrigger } from './context';
import IDropdownMenu from './dropdown-menu';
import IDropdownItem, { type DropdownItemInstance } from './dropdown-item';
import Button from '../button/button';
import ButtonGroup from '../button/group';
import { Tooltip, type TooltipInstance } from '../tooltip';
import { tooltipProps } from '../tooltip/tooltip';

export interface DropdownItem {
  command: DropdownCommand;
  label: string;
  disabled?: boolean;
  divided?: boolean;
  icon?: string;
}

export type DropdownSize = '' | 'large' | 'default' | 'small';
export type DropdownPlacement = NonNullable<ExtractPropTypes<typeof tooltipProps>['placement']>;
export type DropdownType = '' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'text';

const dropdownProps = {
  items: { type: Array as PropType<DropdownItem[]>, default: () => [] },
  trigger: {
    type: [String, Array] as PropType<DropdownTrigger | DropdownTrigger[]>,
    default: 'hover'
  },
  hideOnClick: { type: Boolean, default: true },
  placement: tooltipProps.placement,
  disabled: Boolean,
  splitButton: Boolean,
  type: String as PropType<DropdownType>,
  buttonProps: Object as PropType<Record<string, unknown>>,
  size: { type: String as PropType<DropdownSize>, default: '' },
  showTimeout: { type: Number, default: 150 },
  hideTimeout: { type: Number, default: 150 },
  maxHeight: { type: [String, Number], default: '' },
  teleported: tooltipProps.teleported,
  appendTo: tooltipProps.appendTo,
  popperClass: tooltipProps.popperClass,
  popperStyle: tooltipProps.popperStyle,
  popperOptions: tooltipProps.popperOptions,
  showArrow: tooltipProps.showArrow,
  persistent: { type: Boolean, default: true },
  virtualTriggering: tooltipProps.virtualTriggering,
  virtualRef: tooltipProps.virtualRef,
  effect: { type: String, default: 'light' },
  role: { type: String, default: 'menu' },
  id: String,
  loop: { type: Boolean, default: true },
  tabindex: { type: [String, Number], default: 0 },
  triggerKeys: { type: Array as PropType<string[]>, default: () => ['Enter', 'Space', 'ArrowDown', 'NumpadEnter'] }
};

export default defineComponent({
  name: 'i-dropdown',
  props: dropdownProps,
  emits: {
    click: (mouseEvent: MouseEvent) => mouseEvent.type === 'click',
    command: (...args: [command: DropdownCommand, item: DropdownItemInstance, originalEvent: MouseEvent | KeyboardEvent]) =>
      args.length === 3,
    'visible-change': (visible: boolean) => typeof visible === 'boolean'
  },
  setup(props, { slots, emit, expose }) {
    const ns = useNamespace('dropdown');
    const open = ref(false);
    const tooltip = shallowRef<TooltipInstance>();
    const splitReference = shallowRef<HTMLElement>();
    const menu = ref<HTMLElement>();

    const handleOpen = () => tooltip.value?.onOpen();
    const handleClose = () => tooltip.value?.onClose();
    expose({ handleOpen, handleClose });

    provide(dropdownKey, {
      get disabled() { return props.disabled; },
      get role() { return props.role; },
      get id() { return props.id; },
      handleCommand(command, instance, event) {
        if (props.hideOnClick) tooltip.value?.hide(event);
        emit('command', command, instance, event);
      }
    });

    const menuItems = () => {
      const container = menu.value;
      if (!container) return [];
      const menus = [
        ...container.getElementsByClassName(ns.e('menu')),
        ...container.querySelectorAll('[data-dropdown-menu]')
      ];
      return Array.from(container.querySelectorAll<HTMLButtonElement>('button:not([disabled])'))
        .filter((button) => menus.some((list) => list.contains(button)));
    };

    const handleShow = (event?: Event) => {
      if (event?.type === 'keydown' && open.value) (menuItems()[0] ?? menu.value)?.focus();
    };

    const handleBeforeHide = (event?: Event) => {
      if (event?.type !== 'keydown' || (event as KeyboardEvent).key !== 'Escape') return;
      const reference = tooltip.value?.popperRef.triggerRef;
      if (reference instanceof HTMLElement) reference.focus();
    };

    const handleMenuKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const key = event.code || event.key;
      if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
      const items = menuItems();
      if (!items.length) return;
      event.preventDefault();
      const active = menu.value?.ownerDocument.activeElement;
      const current = items.findIndex((item) => item === active);
      const last = items.length - 1;
      let index = key === 'ArrowDown' ? current + 1 : current - 1;
      if (key === 'Home' || (key === 'ArrowDown' && index > last && props.loop)) index = 0;
      if (key === 'End' || (key === 'ArrowUp' && (current < 0 || (index < 0 && props.loop)))) index = last;
      items[index]?.focus();
    };

    const renderMenu = () => (
      <div
        ref={menu}
        class={ns.e('scroll')}
        tabindex={-1}
        style={{ maxHeight: typeof props.maxHeight === 'number' || /^\d+(\.\d+)?$/.test(props.maxHeight)
          ? `${props.maxHeight}px` : props.maxHeight }}
        onKeydown={handleMenuKeydown}>
        {slots.dropdown?.() ?? (
          <IDropdownMenu>
            {props.items.map((item, index) => (
              <IDropdownItem key={index} command={item.command} disabled={item.disabled} divided={item.divided} icon={item.icon}>
                {item.label}
              </IDropdownItem>
            ))}
          </IDropdownMenu>
        )}
      </div>
    );

    return () => {
      const triggerAttrs = {
        class: ns.e('trigger'),
        ...(props.id ? { id: props.id } : {}),
        role: 'button',
        tabindex: props.disabled ? -1 : props.tabindex,
        'aria-haspopup': 'menu',
        'aria-expanded': open.value,
        'aria-disabled': props.disabled || undefined
      } as const;
      const renderTrigger = () => {
        const children = slots.default?.();
        const child = children?.[0];
        return children?.length === 1 && child && typeof child.type !== 'symbol'
          ? cloneVNode(child, triggerAttrs)
          : <span {...triggerAttrs}>{children ?? '更多'}</span>;
      };
      const isVirtual = props.virtualTriggering || props.splitButton;
      const buttonType = props.type || undefined;
      const virtualRef = isVirtual ? props.virtualRef ?? splitReference.value : undefined;

      return (
        <span class={[ns.b(), ns.m(props.size), {
          'is-split-button': props.splitButton, 'is-disabled': props.disabled
        }]}>
          <Tooltip
            ref={tooltip}
            contentRole='presentation'
            effect={props.effect}
            fallbackPlacements={['bottom', 'top']}
            gpuAcceleration={false}
            placement={props.placement}
            popperOptions={props.popperOptions}
            popperClass={[ns.e('popper'), ns.em('popper', props.effect), props.popperClass].flat()}
            popperStyle={props.popperStyle}
            trigger={props.trigger}
            triggerKeys={props.triggerKeys}
            showArrow={props.showArrow}
            hoverOnFocus={false}
            showAfter={props.trigger === 'hover' ? props.showTimeout : 0}
            hideAfter={props.trigger === 'hover' ? props.hideTimeout : 0}
            virtualRef={virtualRef}
            virtualTriggering={isVirtual}
            closeOnOutside
            disabled={props.disabled}
            transition={ns.namespace.value === defaultNamespace ? 'el-zoom-in-top' : `${ns.namespace.value}-zoom-in-top`}
            teleported={props.teleported}
            appendTo={props.appendTo}
            persistent={props.persistent}
            onShow={handleShow}
            {...{
              'onBefore-hide': handleBeforeHide,
              'onVisible-change': (visible: boolean) => {
                open.value = visible;
                emit('visible-change', visible);
              }
            }}>
            {{ default: renderTrigger, content: renderMenu }}
          </Tooltip>
          {props.splitButton && (
            <ButtonGroup>
              <Button
                {...props.buttonProps}
                {...{ tabindex: props.tabindex }}
                type={buttonType}
                size={props.size || undefined}
                disabled={props.disabled || props.buttonProps?.disabled === true}
                class={ns.e('button')}
                onClick={(event: MouseEvent) => emit('click', event)}>
                {slots.default?.() ?? '更多'}
              </Button>
              <Button
                {...props.buttonProps}
                {...triggerAttrs}
                ref={(button) => {
                  const element = button && '$el' in button ? button.$el : undefined;
                  splitReference.value = element instanceof HTMLElement ? element : undefined;
                }}
                type={buttonType}
                size={props.size || undefined}
                disabled={props.disabled || props.buttonProps?.disabled === true}
                aria-label='展开下拉菜单'
                onClick={() => {
                  // 保留 hover 模式中点击分裂箭头的旧用法。
                  if (props.virtualRef || !props.trigger.includes('hover') || props.trigger.includes('click')) return;
                  if (open.value) tooltip.value?.hide();
                  else tooltip.value?.show();
                }}>
                <span aria-hidden='true'>▾</span>
              </Button>
            </ButtonGroup>
          )}
        </span>
      );
    };
  }
});
