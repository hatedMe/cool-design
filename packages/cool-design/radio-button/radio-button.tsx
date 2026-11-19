import { defineComponent, getCurrentInstance, inject, onBeforeUnmount, ref, type PropType } from 'vue';
import { radioGroupKey } from '../radio/group';
import type { RadioValue } from '../radio/radio';
import { createNamespace } from '../../../src/utils/create';

const [name, bem] = createNamespace('radio-button');

export default defineComponent({
  name,
  props: {
    modelValue: [String, Number, Boolean] as PropType<RadioValue>,
    value: { type: [String, Number, Boolean] as PropType<RadioValue>, default: undefined },
    label: { type: [String, Number, Boolean] as PropType<RadioValue>, default: undefined },
    disabled: Boolean,
    name: String,
    size: String
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    const group = inject(radioGroupKey, undefined);
    const input = ref<HTMLInputElement>();
    const uid = getCurrentInstance()?.uid ?? 0;
    if (group) {
      group.register({
        uid,
        get value() {
          return props.value !== undefined ? props.value : props.label;
        },
        get disabled() {
          return props.disabled;
        },
        focus: () => input.value?.focus()
      });
    }
    onBeforeUnmount(() => group?.unregister(uid));
    return () => {
      const value = props.value !== undefined ? props.value : props.label;
      const checked = (group?.modelValue ?? props.modelValue) === value;
      const disabled = props.disabled || group?.disabled || false;
      return (
        <label class={[bem({ 'is-checked': checked, 'is-disabled': disabled }), props.size || group?.size ? `i-radio-button--${props.size || group?.size}` : undefined]}>
          <input
            ref={input}
            type='radio'
            value={String(value ?? '')}
            name={props.name || group?.name}
            checked={checked}
            disabled={disabled}
            tabindex={group ? group.tabstopFor(uid) : undefined}
            onChange={() => {
              if (disabled || value === undefined) return;
              if (group) {
                group.update(value);
                return;
              }
              emit('update:modelValue', value);
              emit('change', value);
            }}
          />
          {slots.default?.()}
        </label>
      );
    };
  }
});
