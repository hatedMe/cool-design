import { computed, defineComponent, ref, watch, type PropType } from 'vue';
import { formatDate, monthLabel, pad, sameDay, toDate, type DateValue } from './date';

export type CalendarSelectDateType = 'prev-month' | 'next-month' | 'prev-year' | 'next-year' | 'today';
export type CalendarControllerType = 'button' | 'select';
export type CalendarCellType = 'prev-month' | 'current-month' | 'next-month';
export type CalendarFormatter = (type: 'year' | 'month', value: number) => string;
export interface CalendarCellData {
  day: string;
  date: Date;
  isSelected: boolean;
  type: CalendarCellType;
}
export interface CalendarHeaderSlotParams {
  date: string;
}
export interface CalendarDateCellSlotParams {
  data: CalendarCellData;
  date: Date;
}

const WEEK_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export default defineComponent({
  name: 'i-calendar',
  props: {
    modelValue: { type: [String, Number, Date] as PropType<DateValue | null>, default: null },
    range: Array as PropType<DateValue[]>,
    firstDayOfWeek: { type: Number, default: 0 },
    disabledDate: Function as PropType<(date: Date) => boolean>,
    highlightCurrent: { type: Boolean, default: true },
    controllerType: { type: String as PropType<CalendarControllerType>, default: 'button' },
    formatter: { type: Function as PropType<CalendarFormatter>, default: undefined }
  },
  emits: ['update:modelValue', 'input', 'select', 'change', 'panel-change'],
  setup(props, { emit, slots, expose }) {
    const firstDow = computed(() => {
      const value = Math.floor(props.firstDayOfWeek);
      return value >= 0 && value <= 6 ? value : 0;
    });
    const weekNames = computed(() => [
      ...WEEK_NAMES.slice(firstDow.value),
      ...WEEK_NAMES.slice(0, firstDow.value)
    ]);

    const initialSelected = toDate(props.modelValue);
    const selected = ref<Date | null>(initialSelected);
    const cursor = ref<Date>(startOfMonth(initialSelected || new Date()));

    const calculateValidatedDateRange = (
      start: DateValue | null | undefined,
      end: DateValue | null | undefined
    ): Date[] => {
      const startDate = toDate(start);
      const endDate = toDate(end);
      if (!startDate || !endDate) {
        if (props.range?.length) console.warn('[i-calendar] range 需要包含开始和结束日期');
        return [];
      }
      if (startDate.getTime() > endDate.getTime()) {
        console.warn('[i-calendar] range 开始日期不应晚于结束日期');
        return [];
      }
      const monthDiff =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      if (monthDiff < 0 || monthDiff > 1) {
        console.warn('[i-calendar] range 跨度不应超过两个月');
        return [];
      }
      if (startDate.getDay() !== 1 || endDate.getDay() !== 0) {
        console.warn('[i-calendar] range 应从周一开始到周日结束');
        return [];
      }
      return [startDate, endDate];
    };

    const validatedRange = computed<Date[]>(() => {
      if (props.range?.length !== 2) return [];
      return calculateValidatedDateRange(props.range[0], props.range[1]);
    });

    watch(
      () => props.modelValue,
      (value) => {
        const date = toDate(value);
        selected.value = date;
        if (date && validatedRange.value.length !== 2) {
          const next = startOfMonth(date);
          if (next.getTime() !== cursor.value.getTime()) cursor.value = next;
        }
      }
    );

    const isRangeMode = computed(() => validatedRange.value.length === 2);

    const cellTypeForMonth = (date: Date, year: number, month: number): CalendarCellType => {
      if (date.getFullYear() < year || (date.getFullYear() === year && date.getMonth() < month)) return 'prev-month';
      if (date.getFullYear() > year || (date.getFullYear() === year && date.getMonth() > month)) return 'next-month';
      return 'current-month';
    };

    const days = computed<{ date: Date; type: CalendarCellType }[]>(() => {
      if (isRangeMode.value) {
        const [start, end] = validatedRange.value;
        const result: { date: Date; type: CalendarCellType }[] = [];
        const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        while (current.getTime() <= end.getTime()) {
          const date = new Date(current);
          result.push({ date, type: cellTypeForMonth(date, start.getFullYear(), start.getMonth()) });
          current.setDate(current.getDate() + 1);
        }
        return result;
      }
      const year = cursor.value.getFullYear();
      const month = cursor.value.getMonth();
      const first = new Date(year, month, 1);
      const offset = (first.getDay() - firstDow.value + 7) % 7;
      const count = new Date(year, month + 1, 0).getDate();
      const total = Math.ceil((offset + count) / 7) * 7;
      return Array.from({ length: total }, (_, i) => {
        const date = new Date(year, month, i - offset + 1);
        return { date, type: cellTypeForMonth(date, year, month) };
      });
    });

    const headerDate = computed(() => {
      if (isRangeMode.value) {
        const [start, end] = validatedRange.value;
        return `${formatDate(start, 'YYYY-MM-DD')} ~ ${formatDate(end, 'YYYY-MM-DD')}`;
      }
      return `${cursor.value.getFullYear()}-${pad(cursor.value.getMonth() + 1)}`;
    });

    const headerLabel = computed(() => {
      if (isRangeMode.value) {
        const [start, end] = validatedRange.value;
        if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
          return monthLabel(start);
        }
        return `${monthLabel(start)} ~ ${monthLabel(end)}`;
      }
      return monthLabel(cursor.value);
    });

    const selectedDay = computed(() => selected.value);

    const emitSelect = (date: Date) => {
      emit('update:modelValue', date);
      emit('input', date);
      emit('select', date);
      emit('change', date);
    };

    const pickDay = (day: Date | DateValue) => {
      const date = day instanceof Date ? new Date(day) : toDate(day);
      if (!date || props.disabledDate?.(date)) return;
      selected.value = date;
      if (!isRangeMode.value) {
        const next = startOfMonth(date);
        if (next.getTime() !== cursor.value.getTime()) {
          cursor.value = next;
          emit('panel-change', new Date(next));
        }
      }
      emitSelect(date);
    };

    const selectDate = (type: CalendarSelectDateType) => {
      if (isRangeMode.value) return;
      const year = cursor.value.getFullYear();
      const month = cursor.value.getMonth();
      if (type === 'today') {
        pickDay(new Date());
        return;
      }
      const next =
        type === 'prev-month'
          ? new Date(year, month - 1, 1)
          : type === 'next-month'
            ? new Date(year, month + 1, 1)
            : type === 'prev-year'
              ? new Date(year - 1, month, 1)
              : new Date(year + 1, month, 1);
      cursor.value = next;
      emit('panel-change', new Date(next));
    };

    expose({ selectedDay, pickDay, selectDate, calculateValidatedDateRange });

    const yearOptions = computed(() => {
      const year = cursor.value.getFullYear();
      return Array.from({ length: 21 }, (_, i) => year - 10 + i);
    });
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
    const formatLabel = (type: 'year' | 'month', value: number) => {
      if (props.formatter) {
        try {
          return props.formatter(type, value);
        } catch {
          // Formatter 异常时回退到默认文案。
        }
      }
      return type === 'year' ? `${value}年` : `${value}月`;
    };
    const onYearChange = (event: Event) => {
      const year = Number((event.target as HTMLSelectElement).value);
      cursor.value = new Date(year, cursor.value.getMonth(), 1);
      emit('panel-change', new Date(cursor.value));
    };
    const onMonthChange = (event: Event) => {
      const month = Number((event.target as HTMLSelectElement).value) - 1;
      cursor.value = new Date(cursor.value.getFullYear(), month, 1);
      emit('panel-change', new Date(cursor.value));
    };

    return () => {
      const renderHeader = () => {
        if (slots.header) {
          return <div class='i-calendar__header'>{slots.header({ date: headerDate.value })}</div>;
        }
        if (isRangeMode.value) {
          return (
            <div class='i-calendar__header'>
              <strong class='i-calendar__title'>{headerLabel.value}</strong>
            </div>
          );
        }
        if (props.controllerType === 'select') {
          return (
            <div class='i-calendar__header'>
              <strong class='i-calendar__title'>{headerLabel.value}</strong>
              <div class='i-calendar__controls'>
                <select aria-label='选择年份' value={cursor.value.getFullYear()} onChange={onYearChange}>
                  {yearOptions.value.map((year) => (
                    <option key={year} value={year}>
                      {formatLabel('year', year)}
                    </option>
                  ))}
                </select>
                <select aria-label='选择月份' value={cursor.value.getMonth() + 1} onChange={onMonthChange}>
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {formatLabel('month', month)}
                    </option>
                  ))}
                </select>
                <button type='button' onClick={() => selectDate('today')}>
                  今天
                </button>
              </div>
            </div>
          );
        }
        return (
          <div class='i-calendar__header'>
            <strong class='i-calendar__title'>{headerLabel.value}</strong>
            <div class='i-calendar__controls'>
              <button type='button' aria-label='上个月' onClick={() => selectDate('prev-month')}>
                ‹
              </button>
              <button type='button' onClick={() => selectDate('today')}>
                今天
              </button>
              <button type='button' aria-label='下个月' onClick={() => selectDate('next-month')}>
                ›
              </button>
            </div>
          </div>
        );
      };
      const cellSlot = slots['date-cell'] ?? slots.date;
      return (
        <div class={['i-calendar', { 'is-range': isRangeMode.value }]}>
          {renderHeader()}
          <div class='i-calendar__week' role='row'>
            {weekNames.value.map((day, index) => (
              <span key={`${day}-${index}`} role='columnheader'>
                {day}
              </span>
            ))}
          </div>
          <div class='i-calendar__grid' role='grid'>
            {days.value.map(({ date, type }) => {
              const data: CalendarCellData = {
                day: formatDate(date, 'YYYY-MM-DD'),
                date,
                isSelected: !!selected.value && sameDay(date, selected.value),
                type
              };
              const disabled = props.disabledDate?.(date) ?? false;
              return (
                <button
                  type='button'
                  key={data.day}
                  role='gridcell'
                  aria-label={data.day}
                  aria-pressed={data.isSelected ? 'true' : undefined}
                  aria-disabled={disabled ? 'true' : undefined}
                  class={{
                    'is-other-month': type !== 'current-month',
                    'is-selected': data.isSelected,
                    'is-today': props.highlightCurrent && sameDay(date, new Date()),
                    [`is-${type}`]: true
                  }}
                  disabled={disabled}
                  onClick={() => pickDay(date)}>
                  {cellSlot?.({ data, date }) ?? date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      );
    };
  }
});
