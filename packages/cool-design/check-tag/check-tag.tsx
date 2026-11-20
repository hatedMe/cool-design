import { defineComponent, type PropType } from 'vue';
import type { TagType } from '../tag/tag';

export default defineComponent({
  name: 'i-check-tag',
  props: {
    checked: Boolean,
    disabled: Boolean,
    type: { type: String as PropType<TagType>, default: 'primary' }
  },
  emits: {
    change: (checked: boolean) => typeof checked === 'boolean',
    'update:checked': (checked: boolean) => typeof checked === 'boolean'
  },
  setup(props, { slots, emit }) {
    return () => (
      <button type='button' class={['i-check-tag', `i-check-tag--${props.type}`]}
        disabled={props.disabled} aria-pressed={props.checked}
        onClick={() => {
          if (props.disabled) return;
          emit('change', !props.checked);
          emit('update:checked', !props.checked);
        }}>
        {slots.default?.()}
      </button>
    );
  }
});
