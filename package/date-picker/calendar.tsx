import { computed, defineComponent, ref, type PropType } from "vue";
import { monthLabel, sameDay, toDate, type DateValue } from "./date";
export default defineComponent({
    name: "i-calendar",
    props: { modelValue: { type: [String, Number, Date] as PropType<DateValue | null>, default: null }, range: Array as PropType<DateValue[]>, firstDayOfWeek: { type: Number, default: 0 }, disabledDate: Function as PropType<(date: Date) => boolean>, highlightCurrent: { type: Boolean, default: true } },
    emits: ["update:modelValue", "change", "panel-change"],
    setup(props, { emit, slots }) {
        const cursor = ref(toDate(props.modelValue) || new Date());
        const days = computed(() => { const first = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1); const offset = (first.getDay() - props.firstDayOfWeek + 7) % 7; const count = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 0).getDate(); return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) => { const d = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), i - offset + 1); return { date: d, current: d.getMonth() === cursor.value.getMonth() }; }); });
        const select = (date: Date) => { if (props.disabledDate?.(date)) return; emit("update:modelValue", date); emit("change", date); };
        const move = (amount: number) => { cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + amount, 1); emit("panel-change", cursor.value); };
        return () => <div class="i-calendar"><header class="i-calendar__header"><button type="button" aria-label="上个月" onClick={() => move(-1)}>‹</button><strong>{monthLabel(cursor.value)}</strong><button type="button" aria-label="下个月" onClick={() => move(1)}>›</button></header><div class="i-calendar__week">{["日", "一", "二", "三", "四", "五", "六"].map((day) => <span key={day}>{day}</span>)}</div><div class="i-calendar__grid">{days.value.map(({ date, current }) => { const selected = toDate(props.modelValue); const inRange = props.range?.length === 2 && toDate(props.range[0]) && toDate(props.range[1]) && date >= toDate(props.range[0])! && date <= toDate(props.range[1])!; return <button type="button" key={date.toISOString()} class={{ "is-other-month": !current, "is-selected": selected && sameDay(date, selected), "is-today": props.highlightCurrent && sameDay(date, new Date()), "is-in-range": inRange }} disabled={props.disabledDate?.(date)} onClick={() => select(date)}>{slots.date?.({ date }) ?? date.getDate()}</button>; })}</div></div>;
    }
});
