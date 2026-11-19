import { computed, defineComponent, ref, type PropType } from 'vue';
import type { CascaderLazyLoad, CascaderItemValue, CascaderModelValue, CascaderNode, CascaderNodeValue, CascaderOption, CascaderPropsMapping } from '../cascader/types';
import { useCascaderNodes } from '../cascader/node';

export default defineComponent({
  name: 'i-cascader-panel',
  props: {
    modelValue: [String, Number, Array] as PropType<CascaderModelValue>,
    options: { type: Array as PropType<CascaderOption[]>, default: () => [] },
    props: Object as PropType<CascaderPropsMapping>,
    emitPath: { type: Boolean, default: true },
    multiple: Boolean,
    checkStrictly: Boolean,
    border: { type: Boolean, default: true },
    lazy: Boolean,
    lazyLoad: Function as PropType<CascaderLazyLoad>,
    expandTrigger: { type: String as PropType<'click' | 'hover'>, default: 'click' }
  },
  emits: ['update:modelValue', 'change', 'expand-change'],
  setup(props, { emit, slots, expose }) {
    const activeValues = ref<CascaderNodeValue[]>([]);

    const nodes = useCascaderNodes({
      options: () => props.options,
      mapping: () => props.props,
      model: () => props.modelValue,
      multiple: () => props.multiple,
      checkStrictly: () => props.checkStrictly,
      lazy: () => props.lazy,
      lazyLoad: () => props.lazyLoad,
      rootLevel: 0
    });

    const nodeValue = (node: CascaderNode): CascaderItemValue =>
      props.emitPath ? node.path.map((item) => item.value) : node.value;

    const columns = computed(() => nodes.columns(activeValues.value));

    const expandTo = (node: CascaderNode) => {
      const values = nodes.activePathValues(node);
      if (values.join('\u0000') === activeValues.value.join('\u0000')) return;
      activeValues.value = values;
      emit('expand-change', [...activeValues.value]);
    };

    const update = (value: CascaderModelValue) => {
      emit('update:modelValue', value);
      emit('change', value);
    };

    const hoverNode = (node: CascaderNode) => {
      if (nodes.isEffectivelyDisabled(node) || node.leaf) return;
      // 悬停展开：必要时先补齐懒加载子级。
      nodes.ensureChildren(node);
      expandTo(node);
    };

    const handleNodeClick = (node: CascaderNode) => {
      if (nodes.isEffectivelyDisabled(node)) return;
      if (!node.leaf) {
        nodes.ensureChildren(node);
        expandTo(node);
      }
      if (props.multiple) return;
      if (node.leaf || props.checkStrictly) {
        update(nodeValue(node));
        activeValues.value = nodes.activePathValues(node);
      }
    };

    const toggleCheck = (node: CascaderNode) => {
      if (!props.multiple || nodes.isEffectivelyDisabled(node)) return;
      const { checked, indeterminate } = nodes.checkState.value;
      const checking = !(checked.has(node) && !indeterminate.has(node));
      update(nodes.valueFromChecked(nodes.cascadeCheckedSet(checked, node, checking), nodeValue) as CascaderModelValue);
    };

    expose({
      getCheckedNodes: (leafOnly = false) =>
        Array.from(nodes.checkState.value.checked)
          .filter((node) => (leafOnly ? node.leaf : true))
          .map((node) => node.data)
    });

    return () => (
      <div class={['i-cascader-panel', props.border && 'has-border']}>
        {columns.value.map((column, columnIndex) => (
          <div class='i-cascader-panel__column' key={columnIndex} role='menu'>
            {column.map((node) => {
              const state = nodes.nodeState(node);
              const active = activeValues.value[columnIndex] === node.value;
              const disabled = nodes.isEffectivelyDisabled(node);
              return (
                <div
                  key={String(node.value)}
                  class={[
                    'i-cascader-panel__node',
                    {
                      'is-active': active,
                      'is-disabled': disabled,
                      'is-checked': state === 'checked',
                      'is-loading': !!node.loading
                    }
                  ]}
                  role='menuitemcheckbox'
                  aria-checked={props.multiple ? (state === 'indeterminate' ? 'mixed' : state === 'checked') : undefined}
                  aria-disabled={disabled || undefined}
                  onClick={() => handleNodeClick(node)}
                  onMouseenter={() => { if (props.expandTrigger === 'hover') hoverNode(node); }}>
                  {props.multiple && (
                    <input
                      class='i-cascader-panel__checkbox'
                      type='checkbox'
                      checked={state === 'checked'}
                      indeterminate={state === 'indeterminate'}
                      disabled={disabled}
                      onClick={(event: MouseEvent) => event.stopPropagation()}
                      onChange={() => toggleCheck(node)}
                    />
                  )}
                  <span class='i-cascader-panel__label'>
                    {slots.default?.({ node, data: node.data }) ?? node.label}
                  </span>
                  {!node.leaf && (
                    <span class='i-cascader-panel__arrow' aria-hidden='true'>
                      {node.loading ? '…' : '›'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
});
