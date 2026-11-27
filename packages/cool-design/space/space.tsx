import { useNamespace } from '../../hooks/use-namespace';
import { Comment, Fragment, Text, createTextVNode, defineComponent, h, isVNode, type PropType, type VNode } from 'vue';
import { useConfig, type Size } from '../config-provider/context';
export type SpaceAlignment = 'normal' | 'start' | 'end' | 'center' | 'baseline' | 'stretch';
const SIZE_MAP: Record<string, number> = { small: 8, default: 12, large: 16 };
type ScopedKeys = Map<PropertyKey, { item?: symbol; spacer?: symbol; children?: ScopedKeys }>;
type SlotFragment = VNode & { slotScopeIds?: string[] | null };

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
    const ns = useNamespace('space');
    const config = useConfig();
    let previousKeys: ScopedKeys | undefined;
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
      const itemClass = `${props.prefixCls || ns.b()}__item`;
      const itemStyle = props.fill ? { flexGrow: 1, minWidth: `${props.fillRatio}%` } : undefined;
      const spacer = props.spacer;
      const rendered: VNode[] = [];
      const renderItems = (
        children: readonly unknown[],
        previous?: ScopedKeys,
        slotScopeIds?: string[]
      ): ScopedKeys => {
        const keys: ScopedKeys = new Map();
        let unkeyedFragments = 0;
        let unkeyedItems = 0;
        for (const child of children) {
          const node = isVNode(child) ? child :
            typeof child === 'string' || typeof child === 'number' ? createTextVNode(String(child)) : undefined;
          const group = Array.isArray(child) ? child :
            node?.type === Fragment && Array.isArray(node.children) ? node.children : undefined;
          if (!group && (!node || node.type === Comment || node.type === Fragment ||
            (node.type === Text && node.children === ''))) continue;

          // 展开 Fragment 后，键仍然只在原来的同级范围内匹配。
          const sourceKey = node?.key;
          const localKey = typeof sourceKey === 'symbol' ? sourceKey :
            sourceKey != null ? `${typeof sourceKey}:${sourceKey}` :
              group ? `fragment:${unkeyedFragments++}` : unkeyedItems++;
          const old = previous?.get(localKey);
          if (group) {
            const fragmentScopes = (node as SlotFragment | undefined)?.slotScopeIds;
            const scopes = fragmentScopes ? slotScopeIds?.concat(fragmentScopes) ?? fragmentScopes : slotScopeIds;
            keys.set(localKey, { children: renderItems(group, old?.children, scopes) });
          } else {
            const item = old?.item ?? Symbol();
            const spacerKey = old?.spacer ?? Symbol();
            keys.set(localKey, { item, spacer: spacerKey });
            if (rendered.length && spacer != null) {
              rendered.push(isVNode(spacer)
                ? h(Fragment, { key: spacerKey }, [h(spacer)])
                : h('span', { key: spacerKey, class: ns.e('spacer') }, String(spacer)));
            }
            let content = node;
            if (slotScopeIds?.length) {
              // Vue 从 Fragment 向内传递插槽作用域，保持包装元素在原作用域之外。
              const fragment = h(Fragment, [node]) as SlotFragment;
              fragment.slotScopeIds = slotScopeIds;
              content = fragment;
            }
            rendered.push(h('div', { key: item, class: itemClass, style: itemStyle }, [content]));
          }
        }
        return keys;
      };
      previousKeys = renderItems(slots.default?.() ?? [], previousKeys);
      return (
        <div
          class={[ns.b(), `${ns.b()}--${props.direction}`]}
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
