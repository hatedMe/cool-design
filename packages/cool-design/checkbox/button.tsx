import { defineComponent, inject, type PropType } from 'vue';
import { checkboxGroupKey, checkboxValueEqual, type CheckboxValue } from './group';

export default defineComponent({
  name: 'i-checkbox-button',
  props: {
    modelValue: [String, Number, Boolean] as PropType<string | number | boolean>,
    value: [String, Number, Boolean, Object] as PropType<CheckboxValue>,
    label: String,
    trueValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: true },
    falseValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: false },
    disabled: Boolean,
    size: { type: String as PropType<'small' | 'default' | 'large'>, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    const group = inject(checkboxGroupKey, undefined);
    return () => {
      const checked = group
        ? group.modelValue.some((item) => checkboxValueEqual(item, props.value as CheckboxValue))
        : props.modelValue === (props.trueValue ?? true);
      const disabled =
        props.disabled ||
        group?.disabled ||
        (group?.max !== undefined &&
          !group.modelValue.some((item) => checkboxValueEqual(item, props.value as CheckboxValue)) &&
          group.modelValue.length >= group.max);
      return (
        <button
          type='button'
          class={[
            'i-checkbox-button',
            checked && 'is-checked',
            disabled && 'is-disabled',
            props.size || group?.size ? `is-${props.size || group?.size}` : undefined
          ]}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            if (group) {
              group.update(props.value as CheckboxValue, !checked);
              return;
            }
            const value = checked ? (props.falseValue ?? false) : (props.trueValue ?? true);
            emit('update:modelValue', value);
            emit('change', value);
          }}
        >
          {slots.default?.() ?? props.label}
        </button>
      );
    };
  }
});
