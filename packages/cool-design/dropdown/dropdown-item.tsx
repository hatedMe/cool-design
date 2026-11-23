import { defineComponent, getCurrentInstance, inject, type Component, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import Icon from '../icon';
import { dropdownKey, type DropdownCommand } from './context';
import type { WithSlots } from './slots';

const dropdownItemProps = {
  command: { type: [String, Number, Object] as PropType<DropdownCommand>, default: '' },
  disabled: Boolean,
  divided: Boolean,
  icon: { type: [String, Object, Function] as PropType<string | Component>, default: '' }
};
const DropdownItem = defineComponent({
  name: 'i-dropdown-item',
  props: dropdownItemProps,
  emits: { click: (originalEvent: MouseEvent | KeyboardEvent) =>
    originalEvent.type === 'click' || originalEvent.type === 'keydown' },
  setup(props, { slots, emit }) {
    const ns = useNamespace('dropdown');
    const parent = inject(dropdownKey, undefined);
    const instance = getCurrentInstance()!.proxy as DropdownItemInstance;

    const activate = (event: MouseEvent | KeyboardEvent) => {
      if (props.disabled || parent?.disabled) return;
      emit('click', event);
      if (event.type === 'click' && event.defaultPrevented) return;
      parent?.handleCommand(props.command, instance, event);
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled || parent?.disabled || event.defaultPrevented || event.isComposing) return;
      const key = event.code && event.code !== 'Unidentified' ? event.code : event.key;
      if (key === 'Enter' || key === 'NumpadEnter' || key === 'Space' || key === ' ') {
        event.preventDefault();
        activate(event);
      }
    };

    return () => (
      <li
        class={{ [ns.e('item')]: true, 'is-divided': props.divided, 'is-disabled': props.disabled }}
        role='none'>
        <button
          type='button'
          class={ns.e('item-button')}
          role='menuitem'
          disabled={props.disabled}
          tabindex={props.disabled ? -1 : 0}
          aria-disabled={props.disabled || undefined}
          onClick={activate}
          onKeydown={handleKeydown}>
          {(slots.icon?.() || props.icon) && (
            <span class={ns.e('item-icon')} aria-hidden='true'>
              {slots.icon?.() ?? (props.icon ? <Icon icon={props.icon} /> : null)}
            </span>
          )}
          <span class={ns.e('item-label')}>{slots.default?.()}</span>
        </button>
      </li>
    );
  }
});

const Item = DropdownItem as WithSlots<typeof DropdownItem, 'default' | 'icon'>;
export type DropdownItemInstance = InstanceType<typeof Item>;
export default Item;
