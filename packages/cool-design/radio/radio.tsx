import { defineComponent, nextTick, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import { useField } from '../form/context';
import { inject } from 'vue';
import { radioGroupKey } from './group';
const [name, bem] = createNamespace('radio');
export type RadioValue = string | number | boolean;

export default defineComponent({
  name,
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Boolean] as PropType<RadioValue>,
    value: { type: [String, Number, Boolean] as PropType<RadioValue>, default: true },
    disabled: Boolean,
    name: String,
    border: Boolean,
    size: String
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const field = useField();
    const group = inject(radioGroupKey, undefined);
    return () => (
      <label class={bem({ 'is-disabled': props.disabled || group?.disabled || false, 'is-bordered': props.border })}>
        <input
          {...attrs}
          id={(attrs.id as string) || field?.id}
          type='radio'
          value={String(props.value)}
          name={props.name || group?.name || (attrs.name as string | undefined)}
          checked={(group?.modelValue ?? props.modelValue) === props.value}
          disabled={props.disabled || group?.disabled || false}
          aria-invalid={field?.invalid() || undefined}
          aria-describedby={field?.invalid() ? field.errorId : undefined}
          onChange={() => {
            if (props.disabled || group?.disabled) return;
            emit('update:modelValue', props.value);
            emit('change', props.value);
            group?.update(props.value);
            nextTick(() => field?.validate('change'));
          }}
        />
        <span class={bem('text')}>{slots.default?.()}</span>
      </label>
    );
  }
});
