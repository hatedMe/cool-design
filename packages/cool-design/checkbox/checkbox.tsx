import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, inject, nextTick, type PropType } from 'vue';
import { formKey, useField } from '../form/context';
import { useConfig } from '../config-provider/context';
import { checkboxGroupKey, checkboxValueEqual, type CheckboxValue } from './group';
export default defineComponent({
  name: 'i-checkbox',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    value: { type: [String, Number, Boolean, Object] as PropType<CheckboxValue>, default: undefined },
    label: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    trueLabel: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    falseLabel: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    trueValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    falseValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: undefined },
    checked: Boolean,
    disabled: Boolean,
    indeterminate: Boolean,
    border: Boolean,
    size: { type: String as PropType<'small' | 'default' | 'large'>, default: undefined },
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const ns = useNamespace('checkbox');
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
      const groupChecked = group?.modelValue.some((item) => checkboxValueEqual(item, optionValue as CheckboxValue));
      const disabled =
        props.disabled ||
        (field?.disabled?.() ?? form?.disabled?.()) ||
        group?.disabled ||
        (group && (groupChecked
          ? group.min !== undefined && group.modelValue.length <= group.min
          : group.max !== undefined && group.modelValue.length >= group.max));
      const size = props.size ?? group?.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size;
      const checked = group
        ? groupChecked
        : isModelChecked || (props.modelValue === undefined && props.checked);
      return (
        <label class={[ns.b(), props.border && 'is-bordered', disabled && 'is-disabled', size !== 'default' && size ? `is-${size}` : undefined]}>
          <input
            {...attrs}
            id={(attrs.id as string) || field?.id}
            type='checkbox'
            class={size !== 'default' && size ? `is-${size}` : undefined}
            checked={checked}
            indeterminate={props.indeterminate}
            disabled={disabled}
            onChange={(event: Event) => {
              if (disabled) return;
              const isChecked = (event.target as HTMLInputElement).checked;
              if (group) {
                group.update(optionValue as CheckboxValue, isChecked);
                return;
              }
              const value = isChecked ? trueValue : falseValue;
              emit('update:modelValue', value);
              emit('change', value);
              if (props.validateEvent) nextTick(() => field?.validate('change'));
            }}
          />
          {slots.default?.() ?? (props.label === undefined ? undefined : String(props.label))}
        </label>
      );
    };
  }
});
