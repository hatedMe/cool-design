import { defineComponent, nextTick, ref, type PropType } from "vue";
import { useField } from "../form/context";
import { useConfig, type Size } from "../config-provider/context";
export default defineComponent({
    name: "i-select",
    inheritAttrs: false,
    props: {
        modelValue: [String, Number] as PropType<string | number>,
        clearable: Boolean,
        disabled: Boolean,
        placeholder: { type: String, default: "请选择" },
        size: String as PropType<Size>
    },
    emits: ["update:modelValue", "change", "blur"],
    setup(props, { slots, attrs, emit, expose }) {
        const field = useField();
        const config = useConfig();
        const select = ref<HTMLSelectElement>();
        expose({ focus: () => select.value?.focus() });
        const update = (value: string | number | undefined) => {
            emit("update:modelValue", value);
            emit("change", value);
            nextTick(() => field?.validate("change"));
        };
        return () => (
            <span class={["i-select", `i-control--${props.size || config.value.size}`]}>
                <select
                    {...attrs}
                    id={(attrs.id as string) || field?.id}
                    ref={select}
                    value={props.modelValue ?? ""}
                    disabled={props.disabled}
                    aria-invalid={field?.invalid() || undefined}
                    aria-describedby={field?.invalid() ? field.errorId : undefined}
                    onChange={(event: Event) => {
                        if (props.disabled) return;
                        const option = (event.target as HTMLSelectElement).selectedOptions[0] as HTMLOptionElement & {
                            _value?: string | number;
                        };
                        update(option.value === "" ? undefined : option._value ?? option.value);
                    }}
                    onBlur={(event: FocusEvent) => {
                        field?.validate("blur");
                        emit("blur", event);
                    }}>
                    <option value="" disabled={!props.clearable}>
                        {props.placeholder}
                    </option>
                    {slots.default?.()}
                </select>
                {props.clearable && props.modelValue !== undefined && (
                    <button
                        type="button"
                        aria-label="清空"
                        disabled={props.disabled}
                        onClick={() => {
                            if (!props.disabled) {
                                update(undefined);
                                select.value?.focus();
                            }
                        }}>
                        ×
                    </button>
                )}
            </span>
        );
    }
});
