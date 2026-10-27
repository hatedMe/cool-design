import { computed, defineComponent, type PropType } from "vue";
import { useConfig, type Size } from "../config-provider/context";
import { emitValue, timeInputValue, type DateValue } from "./date";

export default defineComponent({
    name: "i-time-picker",
    inheritAttrs: false,
    props: {
        modelValue: { type: [String, Number, Date, Array] as PropType<DateValue | DateValue[] | null>, default: null },
        format: { type: String, default: "HH:mm:ss" },
        valueFormat: String,
        placeholder: String,
        startPlaceholder: String,
        endPlaceholder: String,
        disabled: Boolean,
        readonly: Boolean,
        clearable: Boolean,
        editable: { type: Boolean, default: true },
        isRange: Boolean,
        size: String as PropType<Size>
    },
    emits: ["update:modelValue", "change", "blur", "focus", "clear"],
    setup(props, { attrs, emit }) {
        const config = useConfig();
        const range = computed(() => props.isRange || Array.isArray(props.modelValue));
        const update = (index: number | undefined, value: string) => {
            const next = emitValue(`1970-01-01T${value}`, props.valueFormat || "HH:mm:ss", true);
            if (index == null) { emit("update:modelValue", next); emit("change", next); return; }
            const values = Array.isArray(props.modelValue) ? [...props.modelValue] : [null, null];
            values[index] = next;
            emit("update:modelValue", values); emit("change", values);
        };
        const renderInput = (value: DateValue | null | undefined, index?: number) => <input {...attrs} class="i-time-picker__input" type="time" step="1" value={timeInputValue(value)} placeholder={index === 0 ? props.startPlaceholder || props.placeholder : props.endPlaceholder || props.placeholder} disabled={props.disabled} readonly={props.readonly || !props.editable} onInput={(e: Event) => update(index, (e.target as HTMLInputElement).value)} onChange={(e: Event) => update(index, (e.target as HTMLInputElement).value)} onFocus={(e: FocusEvent) => emit("focus", e)} onBlur={(e: FocusEvent) => emit("blur", e)} />;
        return () => {
            const value = props.modelValue;
            return <span class={["i-time-picker", `i-control--${props.size || config.value.size}`, range.value && "is-range"]}>
                {range.value ? <><div>{renderInput(Array.isArray(value) ? value[0] : null, 0)}</div><span class="i-time-picker__separator">至</span><div>{renderInput(Array.isArray(value) ? value[1] : null, 1)}</div></> : renderInput(value as DateValue | null)}
                {props.clearable && (range.value ? Array.isArray(value) && value.some(Boolean) : value) && <button type="button" class="i-time-picker__clear" disabled={props.disabled || props.readonly} aria-label="清空" onClick={() => { emit("update:modelValue", range.value ? [] : null); emit("change", range.value ? [] : null); emit("clear"); }}>×</button>}
            </span>;
        };
    }
});
