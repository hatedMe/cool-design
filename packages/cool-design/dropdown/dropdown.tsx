import { Teleport, computed, defineComponent, onBeforeUnmount, provide, ref, type PropType } from 'vue';
import { dropdownKey, type DropdownCommand, type DropdownTrigger } from './context';
import IDropdownMenu from './dropdown-menu';
import IDropdownItem from './dropdown-item';
import { useFloating, type Placement } from '../../../src/utils/use-floating';

export interface DropdownItem {
  command: DropdownCommand;
  label: string;
  disabled?: boolean;
  divided?: boolean;
  icon?: string;
}

export type DropdownSize = '' | 'large' | 'default' | 'small';
export type DropdownPlacement = string;

export default defineComponent({
  name: 'i-dropdown',
  props: {
    items: { type: Array as PropType<DropdownItem[]>, default: () => [] },
    trigger: {
      type: [String, Array] as PropType<DropdownTrigger | DropdownTrigger[]>,
      default: 'hover'
    },
    hideOnClick: { type: Boolean, default: true },
    placement: { type: String as PropType<DropdownPlacement>, default: 'bottom' },
    disabled: Boolean,
    splitButton: Boolean,
    size: { type: String as PropType<DropdownSize>, default: '' },
    showTimeout: { type: Number, default: 150 },
    hideTimeout: { type: Number, default: 150 },
    maxHeight: { type: [String, Number], default: 172 },
    teleported: { type: Boolean, default: true },
    popperClass: String
  },
  emits: ['click', 'command', 'visible-change'],
  setup(props, { slots, emit, expose }) {
    const open = ref(false);
    const rootRef = ref<HTMLElement | null>(null);
    const reference = ref<HTMLElement>();
    const floating = ref<HTMLElement>();
    let hoverTimer: ReturnType<typeof setTimeout> | undefined;

    const triggers = computed<DropdownTrigger[]>(() =>
      Array.isArray(props.trigger) ? props.trigger : [props.trigger]
    );
    const useHover = computed(() => triggers.value.includes('hover'));
    const useClick = computed(() => triggers.value.includes('click'));
    const useContextmenu = computed(() => triggers.value.includes('contextmenu'));

    const setVisible = (visible: boolean) => {
      if (props.disabled) return;
      if (open.value === visible) return;
      open.value = visible;
      emit('visible-change', visible);
    };

    const scheduleOpen = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      if (props.showTimeout > 0) hoverTimer = setTimeout(() => setVisible(true), props.showTimeout);
      else setVisible(true);
    };
    const scheduleClose = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      if (props.hideTimeout > 0) hoverTimer = setTimeout(() => setVisible(false), props.hideTimeout);
      else setVisible(false);
    };
    const clearTimer = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      hoverTimer = undefined;
    };

    const position = useFloating({
      open,
      reference,
      floating,
      placement: () => props.placement as Placement,
      close: () => setVisible(false)
    });

    const handleOpen = () => setVisible(true);
    const handleClose = () => setVisible(false);
    const toggle = () => setVisible(!open.value);

    onBeforeUnmount(clearTimer);

    const handleCommand = (command: DropdownCommand) => {
      emit('command', command);
      if (props.hideOnClick) setVisible(false);
    };

    const focusTrigger = () => {
      const trigger = rootRef.value?.querySelector<HTMLElement>('.i-dropdown__trigger');
      trigger?.focus();
    };

    const close = (reason?: string) => {
      setVisible(false);
      if (reason === 'escape') focusTrigger();
    };

    provide(dropdownKey, {
      get hideOnClick() {
        return props.hideOnClick;
      },
      get disabled() {
        return props.disabled;
      },
      handleCommand,
      close
    });

    expose({ handleOpen, handleClose });

    const handleSplitClick = (event: MouseEvent) => {
      if (props.disabled) return;
      emit('click', event);
    };

    const menuScope = () => floating.value ?? rootRef.value;

    const focusFirstItem = () => {
      requestAnimationFrame(() => {
        const first = menuScope()?.querySelector<HTMLElement>('.i-dropdown__menu button:not([disabled])');
        first?.focus();
      });
    };

    const handleTriggerKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!open.value) {
          setVisible(true);
          focusFirstItem();
        } else {
          setVisible(false);
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!open.value) setVisible(true);
        focusFirstItem();
      } else if (event.key === 'Escape') {
        if (open.value) setVisible(false);
      }
    };

    const handleMenuKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const buttons = Array.from(
        menuScope()?.querySelectorAll<HTMLElement>('.i-dropdown__menu button:not([disabled])') ?? []
      );
      if (buttons.length === 0) return;
      event.preventDefault();
      const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);
      let nextIndex: number;
      if (event.key === 'ArrowDown') {
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length;
      } else {
        nextIndex = currentIndex < 0 ? buttons.length - 1 : (currentIndex - 1 + buttons.length) % buttons.length;
      }
      buttons[nextIndex]?.focus();
    };

    const renderMenuContent = () => {
      if (slots.dropdown) return slots.dropdown?.();
      return (
        <IDropdownMenu>
          {{
            default: () =>
              props.items.map((item) => (
                <IDropdownItem
                  key={String(typeof item.command === 'object' ? JSON.stringify(item.command) : item.command)}
                  command={item.command}
                  disabled={item.disabled}
                  divided={item.divided}
                  icon={item.icon}>
                  {{ default: () => item.label }}
                </IDropdownItem>
              ))
          }}
        </IDropdownMenu>
      );
    };

    return () => {
      const menu = open.value && (
        <div
          ref={floating}
          class={[
            'i-dropdown__popper',
            `is-${props.placement}`,
            props.popperClass
          ]}
          data-placement={props.placement}
          style={[
            position.style.value,
            { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight, overflow: 'auto' }
          ]}
          onMouseenter={() => useHover.value && scheduleOpen()}
          onMouseleave={() => useHover.value && scheduleClose()}
          onKeydown={handleMenuKeydown}>
          {renderMenuContent()}
        </div>
      );
      const renderedMenu =
        menu && (props.teleported ? <Teleport to={position.target.value}>{menu}</Teleport> : menu);

      if (props.splitButton) {
        return (
          <div
            ref={rootRef}
            class={{
              'i-dropdown': true,
              'is-split-button': true,
              [`i-dropdown--${props.size}`]: !!props.size,
              'is-disabled': props.disabled
            }}
            onMouseenter={() => useHover.value && scheduleOpen()}
            onMouseleave={() => useHover.value && scheduleClose()}>
            <button
              type='button'
              class='i-dropdown__button'
              disabled={props.disabled}
              onClick={handleSplitClick}>
              {slots.default?.() ?? '更多'}
            </button>
            <button
              ref={reference}
              type='button'
              class='i-dropdown__trigger'
              disabled={props.disabled}
              aria-haspopup='menu'
              aria-expanded={open.value}
              onClick={toggle}
              onContextmenu={(event) => {
                if (useContextmenu.value) {
                  event.preventDefault();
                  toggle();
                }
              }}
              onKeydown={handleTriggerKeydown}>
              <span aria-hidden='true'>▾</span>
            </button>
            {renderedMenu}
          </div>
        );
      }

      return (
        <span
          ref={rootRef}
          class={{
            'i-dropdown': true,
            [`i-dropdown--${props.size}`]: !!props.size,
            'is-disabled': props.disabled
          }}
          onMouseenter={() => useHover.value && scheduleOpen()}
          onMouseleave={() => useHover.value && scheduleClose()}>
          <span
            ref={reference}
            class='i-dropdown__trigger'
            tabindex={props.disabled ? -1 : 0}
            role='button'
            aria-haspopup='menu'
            aria-expanded={open.value}
            aria-disabled={props.disabled || undefined}
            onClick={() => useClick.value && toggle()}
            onContextmenu={(event) => {
              if (useContextmenu.value) {
                event.preventDefault();
                toggle();
              }
            }}
            onKeydown={handleTriggerKeydown}>
            {slots.default?.() ?? '更多'}
          </span>
          {renderedMenu}
        </span>
      );
    };
  }
});
