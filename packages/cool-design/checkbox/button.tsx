import { defineComponent, inject, type PropType } from 'vue';
import { formKey, useField } from '../form/context';
import { useConfig } from '../config-provider/context';
import { checkboxGroupKey, checkboxValueEqual, type CheckboxValue } from './group';

export default defineComponent({
  name: 'i-checkbox-button',
  props: {
    modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    value: { type: [String, Number, Boolean, Object] as PropType<CheckboxValue>, default: undefined },
    label: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    trueLabel: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    falseLabel: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    trueValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    falseValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    disabled: Boolean,
    size: { type: String as PropType<'small' | 'default' | 'large'>, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    const field = useField();
    const form = inject(formKey, undefined);
    const config = useConfig();
    const group = inject(checkboxGroupKey, undefined);
    return () => {
      const optionValue = props.value ?? props.label;
      const trueValue = props.trueValue ?? props.trueLabel ?? true;
      const falseValue = props.falseValue ?? props.falseLabel ?? false;
      const isModelChecked = props.modelValue === trueValue ||
        (props.trueLabel !== undefined && props.modelValue !== falseValue && props.modelValue === props.trueLabel);
      const checked = group
        ? group.modelValue.some((item) => checkboxValueEqual(item, optionValue as CheckboxValue))
        : isModelChecked;
      const disabled =
        props.disabled ||
        (field?.disabled?.() ?? form?.disabled?.()) ||
        group?.disabled ||
        (group?.max !== undefined &&
          !group.modelValue.some((item) => checkboxValueEqual(item, optionValue as CheckboxValue)) &&
          group.modelValue.length >= group.max);
      const size = props.size ?? group?.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size;
      return (
        <button
          type='button'
          class={[
            'i-checkbox-button',
            checked && 'is-checked',
            disabled && 'is-disabled',
            size !== 'default' && size ? `is-${size}` : undefined
          ]}
          disabled={disabled}
          style={checked && !disabled && group ? { backgroundColor: group.fill, borderColor: group.fill, color: group.textColor } : undefined}
          onClick={() => {
            if (disabled) return;
            if (group) {
              group.update(optionValue as CheckboxValue, !checked);
              return;
            }
            const value = checked ? falseValue : trueValue;
            emit('update:modelValue', value);
            emit('change', value);
          }}
        >
          {slots.default?.() ?? (props.label === undefined ? undefined : String(props.label))}
        </button>
      );
    };
  }
});
