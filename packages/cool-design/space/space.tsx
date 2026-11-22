import { Comment, defineComponent, h, isVNode, type PropType, type VNode } from 'vue';
import { useConfig, type Size } from '../config-provider/context';
export type SpaceAlignment = 'normal' | 'start' | 'end' | 'center' | 'baseline' | 'stretch';
const SIZE_MAP: Record<string, number> = { small: 8, default: 12, large: 16 };
export default defineComponent({
  name: 'i-space',
  props: {
    size: [Number, String, Array] as PropType<number | Size | [number, number]>,
    direction: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    /** 标准属性名，优先于 `align` */
    alignment: String as PropType<SpaceAlignment>,
    /** 兼容别名（项目早期属性名） */
    align: String as PropType<SpaceAlignment>,
    prefixCls: String,
    wrap: { type: Boolean, default: false },
    fill: Boolean,
    fillRatio: { type: Number, default: 100 },
    spacer: [String, Number, Object] as PropType<string | number | VNode>
  },
  setup(props, { slots }) {
    const config = useConfig();
    return () => {
      const size = props.size ?? config.value.size ?? 'small';
      let horizontal: number;
      let vertical: number;
      if (Array.isArray(size)) {
        horizontal = size[0] ?? 0;
        vertical = size[1] ?? 0;
      } else {
        const value = typeof size === 'number' ? size : SIZE_MAP[size] ?? SIZE_MAP.small;
        if ((props.wrap || props.fill) && props.direction === 'horizontal') {
          horizontal = value;
          vertical = value;
        } else if (props.direction === 'horizontal') {
          horizontal = value;
          vertical = 0;
        } else {
          horizontal = 0;
          vertical = value;
        }
      }
      const children = (slots.default?.() ?? []).filter((child) => child.type !== Comment);
      const itemClass = `${props.prefixCls || 'i-space'}__item`;
      const itemStyle = props.fill ? { flexGrow: 1, minWidth: `${props.fillRatio}%` } : undefined;
      const rendered: unknown[] = [];
      children.forEach((child, index) => {
        if (index > 0 && props.spacer !== undefined && props.spacer !== null) {
          rendered.push(
            isVNode(props.spacer)
              ? h(props.spacer)
              : h('span', { class: 'i-space__spacer' }, String(props.spacer))
          );
        }
        rendered.push(h('div', { class: itemClass, style: itemStyle }, [child]));
      });
      return (
        <div
          class={['i-space', `i-space--${props.direction}`]}
          style={{
            flexDirection: props.direction === 'vertical' ? 'column' : 'row',
            flexWrap: props.wrap || props.fill ? 'wrap' : 'nowrap',
            alignItems: props.alignment ?? props.align ?? 'center',
            rowGap: `${vertical}px`,
            columnGap: `${horizontal}px`
          }}>
          {rendered}
        </div>
      );
    };
  }
});
