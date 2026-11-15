import { computed, defineComponent, onBeforeUnmount, provide, ref, type PropType } from 'vue';
import { dropdownKey, type DropdownCommand, type DropdownTrigger } from './context';
import IDropdownMenu from './dropdown-menu';
import IDropdownItem from './dropdown-item';

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
    size: { type: String as PropType<DropdownSize>, default: '' }
  },
  emits: ['click', 'command', 'visible-change'],
  setup(props, { slots, emit, expose }) {
    const open = ref(false);
    const rootRef = ref<HTMLElement | null>(null);

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
      if (visible) {
        document.addEventListener('click', handleDocumentClick);
      } else {
        document.removeEventListener('click', handleDocumentClick);
      }
    };

    const handleOpen = () => setVisible(true);
    const handleClose = () => setVisible(false);
    const toggle = () => setVisible(!open.value);

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (rootRef.value && target && rootRef.value.contains(target)) return;
      setVisible(false);
    };

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleDocumentClick);
    });

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

    const focusFirstItem = () => {
      requestAnimationFrame(() => {
        const first = rootRef.value?.querySelector<HTMLElement>(
          '.i-dropdown__menu button:not([disabled])'
        );
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
        rootRef.value?.querySelectorAll<HTMLElement>('.i-dropdown__menu button:not([disabled])') ?? []
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
          class={{ 'i-dropdown__popper': true, [`is-${props.placement}`]: !!props.placement }}
          data-placement={props.placement}
          onKeydown={handleMenuKeydown}>
          {renderMenuContent()}
        </div>
      );

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
            onMouseenter={() => useHover.value && setVisible(true)}
            onMouseleave={() => useHover.value && setVisible(false)}>
            <button
              type='button'
              class='i-dropdown__button'
              disabled={props.disabled}
              onClick={handleSplitClick}>
              {slots.default?.() ?? '更多'}
            </button>
            <button
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
            {menu}
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
          onMouseenter={() => useHover.value && setVisible(true)}
          onMouseleave={() => useHover.value && setVisible(false)}>
          <span
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
          {menu}
        </span>
      );
    };
  }
});
