import { defineComponent, nextTick } from "vue";
import { useField } from "../form/context";
export default defineComponent({
    name: "i-switch",
    inheritAttrs: false,
    props: { modelValue: Boolean, disabled: Boolean },
    emits: ["update:modelValue", "change"],
    setup(props, { attrs, emit, slots }) {
        const field = useField();
        return () => (
            <label class="i-switch">
                <input
                    {...attrs}
                    id={(attrs.id as string) || field?.id}
                    type="checkbox"
                    role="switch"
                    aria-checked={props.modelValue}
                    checked={props.modelValue}
                    disabled={props.disabled}
                    onChange={(event: Event) => {
                        if (props.disabled) return;
                        const value = (event.target as HTMLInputElement).checked;
                        emit("update:modelValue", value);
                        emit("change", value);
                        nextTick(() => field?.validate("change"));
                    }}
                />
                <span class="i-switch__track" aria-hidden="true" />
                {slots.default?.()}
            </label>
        );
    }
});
