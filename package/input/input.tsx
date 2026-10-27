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
        size: String as PropType<Size>,
        type: { type: String as PropType<"text" | "password" | "textarea" | "search">, default: "text" },
        rows: { type: Number, default: 2 },
        maxlength: [String, Number],
        minlength: [String, Number],
        showWordLimit: Boolean,
        showPassword: Boolean,
        prefixIcon: String,
        suffixIcon: String
    },
    emits: ["update:modelValue", "change", "blur", "focus", "input", "clear"],
    setup(props, { attrs, emit, expose, slots }) {
        const field = useField();
        const config = useConfig();
        const input = ref<HTMLInputElement | HTMLTextAreaElement>();
        const passwordVisible = ref(false);
        const composing = ref(false);
        expose({
            focus: () => input.value?.focus(),
            blur: () => input.value?.blur(),
            clear: () => update("")
        });
        const update = (value: string) => {
            emit("update:modelValue", value);
            emit("input", value);
            nextTick(() => field?.validate("change"));
        };
        return () => {
            const isTextarea = props.type === "textarea";
            const inputType = props.type === "password" && !passwordVisible.value ? "password" : props.type === "search" ? "search" : "text";
            const control = isTextarea ? (
                <textarea
                    {...attrs}
                    id={(attrs.id as string) || field?.id}
                    ref={input}
                    value={props.modelValue}
                    rows={props.rows}
                    maxlength={props.maxlength}
                    minlength={props.minlength}
                    disabled={props.disabled || field?.disabled?.()}
                    readonly={props.readonly}
                    placeholder={props.placeholder}
                    aria-invalid={field?.invalid() || undefined}
                    aria-describedby={field?.invalid() ? field.errorId : undefined}
                    onCompositionstart={() => (composing.value = true)}
                    onCompositionend={(e: Event) => {
                        composing.value = false;
                        if (!props.disabled && !props.readonly) update((e.target as HTMLTextAreaElement).value);
                    }}
                    onInput={(e: Event) => {
                        if (!composing.value && !props.disabled && !props.readonly) update((e.target as HTMLTextAreaElement).value);
                    }}
                    onChange={(e: Event) => {
                        if (!props.disabled && !props.readonly) emit("change", (e.target as HTMLInputElement).value);
                    }}
                    onBlur={(e: FocusEvent) => {
                        field?.validate("blur");
                        emit("blur", e);
                    }}
                />
            ) : (
                <input
                    {...attrs}
                    id={(attrs.id as string) || field?.id}
                    ref={input}
                    type={inputType}
                    value={props.modelValue}
                    maxlength={props.maxlength}
                    minlength={props.minlength}
                    disabled={props.disabled || field?.disabled?.()}
                    readonly={props.readonly}
                    placeholder={props.placeholder}
                    aria-invalid={field?.invalid() || undefined}
                    aria-describedby={field?.invalid() ? field.errorId : undefined}
                    onCompositionstart={() => (composing.value = true)}
                    onCompositionend={(e: Event) => {
                        composing.value = false;
                        if (!props.disabled && !props.readonly) update((e.target as HTMLInputElement).value);
                    }}
                    onInput={(e: Event) => {
                        if (!composing.value && !props.disabled && !props.readonly) update((e.target as HTMLInputElement).value);
                    }}
                    onChange={(e: Event) => {
                        if (!props.disabled && !props.readonly) emit("change", (e.target as HTMLInputElement).value);
                    }}
                    onFocus={(e: FocusEvent) => emit("focus", e)}
                    onBlur={(e: FocusEvent) => {
                        field?.validate("blur");
                        emit("blur", e);
                    }}
                />
            );
            return (
            <span class={["i-input", `i-control--${props.size || config.value.size}`, isTextarea && "is-textarea"]}>
                {slots.prefix?.() ?? (props.prefixIcon && <i class={["i-input__icon", props.prefixIcon]} aria-hidden="true" />)}
                {control}
                {props.showWordLimit && <span class="i-input__count">{props.modelValue.length}/{props.maxlength ?? "∞"}</span>}
                {props.showPassword && props.type === "password" && (
                    <button type="button" aria-label={passwordVisible.value ? "隐藏密码" : "显示密码"} onClick={() => (passwordVisible.value = !passwordVisible.value)}>
                        {passwordVisible.value ? "隐藏" : "显示"}
                    </button>
                )}
                {slots.suffix?.() ?? (props.suffixIcon && <i class={["i-input__icon", props.suffixIcon]} aria-hidden="true" />)}
                {props.clearable && props.modelValue && (
                    <button
                        type="button"
                        aria-label="清空"
                        disabled={props.disabled || props.readonly}
                        onClick={() => {
                            if (props.disabled || props.readonly) return;
                            update("");
                            emit("change", "");
                            emit("clear");
                            input.value?.focus();
                        }}>
                        ×
                    </button>
                )}
            </span>
            );
        };
    }
});
