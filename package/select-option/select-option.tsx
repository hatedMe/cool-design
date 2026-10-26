import { defineComponent, type PropType } from "vue";
export default defineComponent({
    name: "i-select-option",
    props: {
        value: { type: [String, Number] as PropType<string | number>, required: true },
        label: String,
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
