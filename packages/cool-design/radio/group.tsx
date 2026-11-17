import { defineComponent, nextTick, provide, type InjectionKey, type PropType } from 'vue';
import type { RadioValue } from './radio';
import { useField } from '../form/context';

export interface RadioGroupContext {
  modelValue: RadioValue | undefined;
  name?: string;
  disabled: boolean;
  size?: string;
  update: (value: RadioValue) => void;
}
export const radioGroupKey: InjectionKey<RadioGroupContext> = Symbol('radio-group');

export default defineComponent({
  name: 'i-radio-group',
  props: {
    modelValue: [String, Number, Boolean] as PropType<RadioValue>,
    name: String,
    disabled: Boolean,
    size: String,
    fill: String,
    textColor: String,
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    const field = useField();
    provide(radioGroupKey, {
      get modelValue() {
        return props.modelValue;
      },
      get name() {
        return props.name;
      },
      get disabled() {
        return props.disabled || !!field?.disabled?.();
      },
      get size() {
        return props.size ?? field?.size?.();
      },
      update: (value) => {
        emit('update:modelValue', value);
        emit('change', value);
        if (props.validateEvent) nextTick(() => field?.validate('change'));
      }
    });
    return () => (
      <div
        class='i-radio-group'
        role='radiogroup'
        style={{
          '--i-radio-button-checked-bg-color': props.fill,
          '--i-radio-button-checked-text-color': props.textColor
        }}>
        {slots.default?.()}
      </div>
    );
  }
});
