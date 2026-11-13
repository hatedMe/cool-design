import { computed, defineComponent, type PropType } from 'vue';
import type { TimeParts } from './date';

export type TimeUnit = 'hour' | 'minute' | 'second';
export type TimeDisabledRule = (...args: number[]) => number[];

export default defineComponent({
  name: 'i-time-picker-panel',
  props: {
    value: { type: Object as PropType<TimeParts>, required: true },
    format: { type: String, default: 'HH:mm:ss' },
    disabledHours: Function as PropType<TimeDisabledRule>,
    disabledMinutes: Function as PropType<TimeDisabledRule>,
    disabledSeconds: Function as PropType<TimeDisabledRule>
  },
  emits: ['select'],
  setup(props, { emit }) {
    const units = computed<TimeUnit[]>(() => {
      const result: TimeUnit[] = ['hour', 'minute'];
      if (props.format.includes('ss')) result.push('second');
      return result;
    });
    const values = (unit: TimeUnit) => unit === 'hour' && (props.format.includes('hh') || props.format.includes('h')) ? Array.from({ length: 12 }, (_, index) => index + 1) : Array.from({ length: unit === 'hour' ? 24 : 60 }, (_, index) => index);
    const disabled = (unit: TimeUnit, value: number) => {
      if (unit === 'hour') return props.disabledHours?.()?.includes(value) || false;
      if (unit === 'minute') return props.disabledMinutes?.(props.value.hour)?.includes(value) || false;
      return props.disabledSeconds?.(props.value.hour, props.value.minute)?.includes(value) || false;
    };
    const selected = (unit: TimeUnit) => unit === 'hour' && (props.format.includes('hh') || props.format.includes('h')) ? ((props.value.hour % 12) || 12) : props.value[unit];
    return () => (
      <div class='i-time-picker__panel' role='dialog'>
        {units.value.map((unit) => (
          <div class='i-time-picker__column' role='listbox' data-unit={unit} aria-label={unit} key={unit}>
            {values(unit).map((value) => {
              const isDisabled = disabled(unit, value);
              return (
                <button
                  type='button'
                  role='option'
                  class={['i-time-picker__option', { 'is-selected': selected(unit) === value, 'is-disabled': isDisabled }]}
                  data-unit={unit}
                  data-value={String(value).padStart(2, '0')}
                  aria-selected={selected(unit) === value}
                  aria-disabled={isDisabled || undefined}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && emit('select', unit, value)}>
                  {String(value).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
});
