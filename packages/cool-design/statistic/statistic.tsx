import { computed, defineComponent, type PropType } from 'vue';
export default defineComponent({
  name: 'i-statistic',
  props: {
    title: String,
    value: { type: [String, Number] as PropType<string | number>, default: 0 },
    precision: Number,
    prefix: String,
    suffix: String,
    valueStyle: Object as PropType<Record<string, string>>
  },
  setup(props, { slots }) {
    const display = computed(() =>
      typeof props.value === 'number' && props.precision != null
        ? props.value.toFixed(props.precision)
        : String(props.value)
    );
    return () => (
      <div class='i-statistic'>
        <div class='i-statistic__title'>{slots.title?.() ?? props.title}</div>
        <div class='i-statistic__content' style={props.valueStyle}>
          {props.prefix}
          {display.value}
          {props.suffix}
        </div>
        {slots.prefix?.()}
      </div>
    );
  }
});
