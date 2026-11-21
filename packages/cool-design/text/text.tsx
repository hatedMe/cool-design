import { defineComponent, h, type PropType } from 'vue';

export type TextType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | '';
export type TextSize = 'large' | 'default' | 'small';

export default defineComponent({
  name: 'i-text',
  props: {
    type: { type: String as PropType<TextType>, default: '' },
    size: { type: String as PropType<TextSize | ''>, default: '' },
    truncated: Boolean,
    lineClamp: [String, Number],
    tag: { type: String, default: 'span' }
  },
  setup(props, { slots }) {
    return () =>
      h(
        props.tag,
        {
          class: [
            'i-text',
            props.type && `i-text--${props.type}`,
            props.size && `i-text--${props.size}`,
            props.truncated && 'is-truncated',
            props.lineClamp !== undefined && 'is-line-clamp'
          ],
          style:
            props.lineClamp !== undefined
              ? { '-webkit-line-clamp': String(props.lineClamp) }
              : undefined
        },
        slots.default?.()
      );
  }
});
