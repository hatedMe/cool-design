import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent, h, mergeProps, ref, shallowRef, watch, type PropType } from 'vue';

export type TextType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | '';
export type TextSize = 'large' | 'default' | 'small';

export default defineComponent({
  name: 'i-text',
  inheritAttrs: false,
  props: {
    type: { type: String as PropType<TextType>, default: '' },
    size: { type: String as PropType<TextSize | ''>, default: '' },
    truncated: Boolean,
    lineClamp: [String, Number],
    tag: { type: String, default: 'span' }
  },
  setup(props, { attrs, expose, slots }) {
    const ns = useNamespace('text');
    const element = shallowRef<HTMLElement>();
    const automaticTitle = ref<string>();

    expose({
      get isTruncated() {
        return automaticTitle.value !== undefined;
      }
    });

    watch(
      [element, () => props.truncated, () => props.lineClamp],
      ([target, truncated, lineClamp], _, onCleanup) => {
        if (!target || (!truncated && lineClamp === undefined)) {
          automaticTitle.value = undefined;
          return;
        }

        let frame: number | undefined;
        const scheduleMeasure = () => {
          if (frame !== undefined) return;
          frame = requestAnimationFrame(() => {
            frame = undefined;
            const size = truncated ? target.offsetWidth : target.offsetHeight;
            const contentSize = truncated ? target.scrollWidth : target.scrollHeight;
            automaticTitle.value = size > 0 && contentSize > size ? (target.textContent ?? '') : undefined;
          });
        };

        const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleMeasure) : undefined;
        resizeObserver?.observe(target);
        const mutationObserver = typeof MutationObserver !== 'undefined' ? new MutationObserver(scheduleMeasure) : undefined;
        mutationObserver?.observe(target, {
          attributeFilter: ['class', 'style'],
          childList: true,
          characterData: true,
          subtree: true
        });
        scheduleMeasure();

        onCleanup(() => {
          resizeObserver?.disconnect();
          mutationObserver?.disconnect();
          if (frame !== undefined) cancelAnimationFrame(frame);
        });
      },
      { flush: 'post' }
    );

    return () =>
      h(
        props.tag,
        mergeProps(
          {
            ref: element,
            class: [
              ns.b(),
              ns.m(props.type),
              ns.m(props.size),
              props.truncated && 'is-truncated',
              props.lineClamp !== undefined && 'is-line-clamp'
            ],
            style: props.lineClamp !== undefined ? { '-webkit-line-clamp': String(props.lineClamp) } : undefined
          },
          attrs,
          { title: attrs.title ?? automaticTitle.value }
        ),
        slots.default?.()
      );
  }
});
