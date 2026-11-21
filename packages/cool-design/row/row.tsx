import { computed, defineComponent, h, provide, type InjectionKey, type ComputedRef, type PropType } from 'vue';
export const rowValues = ['start', 'end', 'center', 'space-around', 'space-between', 'space-evenly'] as const;
export const columnValues = ['top', 'middle', 'bottom', 'center'] as const;
const justifyContent = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  'space-around': 'space-around',
  'space-between': 'space-between',
  'space-evenly': 'space-evenly'
} as const;
const alignItems = { top: 'flex-start', middle: 'center', bottom: 'flex-end', center: 'center' } as const;
export const rowKeys: InjectionKey<{ gutter: ComputedRef<number> }> = Symbol('row');
export default defineComponent({
  name: 'i-row',
  props: {
    tag: { type: String, default: 'div' },
    gutter: { type: Number, default: 0 },
    justify: { type: String as PropType<(typeof rowValues)[number]>, default: 'start' },
    align: { type: String as PropType<(typeof columnValues)[number]> }
  },
  setup(props, { slots }) {
    const gutter = computed(() => (Number.isFinite(props.gutter) ? Math.max(0, props.gutter) : 0));
    provide(rowKeys, { gutter });
    return () =>
      h(
        props.tag,
        {
          class: 'i-row',
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: justifyContent[props.justify],
            alignItems: props.align ? alignItems[props.align] : undefined,
            marginLeft: gutter.value ? `${-gutter.value / 2}px` : undefined,
            marginRight: gutter.value ? `${-gutter.value / 2}px` : undefined
          }
        },
        slots.default?.()
      );
  }
});
