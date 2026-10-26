import { defineComponent, nextTick, ref, type PropType } from "vue";
import { useField } from "../form/context";
import { useConfig, type Size } from "../config-provider/context";
export default defineComponent({
    name: "i-input",
    inheritAttrs: false,
    props: {
        modelValue: { type: String, default: "" },
        clearable: Boolean,
        disabled: Boolean,
        readonly: Boolean,
        placeholder: String,
        size: String as PropType<Size>
    },
    emits: ["update:modelValue", "change", "blur"],
    setup(props, { attrs, emit, expose }) {
        const field = useField();
        const config = useConfig();
        const input = ref<HTMLInputElement>();
        expose({ focus: () => input.value?.focus() });
        const update = (value: string) => {
            emit("update:modelValue", value);
            nextTick(() => field?.validate("change"));
        };
        return () => (
            <span class={["i-input", `i-control--${props.size || config.value.size}`]}>
                <input
                    {...attrs}
                    id={(attrs.id as string) || field?.id}
                    ref={input}
                    value={props.modelValue}
                    disabled={props.disabled}
                    readonly={props.readonly}
                    placeholder={props.placeholder}
                    aria-invalid={field?.invalid() || undefined}
                    aria-describedby={field?.invalid() ? field.errorId : undefined}
                    onInput={(e: Event) => {
                        if (!props.disabled && !props.readonly) update((e.target as HTMLInputElement).value);
                    }}
                    onChange={(e: Event) => {
                        if (!props.disabled && !props.readonly) emit("change", (e.target as HTMLInputElement).value);
                    }}
                    onBlur={(e: FocusEvent) => {
                        field?.validate("blur");
                        emit("blur", e);
                    }}
                />
                {props.clearable && props.modelValue && (
                    <button
                        type="button"
                        aria-label="清空"
                        disabled={props.disabled || props.readonly}
                        onClick={() => {
                            if (props.disabled || props.readonly) return;
                            update("");
                            emit("change", "");
                            input.value?.focus();
                        }}>
                        ×
                    </button>
                )}
            </span>
        );
    }
});
