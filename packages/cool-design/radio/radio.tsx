import { defineComponent, nextTick, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import { useField, formKey } from '../form/context';
import { useConfig } from '../config-provider/context';
import { inject } from 'vue';
import { radioGroupKey } from './group';
const [name, bem] = createNamespace('radio');
export type RadioValue = string | number | boolean;

export default defineComponent({
  name,
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Boolean] as PropType<RadioValue>,
    value: { type: [String, Number, Boolean] as PropType<RadioValue>, default: undefined },
    label: { type: [String, Number, Boolean] as PropType<RadioValue>, default: undefined },
    disabled: Boolean,
    name: String,
    border: Boolean,
    size: String
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const field = useField();
    const config = useConfig();
    const form = inject(formKey, undefined);
    const group = inject(radioGroupKey, undefined);
    return () => {
      const value = props.value !== undefined ? props.value : props.label;
      const disabled = props.disabled || field?.disabled?.() || form?.disabled?.() || group?.disabled || false;
      const size = props.size ?? group?.size ?? field?.size?.() ?? config.value.size;
      return (
      <label class={[bem({ 'is-disabled': disabled, 'is-bordered': props.border }), size && size !== 'default' ? `i-radio--${size}` : undefined]}>
        <input
          {...attrs}
          id={(attrs.id as string) || field?.id}
          type='radio'
          value={String(value ?? '')}
          name={props.name || group?.name || (attrs.name as string | undefined)}
          checked={(group?.modelValue ?? props.modelValue) === value}
          disabled={disabled}
          aria-invalid={field?.invalid() || undefined}
          aria-describedby={field?.invalid() ? field.errorId : undefined}
          onChange={() => {
            if (disabled || value === undefined) return;
            if (group) {
              group.update(value);
              return;
            }
            emit('update:modelValue', value);
            emit('change', value);
            nextTick(() => field?.validate('change'));
          }}
        />
        <span class={bem('text')}>{slots.default?.()}</span>
      </label>
      );
    };
  }
});
