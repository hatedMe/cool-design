import { defineComponent, provide, type InjectionKey, type PropType } from "vue";
export type CheckboxValue = string | number | boolean;
export interface CheckboxGroupContext {
  modelValue: CheckboxValue[];
  disabled: boolean;
  min?: number;
  max?: number;
  update: (value: CheckboxValue, checked: boolean) => void;
}
export const checkboxGroupKey: InjectionKey<CheckboxGroupContext> = Symbol("checkbox-group");
export default defineComponent({
  name: "i-checkbox-group",
  props: {
    modelValue: { type: Array as unknown as PropType<CheckboxValue[]>, default: () => [] },
    min: Number,
    max: Number,
    disabled: Boolean
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, slots }) {
    provide(checkboxGroupKey, {
      get modelValue() {
        return props.modelValue;
      },
      get disabled() {
        return props.disabled;
      },
      min: props.min,
      max: props.max,
      update(value, checked) {
        const next = props.modelValue.filter((item) => item !== value);
        if (checked) next.push(value);
        if (props.min !== undefined && next.length < props.min) return;
        if (props.max !== undefined && next.length > props.max) return;
        emit("update:modelValue", next);
        emit("change", next);
      }
    });
    return () => (
      <div class="i-checkbox-group" role="group">
        {slots.default?.()}
      </div>
    );
  }
});
