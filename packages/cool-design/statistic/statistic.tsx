import { computed, defineComponent, type PropType, type StyleValue } from 'vue';
import { createNamespace } from '../../../src/utils/create';

const [name, bem] = createNamespace('statistic');

export type StatisticValue = string | number;
export type StatisticFormatter = (value: StatisticValue) => string;

const toInt = (value: unknown, fallback: number): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.floor(numeric) : fallback;
};

const groupInteger = (digits: string, separator: string): string => {
  if (!separator) return digits;
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

export default defineComponent({
  name,
  props: {
    title: { type: String, default: '' },
    value: { type: [String, Number] as PropType<StatisticValue>, default: 0 },
    precision: { type: Number, default: 0 },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    decimalSeparator: { type: String, default: '.' },
    groupSeparator: { type: String, default: ',' },
    /** 自定义格式化，返回最终展示字符串 */
    formatter: { type: Function as PropType<StatisticFormatter>, default: undefined },
    valueStyle: { type: [String, Object] as PropType<string | Record<string, string>>, default: undefined }
  },
  setup(props, { slots, expose }) {
    const display = computed(() => {
      if (props.formatter) return props.formatter(props.value);
      const raw = props.value;
      let numeric: number | null = null;
      if (typeof raw === 'number') {
        numeric = raw;
      } else if (typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(Number(raw))) {
        numeric = Number(raw);
      }
      if (numeric == null || !Number.isFinite(numeric)) return String(raw);
      const precision = Math.max(0, toInt(props.precision, 0));
      const fixed = Math.abs(numeric).toFixed(precision);
      const [int, frac] = fixed.split('.');
      const grouped = groupInteger(int, props.groupSeparator);
      const body = frac != null && precision > 0 ? `${grouped}${props.decimalSeparator}${frac}` : grouped;
      return `${numeric < 0 ? '-' : ''}${body}`;
    });

    const contentStyle = computed<StyleValue | undefined>(() => props.valueStyle as StyleValue | undefined);
    expose({ displayValue: display });

    return () => (
      <div class={name}>
        {(props.title || slots.title) && (
          <div class={bem('title')}>{slots.title?.() ?? props.title}</div>
        )}
        <div class={bem('content')} style={contentStyle.value}>
          {(props.prefix || slots.prefix) && (
            <span class={bem('prefix')}>{slots.prefix?.() ?? props.prefix}</span>
          )}
          <span class={bem('number')}>{display.value}</span>
          {(props.suffix || slots.suffix) && (
            <span class={bem('suffix')}>{slots.suffix?.() ?? props.suffix}</span>
          )}
        </div>
      </div>
    );
  }
});
