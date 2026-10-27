import { defineComponent, h, type Component, type PropType } from 'vue';
import { useConfig } from '../config-provider/context';
export default defineComponent({
  name: 'i-icon',
  props: {
    type: { type: String, default: '' },
    icon: [String, Object, Function] as PropType<string | Component>,
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
          class: [
            !slots.default && typeof props.icon !== 'object' && typeof props.icon !== 'function' && 'iconfont',
            'i-icon',
            !slots.default && (typeof props.icon === 'string' ? props.icon : !props.icon ? props.type : undefined),
            `i-icon--${config.value.size}`
          ],
          role: props.label ? 'img' : undefined,
          'aria-label': props.label || undefined,
          'aria-hidden': props.label ? undefined : 'true',
          style: {
            fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
            color: props.color
          }
        },
        slots.default?.() || (props.icon && typeof props.icon !== 'string' ? [h(props.icon)] : undefined)
      );
  }
});
