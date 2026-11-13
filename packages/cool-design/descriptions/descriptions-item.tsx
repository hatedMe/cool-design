import { defineComponent, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';

const [name, bem] = createNamespace('descriptions-item');

export type DescriptionsItemAlign = 'left' | 'center' | 'right';

export default defineComponent({
  name,
  props: {
    label: { type: String, default: '' },
    span: { type: Number, default: 1 },
    rowspan: { type: Number, default: 1 },
    width: { type: [String, Number] as PropType<string | number>, default: '' },
    minWidth: { type: [String, Number] as PropType<string | number>, default: '' },
    labelWidth: { type: [String, Number] as PropType<string | number>, default: '' },
    align: { type: String as PropType<DescriptionsItemAlign>, default: '' },
    labelAlign: { type: String as PropType<DescriptionsItemAlign>, default: '' },
    className: { type: String, default: '' },
    labelClassName: { type: String, default: '' }
  },
  setup(_, { slots }) {
    // 实际单元格由 Descriptions 父组件统一渲染为表格，此处仅兼容独立使用
    return () => <div class={bem()}>{slots.default?.()}</div>;
  }
});
