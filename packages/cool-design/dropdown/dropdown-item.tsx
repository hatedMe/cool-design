import { defineComponent, inject, type PropType } from 'vue';
import { dropdownKey, type DropdownCommand } from './context';

export default defineComponent({
  name: 'i-dropdown-item',
  props: {
    command: { type: [String, Number, Object] as PropType<DropdownCommand>, default: '' },
    disabled: Boolean,
    divided: Boolean,
    icon: { type: String, default: '' }
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    const parent = inject(dropdownKey, undefined);

    const handleClick = (event: MouseEvent) => {
      if (props.disabled || parent?.disabled) return;
      emit('click', event);
      parent?.handleCommand(props.command);
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        parent?.handleCommand(props.command);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        parent?.close('escape');
      }
    };

    return () => (
      <li
        class={{ 'i-dropdown__item': true, 'is-divided': props.divided, 'is-disabled': props.disabled }}
        role='none'>
        <button
          type='button'
          class='i-dropdown__item-button'
          role='menuitem'
          disabled={props.disabled}
          tabindex={props.disabled ? -1 : 0}
          aria-disabled={props.disabled || undefined}
          onClick={handleClick}
          onKeydown={handleKeydown}>
          {(slots.icon?.() || props.icon) && (
            <span class='i-dropdown__item-icon' aria-hidden='true'>
              {slots.icon?.() ?? props.icon}
            </span>
          )}
          <span class='i-dropdown__item-label'>{slots.default?.()}</span>
        </button>
      </li>
    );
  }
});
