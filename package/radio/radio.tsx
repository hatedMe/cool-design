import { defineComponent, nextTick, type PropType } from "vue";
import { createNamespace } from "../../src/utils/create";
import { useField } from "../form/context";
const [name, bem] = createNamespace("radio");
type RadioValue = string | number | boolean;

export default defineComponent({
    name,
    inheritAttrs: false,
    props: {
        modelValue: [String, Number, Boolean] as PropType<RadioValue>,
        value: { type: [String, Number, Boolean] as PropType<RadioValue>, default: true },
        disabled: Boolean
    },
    emits: ["update:modelValue", "change"],
    setup(props, { attrs, emit, slots }) {
        const field = useField();
        return () => (
            <label class={bem({ "is-disabled": props.disabled })}>
                <input
                    {...attrs}
                    id={(attrs.id as string) || field?.id}
                    type="radio"
                    value={String(props.value)}
                    checked={props.modelValue === props.value}
                    disabled={props.disabled}
                    aria-invalid={field?.invalid() || undefined}
                    aria-describedby={field?.invalid() ? field.errorId : undefined}
                    onChange={() => {
                        if (props.disabled) return;
                        emit("update:modelValue", props.value);
                        emit("change", props.value);
                        nextTick(() => field?.validate("change"));
                    }}
                />
                <span class={bem("text")}>{slots.default?.()}</span>
            </label>
        );
    }
});
