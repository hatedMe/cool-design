import { useNamespace } from '../../hooks/use-namespace';
import { computed, defineComponent, onBeforeUnmount, ref, watch, type PropType } from 'vue';

export type CountdownValue = number | Date;

const pad = (value: number, length = 2) => String(Math.max(0, value)).padStart(length, '0');

export default defineComponent({
  name: 'i-countdown',
  props: {
    value: { type: [Number, Date] as PropType<CountdownValue>, required: true },
    format: { type: String, default: 'HH:mm:ss' },
    precision: { type: Number, default: 0 },
    title: { type: String, default: '' },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    valueStyle: [String, Object] as PropType<string | Record<string, string>>
  },
  emits: ['change', 'finish'],
  setup(props, { slots, emit }) {
    const ns = useNamespace('countdown');
    const remaining = ref(0);
    let timer: ReturnType<typeof setInterval> | undefined;
    let finished = false;

    const targetTime = () => (props.value instanceof Date ? props.value.getTime() : Number(props.value));

    const tick = () => {
      const next = Math.max(0, targetTime() - Date.now());
      remaining.value = next;
      emit('change', next);
      if (next <= 0 && !finished) {
        finished = true;
        stop();
        emit('finish');
      }
    };
    const start = () => {
      stop();
      finished = false;
      tick();
      if (remaining.value > 0) timer = setInterval(tick, 200);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    watch(() => props.value, start, { immediate: true });
    onBeforeUnmount(stop);

    const text = computed(() => {
      const ms = remaining.value;
      const days = Math.floor(ms / 86400000);
      const hours = Math.floor((ms % 86400000) / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const milliseconds = ms % 1000;
      const decimals = Math.min(3, Math.max(0, props.precision));
      const secondText = decimals > 0 ? (seconds + milliseconds / 1000).toFixed(decimals) : pad(seconds);
      return props.format
        .replace(/DDD?/g, (token) => (token.length === 3 ? pad(days, 3) : pad(days)))
        .replace(/HH?/g, (token) => (token.length === 2 ? pad(hours) : String(hours)))
        .replace(/mm?/g, (token) => (token.length === 2 ? pad(minutes) : String(minutes)))
        .replace(/SSS/g, pad(milliseconds, 3))
        .replace(/ss/gi, secondText);
    });

    return () => (
      <div class={ns.b()}>
        {(props.title || slots.title) && <div class={ns.e('title')}>{slots.title?.() ?? props.title}</div>}
        <div class={ns.e('content')} style={props.valueStyle}>
          {slots.prefix?.() ?? (props.prefix && <span class={ns.e('prefix')}>{props.prefix}</span>)}
          {slots.default?.({ value: remaining.value, text: text.value }) ?? (
            <span class={ns.e('value')}>{text.value}</span>
          )}
          {slots.suffix?.() ?? (props.suffix && <span class={ns.e('suffix')}>{props.suffix}</span>)}
        </div>
      </div>
    );
  }
});
