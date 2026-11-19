import { defineComponent, type PropType } from 'vue';
export default defineComponent({
  name: 'i-select-option',
  props: {
    value: { type: [String, Number, Boolean, Object] as PropType<string | number | boolean | object>, required: true },
    label: [String, Number],
    disabled: Boolean
  },
  setup:
    (props, { slots }) =>
    () => (
      <option value={props.value} disabled={props.disabled}>
        {slots.default?.() ?? props.label ?? props.value}
      </option>
    )
});
