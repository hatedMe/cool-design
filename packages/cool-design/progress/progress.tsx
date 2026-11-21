import { computed, defineComponent, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';

const [name, bem] = createNamespace('progress');

export type ProgressType = 'line' | 'circle' | 'dashboard';
export type ProgressStatus = '' | 'success' | 'exception' | 'warning';
export type ProgressStrokeLinecap = 'butt' | 'round' | 'square';
export type ProgressColorStop = { color: string; percentage: number };
export type ProgressColor = string | ((percentage: number) => string) | ProgressColorStop[];
export type ProgressFormat = (percentage: number) => string;

const STATUS_COLORS: Record<Exclude<ProgressStatus, ''>, string> = {
  success: '#67c23a',
  exception: '#f56c6c',
  warning: '#e6a23c'
};

const clampPercentage = (value: unknown): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
};

export default defineComponent({
  name,
  props: {
    percentage: { type: Number, default: 0 },
    type: { type: String as PropType<ProgressType>, default: 'line' },
    strokeWidth: { type: Number, default: 6 },
    textInside: Boolean,
    status: { type: String as PropType<ProgressStatus>, default: '' },
    indeterminate: Boolean,
    duration: { type: Number, default: 3 },
    color: { type: [String, Function, Array] as PropType<ProgressColor>, default: '' },
    width: { type: Number, default: 126 },
    showText: { type: Boolean, default: true },
    strokeLinecap: { type: String as PropType<ProgressStrokeLinecap>, default: 'round' },
    striped: Boolean,
    stripedFlow: Boolean,
    format: { type: Function as PropType<ProgressFormat>, default: (percentage: number) => `${percentage}%` },
    defineBackColor: { type: String, default: '' },
    textColor: { type: String, default: '' }
  },
  setup(props, { slots }) {
    const clamped = computed(() => clampPercentage(props.percentage));
    const content = computed(() => props.format(clamped.value));
    const barColor = computed(() => {
      const { color, status } = props;
      if (typeof color === 'function') return color(clamped.value);
      if (Array.isArray(color) && color.length > 0) {
        const stops = [...color].sort((a, b) => a.percentage - b.percentage);
        return stops.find((stop) => clamped.value <= stop.percentage)?.color ?? stops[stops.length - 1].color;
      }
      if (typeof color === 'string' && color) return color;
      if (status) return STATUS_COLORS[status as Exclude<ProgressStatus, ''>] ?? '';
      return '';
    });
    const isCircle = computed(() => props.type === 'circle' || props.type === 'dashboard');
    const displayText = () => slots.default?.({ percentage: clamped.value }) ?? content.value;

    return () => {
      if (isCircle.value) {
        const size = props.width;
        const center = size / 2;
        const radius = Math.max(0, (size - props.strokeWidth) / 2);
        const dashboard = props.type === 'dashboard';
        const transform = `rotate(${dashboard ? 135 : -90} ${center} ${center})`;
        const progressLength = clamped.value * (dashboard ? 0.75 : 1);
        return (
          <div
            class={bem({ [props.type]: true, [props.status]: !!props.status, indeterminate: props.indeterminate })}
            role='progressbar'
            aria-valuenow={clamped.value}
            aria-valuemin={0}
            aria-valuemax={100}>
            <div class={bem('circle')} style={{ width: `${size}px`, height: `${size}px` }}>
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                  class={bem('track-path')}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill='none'
                  stroke={props.defineBackColor || undefined}
                  stroke-width={props.strokeWidth}
                  pathLength={100}
                  stroke-dasharray={dashboard ? '75 25' : undefined}
                  transform={transform}
                />
                <circle
                  class={bem('circle-path')}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill='none'
                  stroke={barColor.value || undefined}
                  stroke-width={props.strokeWidth}
                  stroke-linecap={props.strokeLinecap}
                  pathLength={100}
                  stroke-dasharray={`${progressLength} 100`}
                  transform={transform}
                />
              </svg>
              {props.showText && (
                <div class={bem('text')} style={{ color: props.textColor || undefined }}>
                  {displayText()}
                </div>
              )}
            </div>
          </div>
        );
      }
      return (
        <div
          class={bem({
            [props.type]: true,
            [props.status]: !!props.status,
            'text-inside': props.textInside,
            indeterminate: props.indeterminate
          })}
          role='progressbar'
          aria-valuenow={clamped.value}
          aria-valuemin={0}
          aria-valuemax={100}>
          <div
            class={bem('bar')}
            style={{ height: `${props.strokeWidth}px`, backgroundColor: props.defineBackColor || undefined }}>
            <div
              class={bem('inner', {
                striped: props.striped,
                'striped-flow': props.stripedFlow,
                indeterminate: props.indeterminate
              })}
              style={{
                width: `${clamped.value}%`,
                background: barColor.value || undefined,
                animationDuration: props.indeterminate || props.stripedFlow ? `${props.duration}s` : undefined
              }}>
              {props.textInside && props.showText && (
                <span class={bem('inner-text')} style={{ color: props.textColor || undefined }}>
                  {displayText()}
                </span>
              )}
            </div>
          </div>
          {!props.textInside && props.showText && (
            <span class={bem('text')} style={{ color: props.textColor || undefined }}>
              {displayText()}
            </span>
          )}
        </div>
      );
    };
  }
});
