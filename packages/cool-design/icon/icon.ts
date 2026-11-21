import { defineComponent, h, toRaw, type Component, type PropType } from 'vue';
import { useConfig } from '../config-provider/context';
export default defineComponent({
  name: 'i-icon',
  inheritAttrs: false,
  props: {
    type: { type: String, default: '' },
    icon: [String, Object, Function] as PropType<string | Component>,
    size: [String, Number] as PropType<string | number>,
    color: String,
    label: String
  },
  setup(props, { slots, attrs }) {
    const config = useConfig();
    return () => {
      const ariaLabel = props.label || (attrs['aria-label'] as string | undefined);
      const iconComponent = props.icon && typeof props.icon !== 'string' ? toRaw(props.icon) : undefined;
      const iconClass = typeof props.icon === 'string' && props.icon ? props.icon : props.type;
      const customClass = attrs.class;
      const customStyle = attrs.style;
      const externalAriaHidden = attrs['aria-hidden'] as string | undefined;
      const externalRole = attrs.role as string | undefined;
      const fallthroughAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([name]) => name !== 'class' && name !== 'style' && name !== 'aria-label' && name !== 'aria-hidden')
      );
      return h(
        'i',
        {
          ...fallthroughAttrs,
          class: [
            customClass,
            !slots.default && !iconComponent && 'iconfont',
            'i-icon',
            !slots.default && iconClass,
            `i-icon--${config.value.size}`
          ],
          role: ariaLabel ? 'img' : externalRole,
          'aria-label': ariaLabel || undefined,
          'aria-hidden': ariaLabel ? undefined : externalAriaHidden ?? 'true',
          style: [
            customStyle,
            {
              fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
              color: props.color
            }
          ]
        },
        slots.default?.() || (iconComponent ? [h(iconComponent)] : undefined)
      );
    };
  }
});
