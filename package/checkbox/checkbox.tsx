import { defineComponent, inject, nextTick, type PropType } from 'vue';
import { useField } from '../form/context';
import { checkboxGroupKey, type CheckboxValue } from './group';
export default defineComponent({
  name: 'i-checkbox',
  inheritAttrs: false,
  props: {
    modelValue: Boolean,
    value: [String, Number, Boolean] as PropType<CheckboxValue>,
    disabled: Boolean,
    indeterminate: Boolean,
    border: Boolean
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const field = useField();
    const group = inject(checkboxGroupKey, undefined);
    return () => (
      <label
        class={['i-checkbox', props.border && 'is-bordered', (props.disabled || group?.disabled) && 'is-disabled']}>
        <input
          {...attrs}
          id={(attrs.id as string) || field?.id}
          type='checkbox'
          checked={group ? group.modelValue.includes(props.value as CheckboxValue) : props.modelValue}
          indeterminate={props.indeterminate}
          disabled={
            props.disabled ||
            field?.disabled?.() ||
            group?.disabled ||
            (group?.max !== undefined &&
              !group.modelValue.includes(props.value as CheckboxValue) &&
              group.modelValue.length >= group.max)
          }
          onChange={(event: Event) => {
            if (props.disabled || group?.disabled) return;
            const value = (event.target as HTMLInputElement).checked;
            if (group) {
              group.update(props.value as CheckboxValue, value);
              return;
            }
            emit('update:modelValue', value);
            emit('change', value);
            nextTick(() => field?.validate('change'));
          }}
        />
        {slots.default?.()}
      </label>
    );
  }
});
