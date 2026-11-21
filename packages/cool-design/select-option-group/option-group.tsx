import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-select-option-group',
  props: {
    label: String,
    disabled: Boolean
  },
  setup:
    (props, { slots }) =>
    () => (
      <optgroup label={props.label} disabled={props.disabled}>
        {slots.default?.()}
      </optgroup>
    )
});
