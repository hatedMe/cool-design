import { defineComponent, h, type PropType } from 'vue';
import { useConfig } from '../config-provider/context';
export default defineComponent({
  name: 'i-icon',
  props: {
    type: { type: String, default: '' },
    size: [String, Number] as PropType<string | number>,
    color: String,
    label: String
  },
  setup(props, { slots }) {
    const config = useConfig();
    return () =>
      h(
        'i',
        {
          class: [!slots.default && 'iconfont', 'i-icon', !slots.default && props.type, `i-icon--${config.value.size}`],
          role: props.label ? 'img' : undefined,
          'aria-label': props.label || undefined,
          'aria-hidden': props.label ? undefined : 'true',
          style: {
            fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
            color: props.color
          }
        },
        slots.default?.()
      );
  }
});
