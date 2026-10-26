import { defineComponent, nextTick } from "vue";
import { useField } from "../form/context";
export default defineComponent({
    name: "i-checkbox",
    inheritAttrs: false,
    props: { modelValue: Boolean, disabled: Boolean, indeterminate: Boolean },
    emits: ["update:modelValue", "change"],
    setup(props, { attrs, emit, slots }) {
        const field = useField();
        return () => (
            <label class="i-checkbox">
                <input
                    {...attrs}
                    id={(attrs.id as string) || field?.id}
                    type="checkbox"
                    checked={props.modelValue}
                    indeterminate={props.indeterminate}
                    disabled={props.disabled}
                    onChange={(event: Event) => {
                        if (props.disabled) return;
                        const value = (event.target as HTMLInputElement).checked;
                        emit("update:modelValue", value);
                        emit("change", value);
                        nextTick(() => field?.validate("change"));
                    }}
                />
                {slots.default?.()}
            </label>
        );
    }
});
