import { defineComponent, provide, type InjectionKey, type PropType } from 'vue';
import type { RadioValue } from './radio';

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
    size: String
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    provide(radioGroupKey, {
      get modelValue() {
        return props.modelValue;
      },
      get name() {
        return props.name;
      },
      get disabled() {
        return props.disabled;
      },
      get size() {
        return props.size;
      },
      update: (value) => {
        emit('update:modelValue', value);
        emit('change', value);
      }
    });
    return () => (
      <div class='i-radio-group' role='radiogroup'>
        {slots.default?.()}
      </div>
    );
  }
});
