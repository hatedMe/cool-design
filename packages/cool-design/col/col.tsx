import { useNamespace } from '../../hooks/use-namespace';
import { computed, defineComponent, h, inject, type PropType } from 'vue';
import { rowKeys } from '../row/row';
import type { ColSize } from './types';
const responsive = { type: [Number, Object] as PropType<ColSize>, default: undefined };
const units = (value: number) => (Number.isFinite(value) ? Math.max(0, Math.min(24, Math.trunc(value))) : 0);
export default defineComponent({
  name: 'i-col',
  props: {
    span: { type: Number, default: 24 },
    tag: { type: String, default: 'div' },
    offset: { type: Number, default: 0 },
    pull: { type: Number, default: 0 },
    push: { type: Number, default: 0 },
    xs: responsive,
    sm: responsive,
    md: responsive,
    lg: responsive,
    xl: responsive
  },
  setup(props, { slots }) {
    const ns = useNamespace('col');
    const { gutter } = inject(rowKeys, { gutter: computed(() => 0) });
    return () => {
      const classes = [
        ns.b(),
        ns.b(String(units(props.span))),
        ns.b(`offset-${units(props.offset)}`),
        ns.b(`push-${units(props.push)}`),
        ns.b(`pull-${units(props.pull)}`)
      ];
      for (const breakpoint of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
        const value = props[breakpoint];
        if (value === undefined) continue;
        const values =
          typeof value === 'number' ? { span: value } : value && typeof value === 'object' ? value : {};
        for (const key of ['span', 'offset', 'push', 'pull'] as const) {
          const amount = values[key];
          if (amount !== undefined)
            classes.push(ns.b(`${breakpoint}-${key === 'span' ? '' : `${key}-`}${units(amount)}`));
        }
      }
      return h(
        props.tag,
        {
          class: classes,
          style: gutter.value
            ? { paddingLeft: `${gutter.value / 2}px`, paddingRight: `${gutter.value / 2}px` }
            : undefined
        },
        slots.default?.()
      );
    };
  }
});
