import { defineComponent, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';

export default defineComponent({
  name: 'i-tab-pane',
  props: {
    label: { type: String, default: '' },
    name: { type: [String, Number] as PropType<string | number>, default: '' },
    disabled: Boolean,
    closable: { type: Boolean, default: undefined },
    lazy: Boolean
  },
  setup(props, { slots }) {
    const ns = useNamespace('tab-pane');
    // 实际内容由 Tabs 父组件统一渲染，此处仅兼容独立使用
    return () => (
      <div class={ns.b()} data-name={String(props.name)}>
        {slots.default?.()}
      </div>
    );
  }
});
