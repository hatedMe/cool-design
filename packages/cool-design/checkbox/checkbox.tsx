import { defineComponent, inject, nextTick, type PropType } from 'vue';
import { useField } from '../form/context';
import { checkboxGroupKey, checkboxValueEqual, type CheckboxValue } from './group';
export default defineComponent({
  name: 'i-checkbox',
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Boolean] as PropType<string | number | boolean>,
    value: [String, Number, Boolean, Object] as PropType<CheckboxValue>,
    label: String,
    trueValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: true },
    falseValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: false },
    checked: Boolean,
    disabled: Boolean,
    indeterminate: Boolean,
    border: Boolean,
    size: { type: String as PropType<'small' | 'default' | 'large'>, default: undefined },
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const field = useField();
    const group = inject(checkboxGroupKey, undefined);
    return () => {
      const disabled =
        props.disabled ||
        field?.disabled?.() ||
        group?.disabled ||
        (group?.max !== undefined &&
          !group.modelValue.some((item) => checkboxValueEqual(item, props.value as CheckboxValue)) &&
          group.modelValue.length >= group.max);
      const checked = group
        ? group.modelValue.some((item) => checkboxValueEqual(item, props.value as CheckboxValue))
        : props.modelValue === (props.trueValue ?? true) || (props.modelValue === undefined && props.checked);
      return (
        <label class={['i-checkbox', props.border && 'is-bordered', disabled && 'is-disabled', props.size || group?.size ? `is-${props.size || group?.size}` : undefined]}>
          <input
            {...attrs}
            id={(attrs.id as string) || field?.id}
            type='checkbox'
            class={props.size && `is-${props.size}`}
            checked={checked}
            indeterminate={props.indeterminate}
            disabled={disabled}
            onChange={(event: Event) => {
              if (disabled === true) return;
              const isChecked = (event.target as HTMLInputElement).checked;
              if (group) {
                group.update(props.value as CheckboxValue, isChecked);
                return;
              }
              const value = isChecked ? (props.trueValue ?? true) : (props.falseValue ?? false);
              emit('update:modelValue', value);
              emit('change', value);
              if (props.validateEvent) nextTick(() => field?.validate('change'));
            }}
          />
          {slots.default?.() ?? props.label}
        </label>
      );
    };
  }
});
