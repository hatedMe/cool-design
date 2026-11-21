import {
  Comment,
  Fragment,
  computed,
  defineComponent,
  type CSSProperties,
  type PropType,
  type Slot,
  type VNode,
  type VNodeChild
} from 'vue';
import { createNamespace } from '../../../src/utils/create';
import DescriptionsItem from './descriptions-item';

const [name, bem] = createNamespace('descriptions');

export type DescriptionsDirection = 'horizontal' | 'vertical';
export type DescriptionsSize = 'large' | 'default' | 'small';

export interface DescriptionItem {
  label: string;
  content?: unknown;
  span?: number;
}

interface NormalizedItem {
  key: string;
  label: VNodeChild | string;
  content: VNodeChild | unknown;
  labelSlot?: Slot;
  contentSlot?: Slot;
  span: number;
  rowspan: number;
  width: string | number | '';
  minWidth: string | number | '';
  labelWidth: string | number | '';
  align: string;
  labelAlign: string;
  className: string;
  labelClassName: string;
}

const toCssSize = (value: string | number | ''): string | undefined => {
  if (value == null || value === '') return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

const toInt = (value: unknown, fallback: number): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.floor(numeric) : fallback;
};

const flatten = (nodes: VNode[]): VNode[] => {
  const result: VNode[] = [];
  nodes.forEach((node) => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      result.push(...flatten(node.children as VNode[]));
    } else if (node.type !== Comment) {
      result.push(node);
    }
  });
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isItemVNode = (node: VNode): boolean => (node.type as any)?.name === 'i-descriptions-item';

export default defineComponent({
  name,
  props: {
    title: { type: String, default: '' },
    extra: { type: String, default: '' },
    border: Boolean,
    column: { type: Number, default: 3 },
    direction: { type: String as PropType<DescriptionsDirection>, default: 'horizontal' },
    size: { type: String as PropType<DescriptionsSize>, default: 'default' },
    labelWidth: { type: [String, Number] as PropType<string | number>, default: '' },
    /** 兼容属性：声明式数据，未使用 DescriptionsItem 子组件时生效 */
    items: { type: Array as PropType<DescriptionItem[]>, default: () => [] }
  },
  setup(props, { slots }) {
    const column = computed(() => Math.max(1, toInt(props.column, 3)));

    const normalized = computed<NormalizedItem[]>(() => {
      const children = flatten((slots.default?.() ?? []).filter(Boolean) as VNode[]).filter(isItemVNode);
      if (children.length > 0) {
        return children.map((node, index) => {
          const nodeProps = (node.props ?? {}) as Record<string, unknown>;
          const nodeSlots = node.children as unknown as Record<string, Slot | undefined>;
          const getSlot = (slotName: string): Slot | undefined => {
            const slot = nodeSlots?.[slotName];
            return typeof slot === 'function' ? slot : undefined;
          };
          const defaultSlot = getSlot('default');
          const labelSlot = getSlot('label');
          const label = (nodeProps.label as string) ?? '';
          return {
            key: node.key != null ? String(node.key) : `item-${index}`,
            label,
            content: undefined,
            labelSlot,
            contentSlot: defaultSlot,
            span: Math.max(1, toInt(nodeProps.span, 1)),
            rowspan: Math.max(1, toInt(nodeProps.rowspan, 1)),
            width: (nodeProps.width as string | number) ?? '',
            minWidth: (nodeProps.minWidth as string | number) ?? '',
            labelWidth: (nodeProps.labelWidth as string | number) ?? '',
            align: (nodeProps.align as string) ?? '',
            labelAlign: (nodeProps.labelAlign as string) ?? '',
            className: (nodeProps.className as string) ?? '',
            labelClassName: (nodeProps.labelClassName as string) ?? ''
          };
        });
      }
      return props.items.map((item, index) => ({
        key: `${item.label}-${index}`,
        label: item.label,
        content: item.content,
        labelSlot: slots[`label-${index}`] as Slot | undefined,
        contentSlot: slots[`content-${index}`] as Slot | undefined,
        span: Math.max(1, toInt(item.span, 1)),
        rowspan: 1,
        width: '',
        minWidth: '',
        labelWidth: '',
        align: '',
        labelAlign: '',
        className: '',
        labelClassName: ''
      }));
    });

    /** 按 column 分行，span 超出剩余列时收敛；最后一项补足剩余列 */
    const rows = computed<NormalizedItem[][]>(() => {
      const result: NormalizedItem[][] = [];
      let current: NormalizedItem[] = [];
      let used = 0;
      const list = normalized.value;
      list.forEach((item, index) => {
        const remaining = column.value - used;
        let span = Math.min(item.span, remaining);
        if (index === list.length - 1) span = remaining;
        current.push({ ...item, span });
        used += span;
        if (used >= column.value) {
          result.push(current);
          current = [];
          used = 0;
        }
      });
      if (current.length > 0) result.push(current);
      return result;
    });

    const renderLabel = (item: NormalizedItem, scope: 'row' | 'col') => (
      <th
        scope={scope}
        colspan={props.direction === 'vertical' ? item.span || undefined : undefined}
        rowspan={props.direction === 'horizontal' && item.rowspan > 1 ? item.rowspan : undefined}
        class={[bem('label'), item.labelClassName]}
        style={{ width: toCssSize(item.labelWidth || props.labelWidth || ''), textAlign: item.labelAlign as CSSProperties['textAlign'] || undefined }}>
        {item.labelSlot?.() ?? item.label}
      </th>
    );

    const renderContent = (item: NormalizedItem) => {
      // 横向每项占“标签 + 内容”两列，内容单元格跨列数为 span * 2 - 1
      const colspan = props.direction === 'vertical' ? item.span : item.span * 2 - 1;
      return (
        <td
          colspan={colspan > 1 ? colspan : undefined}
          rowspan={props.direction === 'horizontal' && item.rowspan > 1 ? item.rowspan : undefined}
          class={[bem('content'), item.className]}
          style={{
            width: toCssSize(item.width),
            minWidth: toCssSize(item.minWidth),
            textAlign: (item.align as CSSProperties['textAlign']) || undefined
          }}>
          {item.contentSlot?.() ?? (item.content as VNodeChild)}
        </td>
      );
    };

    const renderHorizontal = () => (
      <table class={bem('table')}>
        <tbody>
          {rows.value.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((item) => (
                <Fragment key={item.key}>
                  {renderLabel(item, 'row')}
                  {renderContent(item)}
                </Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );

    const renderVertical = () => (
      <table class={bem('table')}>
        <tbody>
          {rows.value.map((row, rowIndex) => (
            <Fragment key={rowIndex}>
              <tr key={`label-${rowIndex}`}>
                {row.map((item) => (
                  <Fragment key={item.key}>{renderLabel(item, 'col')}</Fragment>
                ))}
              </tr>
              <tr key={`content-${rowIndex}`}>
                {row.map((item) => (
                  <Fragment key={item.key}>{renderContent(item)}</Fragment>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    );

    const hasHeader = computed(
      () => !!(props.title || props.extra || slots.title || slots.extra)
    );

    return () => (
      <section
        class={{
          [name]: true,
          'is-bordered': props.border,
          [`is-${props.direction}`]: true,
          [`${name}--${props.size}`]: props.size !== 'default'
        }}>
        {hasHeader.value && (
          <header class={bem('header')}>
            <span class={bem('title')}>{slots.title?.() ?? props.title}</span>
            <span class={bem('extra')}>{slots.extra?.() ?? props.extra}</span>
          </header>
        )}
        <div class={bem('body')}>{props.direction === 'vertical' ? renderVertical() : renderHorizontal()}</div>
      </section>
    );
  }
});

export { DescriptionsItem };
