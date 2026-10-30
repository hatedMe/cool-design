import { defineComponent, h, nextTick, provide, type InjectionKey, type PropType } from 'vue';
import Button from './button';
import Checkbox from './checkbox';
import { useField } from '../form/context';
export type CheckboxValue = string | number | boolean | Record<string, unknown>;
export type CheckboxOptionProps = {
  value?: string | ((option: Record<string, unknown>) => CheckboxValue);
  label?: string | ((option: Record<string, unknown>) => unknown);
  disabled?: string | ((option: Record<string, unknown>) => boolean);
};
export const checkboxValueEqual = (left: CheckboxValue, right: CheckboxValue): boolean => {
  if (Object.is(left, right)) return true;
  if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) return false;
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length && leftKeys.every((key) => checkboxValueEqual(left[key] as CheckboxValue, right[key] as CheckboxValue));
};
export interface CheckboxGroupContext {
  modelValue: CheckboxValue[];
  disabled: boolean;
  size?: 'small' | 'default' | 'large';
  min?: number;
  max?: number;
  update: (value: CheckboxValue, checked: boolean) => void;
}
export const checkboxGroupKey: InjectionKey<CheckboxGroupContext> = Symbol('checkbox-group');
export default defineComponent({
  name: 'i-checkbox-group',
  props: {
    modelValue: { type: Array as unknown as PropType<CheckboxValue[]>, default: () => [] },
    min: Number,
    max: Number,
    disabled: Boolean,
    size: { type: String as PropType<'small' | 'default' | 'large'>, default: undefined },
    validateEvent: { type: Boolean, default: true },
    tag: { type: String, default: 'div' },
    type: { type: String as PropType<'checkbox' | 'button'>, default: 'checkbox' },
    options: { type: Array as unknown as PropType<Array<Record<string, unknown>>>, default: undefined },
    props: { type: Object as PropType<CheckboxOptionProps>, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const field = useField();
    provide(checkboxGroupKey, {
      get modelValue() {
        return props.modelValue;
      },
      get disabled() {
        return props.disabled;
      },
      get size() {
        return props.size;
      },
      get min() {
        return props.min;
      },
      get max() {
        return props.max;
      },
      update(value, checked) {
        const next = props.modelValue.filter((item) => !checkboxValueEqual(item, value));
        if (checked) next.push(value);
        if (props.min !== undefined && next.length < props.min) return;
        if (props.max !== undefined && next.length > props.max) return;
        emit('update:modelValue', next);
        emit('change', next);
        if (props.validateEvent) nextTick(() => field?.validate('change'));
      }
    });
    return () => {
      const valueProp = props.props?.value ?? 'value';
      const labelProp = props.props?.label ?? 'label';
      const disabledProp = props.props?.disabled ?? 'disabled';
      const resolveOptionProp = (option: Record<string, unknown>, prop: string | ((option: Record<string, unknown>) => unknown) | undefined) =>
        typeof prop === 'function' ? prop(option) : option[prop ?? 'value'];
      const children = slots.default?.() ??
        props.options?.map((option) => {
          const Component = props.type === 'button' ? Button : Checkbox;
          const value = resolveOptionProp(option, valueProp) as CheckboxValue;
          return h(Component, {
            key: JSON.stringify(value),
            value,
            label: String(resolveOptionProp(option, labelProp) ?? ''),
            disabled: Boolean(resolveOptionProp(option, disabledProp)),
            size: props.size
          });
        });
      return h(
        props.tag,
        { ...attrs, class: ['i-checkbox-group', props.size && `is-${props.size}`], role: 'group' },
        children
      );
    };
  }
});
