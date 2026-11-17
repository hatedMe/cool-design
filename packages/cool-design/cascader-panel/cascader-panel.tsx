import { computed, defineComponent, ref, type PropType } from 'vue';
import type {
  CascaderItemValue,
  CascaderModelValue,
  CascaderNode,
  CascaderNodeValue,
  CascaderOption,
  CascaderPropsMapping
} from '../cascader/types';

type NodeState = 'checked' | 'indeterminate' | 'unchecked';

export default defineComponent({
  name: 'i-cascader-panel',
  props: {
    modelValue: [String, Number, Array] as PropType<CascaderModelValue>,
    options: { type: Array as PropType<CascaderOption[]>, default: () => [] },
    props: Object as PropType<CascaderPropsMapping>,
    emitPath: { type: Boolean, default: true },
    multiple: Boolean,
    checkStrictly: Boolean,
    border: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'expand-change'],
  setup(props, { emit, slots, expose }) {
    const activeValues = ref<CascaderNodeValue[]>([]);

    const labelKey = computed(() => props.props?.label || 'label');
    const valueKey = computed(() => props.props?.value || 'value');
    const childrenKey = computed(() => props.props?.children || 'children');
    const disabledKey = computed(() => props.props?.disabled || 'disabled');
    const leafKey = computed(() => props.props?.leaf || 'leaf');

    const createNode = (data: CascaderOption, parent: CascaderNode | null): CascaderNode => {
      const rawChildren = data[childrenKey.value] as CascaderOption[] | undefined;
      const childrenData = Array.isArray(rawChildren) ? rawChildren : [];
      const rawLeaf = data[leafKey.value];
      const node: CascaderNode = {
        value: (data[valueKey.value] ?? '') as CascaderNodeValue,
        label: String(data[labelKey.value] ?? ''),
        disabled: Boolean(data[disabledKey.value]),
        leaf: rawLeaf === undefined ? childrenData.length === 0 : Boolean(rawLeaf),
        level: parent ? parent.level + 1 : 0,
        data,
        parent,
        children: [],
        path: []
      };
      node.path = parent ? [...parent.path, node] : [node];
      node.children = childrenData.map((child) => createNode(child, node));
      return node;
    };

    const trees = computed(() => props.options.map((option) => createNode(option, null)));
    const nodeByValue = computed(() => {
      const map = new Map<CascaderNodeValue, CascaderNode>();
      const walk = (list: CascaderNode[]) =>
        list.forEach((node) => {
          map.set(node.value, node);
          walk(node.children);
        });
      walk(trees.value);
      return map;
    });

    const resolveNode = (item: CascaderItemValue): CascaderNode | null => {
      if (Array.isArray(item)) {
        let node: CascaderNode | undefined;
        for (const value of item) {
          node = node ? node.children.find((child) => child.value === value) : nodeByValue.value.get(value);
          if (!node) return null;
        }
        return node ?? null;
      }
      return nodeByValue.value.get(item) ?? null;
    };

    const modelItems = computed<CascaderItemValue[]>(() => {
      const value = props.modelValue;
      if (value === null || value === undefined) return [];
      if (props.multiple) return (Array.isArray(value) ? value : [value]) as CascaderItemValue[];
      return [value as CascaderItemValue];
    });
    const selectedNodes = computed(() =>
      modelItems.value.map(resolveNode).filter((node): node is CascaderNode => !!node)
    );

    const isEffectivelyDisabled = (node: CascaderNode): boolean => {
      let cursor: CascaderNode | null = node;
      while (cursor) {
        if (cursor.disabled) return true;
        cursor = cursor.parent;
      }
      return false;
    };

    const checkState = computed(() => {
      const checked = new Set<CascaderNode>();
      const indeterminate = new Set<CascaderNode>();
      if (!props.multiple) return { checked, indeterminate };
      const add = (node: CascaderNode, isRoot: boolean) => {
        if (node.disabled && !isRoot) return;
        checked.add(node);
        node.children.forEach((child) => add(child, false));
      };
      selectedNodes.value.forEach((node) => add(node, true));
      if (props.checkStrictly) return { checked, indeterminate };
      const recalc = (node: CascaderNode) => {
        node.children.forEach(recalc);
        if (node.children.length === 0) return;
        const enabled = node.children.filter((child) => !child.disabled);
        const list = enabled.length ? enabled : node.children;
        if (list.every((child) => checked.has(child))) {
          checked.add(node);
          indeterminate.delete(node);
        } else {
          checked.delete(node);
          if (list.some((child) => checked.has(child) || indeterminate.has(child))) indeterminate.add(node);
          else indeterminate.delete(node);
        }
      };
      trees.value.forEach(recalc);
      return { checked, indeterminate };
    });

    const nodeState = (node: CascaderNode): NodeState => {
      if (checkState.value.checked.has(node)) return 'checked';
      if (checkState.value.indeterminate.has(node)) return 'indeterminate';
      return 'unchecked';
    };

    const nodeValue = (node: CascaderNode): CascaderItemValue =>
      props.emitPath ? node.path.map((item) => item.value) : node.value;

    const valueFromChecked = (set: Set<CascaderNode>): CascaderItemValue[] => {
      const result: CascaderItemValue[] = [];
      const walk = (list: CascaderNode[]) =>
        list.forEach((node) => {
          if (props.checkStrictly) {
            if (set.has(node)) result.push(nodeValue(node));
            walk(node.children);
          } else if (node.leaf) {
            if (set.has(node)) result.push(nodeValue(node));
          } else {
            walk(node.children);
          }
        });
      walk(trees.value);
      return result;
    };

    const columns = computed<CascaderNode[][]>(() => {
      const result: CascaderNode[][] = [trees.value];
      let list = trees.value;
      for (const value of activeValues.value) {
        const node = list.find((candidate) => candidate.value === value);
        if (!node || node.children.length === 0) break;
        list = node.children;
        result.push(list);
      }
      return result;
    });

    const activePathValues = (node: CascaderNode): CascaderNodeValue[] =>
      (node.children.length ? node.path : node.path.slice(0, -1)).map((item) => item.value);

    const expandTo = (node: CascaderNode) => {
      const values = activePathValues(node);
      if (values.join(' ') === activeValues.value.join(' ')) return;
      activeValues.value = values;
      emit('expand-change', [...activeValues.value]);
    };

    const update = (value: CascaderModelValue) => {
      emit('update:modelValue', value);
      emit('change', value);
    };

    const handleNodeClick = (node: CascaderNode) => {
      if (isEffectivelyDisabled(node)) return;
      if (!node.leaf) expandTo(node);
      if (props.multiple) return;
      if (node.leaf || props.checkStrictly) {
        update(nodeValue(node));
        activeValues.value = activePathValues(node);
      }
    };

    const toggleCheck = (node: CascaderNode) => {
      if (!props.multiple || isEffectivelyDisabled(node)) return;
      const { checked, indeterminate } = checkState.value;
      const checking = !(checked.has(node) && !indeterminate.has(node));
      const next = new Set(checked);
      const apply = (target: CascaderNode, value: boolean) => {
        if (target.disabled && target !== node) return;
        if (value) next.add(target);
        else next.delete(target);
        target.children.forEach((child) => apply(child, value));
      };
      if (props.checkStrictly) {
        if (checking) next.add(node);
        else next.delete(node);
      } else {
        apply(node, checking);
        const recalc = (target: CascaderNode) => {
          target.children.forEach(recalc);
          if (target.children.length === 0) return;
          const enabled = target.children.filter((child) => !child.disabled);
          const list = enabled.length ? enabled : target.children;
          if (list.every((child) => next.has(child))) next.add(target);
          else next.delete(target);
        };
        trees.value.forEach(recalc);
      }
      update(valueFromChecked(next));
    };

    expose({
      getCheckedNodes: (leafOnly = false) =>
        Array.from(checkState.value.checked)
          .filter((node) => (leafOnly ? node.leaf : true))
          .map((node) => node.data)
    });

    return () => (
      <div class={['i-cascader-panel', props.border && 'has-border']}>
        {columns.value.map((column, columnIndex) => (
          <div class='i-cascader-panel__column' key={columnIndex} role='menu'>
            {column.map((node) => {
              const state = nodeState(node);
              const active = activeValues.value[columnIndex] === node.value;
              const disabled = isEffectivelyDisabled(node);
              return (
                <div
                  key={String(node.value)}
                  class={[
                    'i-cascader-panel__node',
                    { 'is-active': active, 'is-disabled': disabled, 'is-checked': state === 'checked' }
                  ]}
                  role='menuitemcheckbox'
                  aria-checked={props.multiple ? (state === 'indeterminate' ? 'mixed' : state === 'checked') : undefined}
                  aria-disabled={disabled || undefined}
                  onClick={() => handleNodeClick(node)}>
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
                  {!node.leaf && <span class='i-cascader-panel__arrow' aria-hidden='true'>›</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
});
