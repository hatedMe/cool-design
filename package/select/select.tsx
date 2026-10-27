import { defineComponent, nextTick, ref, type PropType, type VNode } from "vue";
import { useField } from "../form/context";
import { useConfig, type Size } from "../config-provider/context";
export default defineComponent({
    name: "i-select",
    inheritAttrs: false,
    props: {
        modelValue: [String, Number, Array] as PropType<string | number | Array<string | number> | undefined>,
        clearable: Boolean,
        disabled: Boolean,
        placeholder: { type: String, default: "请选择" },
        size: String as PropType<Size>,
        multiple: Boolean,
        name: String,
        filterable: Boolean,
        noDataText: { type: String, default: "暂无数据" },
        noMatchText: { type: String, default: "无匹配数据" }
    },
    emits: ["update:modelValue", "change", "blur"],
    setup(props, { slots, attrs, emit, expose }) {
        const field = useField();
        const config = useConfig();
        const select = ref<HTMLSelectElement>();
        const query = ref("");
        expose({ focus: () => select.value?.focus() });
        const update = (value: string | number | Array<string | number> | undefined) => {
            emit("update:modelValue", value);
            emit("change", value);
            nextTick(() => field?.validate("change"));
        };
        return () => {
            const options = slots.default?.() ?? [];
            const filtered = props.filterable && query.value
                ? options.filter((option) => String((option as VNode).props?.label ?? (option as VNode).children ?? "").includes(query.value))
                : options;
            return (
            <span class={["i-select", `i-control--${props.size || config.value.size}`]}>
                {props.filterable && <input aria-label="筛选选项" value={query.value} onInput={(event: Event) => (query.value = (event.target as HTMLInputElement).value)} />}
                <select
                    {...attrs}
                    id={(attrs.id as string) || field?.id}
                    ref={select}
                    value={props.multiple ? props.modelValue ?? [] : props.modelValue ?? ""}
                    multiple={props.multiple}
                    name={props.name}
                    disabled={props.disabled || field?.disabled?.()}
                    aria-invalid={field?.invalid() || undefined}
                    aria-describedby={field?.invalid() ? field.errorId : undefined}
                    onChange={(event: Event) => {
                        if (props.disabled) return;
                        const selected = [...(event.target as HTMLSelectElement).selectedOptions] as (HTMLOptionElement & { _value?: string | number })[];
                        if (props.multiple) update(selected.map((option) => option._value ?? option.value));
                        else {
                            const option = selected[0];
                            update(!option || option.value === "" ? undefined : option._value ?? option.value);
                        }
                    }}
                    onBlur={(event: FocusEvent) => {
                        field?.validate("blur");
                        emit("blur", event);
                    }}>
                    <option value="" disabled={!props.clearable}>
                        {props.placeholder}
                    </option>
                    {filtered}
                </select>
                {props.filterable && query.value && !filtered.length && <span class="i-select__empty">{props.noMatchText}</span>}
                {props.clearable && props.modelValue !== undefined && (!props.multiple || (props.modelValue as Array<unknown>).length > 0) && (
                    <button
                        type="button"
                        aria-label="清空"
                        disabled={props.disabled || field?.disabled?.()}
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
        };
    }
});
