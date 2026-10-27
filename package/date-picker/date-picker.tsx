import { computed, defineComponent, type PropType } from "vue";
import { useConfig, type Size } from "../config-provider/context";
import { dateInputValue, emitValue, formatDate, type DateValue } from "./date";

export type DatePickerType = "year" | "month" | "date" | "dates" | "week" | "datetime";
type Model = DateValue | DateValue[] | null;

export default defineComponent({
    name: "i-date-picker",
    inheritAttrs: false,
    props: {
        modelValue: { type: [String, Number, Date, Array] as PropType<Model>, default: null },
        type: { type: String as PropType<DatePickerType>, default: "date" },
        format: { type: String, default: "YYYY-MM-DD" },
        valueFormat: String,
        placeholder: String,
        startPlaceholder: String,
        endPlaceholder: String,
        disabled: Boolean,
        readonly: Boolean,
        clearable: Boolean,
        editable: { type: Boolean, default: true },
        range: Boolean,
        disabledDate: Function as PropType<(date: Date) => boolean>,
        size: String as PropType<Size>
    },
    emits: ["update:modelValue", "change", "blur", "focus", "clear"],
    setup(props, { attrs, emit }) {
        const config = useConfig();
        const isRange = computed(() => props.range || Array.isArray(props.modelValue));
        const inputType = computed(() => props.type === "month" ? "month" : props.type === "year" ? "number" : props.type === "datetime" ? "datetime-local" : "date");
        const inputValue = (value: DateValue | null | undefined) => dateInputValue(value, props.type === "datetime");
        const valid = (value: string) => !props.disabledDate || !value || !props.disabledDate(new Date(`${value}T00:00:00`));
        const updateSingle = (value: string) => {
            if (!valid(value)) return;
            const next = emitValue(value, props.valueFormat, props.type === "datetime");
            emit("update:modelValue", next);
            emit("change", next);
        };
        const updateRange = (index: number, value: string) => {
            if (!valid(value)) return;
            const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [null, null];
            current[index] = emitValue(value, props.valueFormat, props.type === "datetime");
            emit("update:modelValue", current);
            emit("change", current);
        };
        const renderInput = (value: DateValue | null | undefined, index?: number) => (
            <input
                {...attrs}
                class="i-date-picker__input"
                type={inputType.value}
                value={inputValue(value)}
                placeholder={index === 0 ? props.startPlaceholder || props.placeholder : props.endPlaceholder || props.placeholder}
                disabled={props.disabled}
                readonly={props.readonly || !props.editable}
                onInput={(event: Event) => index == null ? updateSingle((event.target as HTMLInputElement).value) : updateRange(index, (event.target as HTMLInputElement).value)}
                onChange={(event: Event) => index == null ? updateSingle((event.target as HTMLInputElement).value) : updateRange(index, (event.target as HTMLInputElement).value)}
                onFocus={(event: FocusEvent) => emit("focus", event)}
                onBlur={(event: FocusEvent) => emit("blur", event)}
            />
        );
        return () => {
            const value = props.modelValue;
            const content = isRange.value
                ? <><div>{renderInput(Array.isArray(value) ? value[0] : null, 0)}</div><span class="i-date-picker__separator">至</span><div>{renderInput(Array.isArray(value) ? value[1] : null, 1)}</div></>
                : renderInput(value as DateValue | null);
            return <span class={["i-date-picker", `i-control--${props.size || config.value.size}`, isRange.value && "is-range"]}>
                {content}
                {props.clearable && (isRange.value ? Array.isArray(value) && value.some(Boolean) : value) && <button type="button" class="i-date-picker__clear" disabled={props.disabled || props.readonly} aria-label="清空" onClick={() => { emit("update:modelValue", isRange.value ? [] : null); emit("change", isRange.value ? [] : null); emit("clear"); }}>×</button>}
                {!isRange.value && value && <span class="i-date-picker__formatted" aria-hidden="true">{formatDate(value as DateValue, props.format)}</span>}
            </span>;
        };
    }
});
