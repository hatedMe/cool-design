import { computed, defineComponent, ref, watch, type Component, type PropType } from 'vue';
import type {
  TreeV2CheckedInfo,
  TreeV2Data,
  TreeV2FilterMethod,
  TreeV2InnerNode,
  TreeV2Key,
  TreeV2Node,
  TreeV2PropsMapping
} from './types';

const toPublicNode = (node: TreeV2InnerNode, withChildren = true): TreeV2Node => ({
  key: node.key,
  level: node.level,
  parent: node.parent ? toPublicNode(node.parent, false) : undefined,
  children: withChildren ? node.children.map((child) => toPublicNode(child)) : [],
  data: node.data,
  disabled: node.disabled,
  label: node.label,
  isLeaf: node.isLeaf,
  expanded: node.expanded,
  isEffectivelyChecked: node.checked
});

export default defineComponent({
  name: 'i-tree-v2',
  props: {
    data: { type: Array as PropType<TreeV2Data[]>, default: () => [] },
    emptyText: { type: String, default: '暂无数据' },
    props: Object as PropType<TreeV2PropsMapping>,
    highlightCurrent: Boolean,
    expandOnClickNode: { type: Boolean, default: true },
    checkOnClickNode: Boolean,
    checkOnClickLeaf: { type: Boolean, default: true },
    defaultExpandedKeys: { type: Array as PropType<TreeV2Key[]>, default: () => [] },
    showCheckbox: Boolean,
    checkStrictly: Boolean,
    defaultCheckedKeys: { type: Array as PropType<TreeV2Key[]>, default: () => [] },
    currentNodeKey: [String, Number] as PropType<TreeV2Key | undefined>,
    filterMethod: Function as PropType<TreeV2FilterMethod>,
    indent: { type: Number, default: 16 },
    icon: [String, Object, Function] as PropType<string | Component>,
    itemSize: { type: Number, default: 26 },
    scrollbarAlwaysOn: Boolean,
    height: { type: Number, default: 200 }
  },
  emits: ['node-click', 'node-contextmenu', 'check-change', 'check', 'current-change', 'node-expand', 'node-collapse'],
  setup(props, { emit, slots, expose }) {
    const version = ref(0);
    const nodes = ref<TreeV2InnerNode[]>([]);
    const keyMap = new Map<TreeV2Key, TreeV2InnerNode>();
    const scrollTop = ref(0);
    const currentKey = ref<TreeV2Key | undefined>(props.currentNodeKey);
    const query = ref('');

    const valueKey = computed(() => props.props?.value || 'id');
    const labelKey = computed(() => props.props?.label || 'label');
    const childrenKey = computed(() => props.props?.children || 'children');
    const disabledKey = computed(() => props.props?.disabled || 'disabled');

    const createNode = (data: TreeV2Data, parent: TreeV2InnerNode | null, level: number): TreeV2InnerNode => {
      const rawChildren = data[childrenKey.value] as TreeV2Data[] | undefined;
      const childrenData = Array.isArray(rawChildren) ? rawChildren : [];
      const node: TreeV2InnerNode = {
        key: data[valueKey.value] as TreeV2Key,
        label: String(data[labelKey.value] ?? ''),
        disabled: Boolean(data[disabledKey.value]),
        isLeaf: childrenData.length === 0,
        level,
        parent,
        children: [],
        data,
        expanded: props.defaultExpandedKeys.includes(data[valueKey.value] as TreeV2Key),
        checked: props.defaultCheckedKeys.includes(data[valueKey.value] as TreeV2Key),
        indeterminate: false,
        visible: true
      };
      node.children = childrenData.map((child) => createNode(child, node, level + 1));
      return node;
    };

    const rebuild = () => {
      keyMap.clear();
      const register = (list: TreeV2InnerNode[]) =>
        list.forEach((node) => {
          keyMap.set(node.key, node);
          register(node.children);
        });
      nodes.value = props.data.map((item) => createNode(item, null, 1));
      register(nodes.value);
      if (props.checkStrictly === false && props.defaultCheckedKeys.length) {
        nodes.value.forEach((node) => recalcUp(node));
      }
      version.value++;
    };

    const isEffectivelyDisabled = (node: TreeV2InnerNode) => {
      let cursor: TreeV2InnerNode | null = node;
      while (cursor) {
        if (cursor.disabled) return true;
        cursor = cursor.parent;
      }
      return false;
    };

    const recalcUp = (node: TreeV2InnerNode | null) => {
      let cursor = node;
      while (cursor) {
        const enabled = cursor.children.filter((child) => !child.disabled);
        const list = enabled.length ? enabled : cursor.children;
        if (list.length) {
          const checkedCount = list.filter((child) => child.checked).length;
          const hasIndeterminate = list.some((child) => child.indeterminate);
          cursor.checked = checkedCount === list.length;
          cursor.indeterminate = !cursor.checked && (checkedCount > 0 || hasIndeterminate);
        }
        cursor = cursor.parent;
      }
    };

    const cascadeDown = (node: TreeV2InnerNode, checked: boolean) => {
      node.children.forEach((child) => {
        if (child.disabled) return;
        child.checked = checked;
        child.indeterminate = false;
        cascadeDown(child, checked);
      });
    };

    watch(() => props.data, rebuild, { immediate: true });

    watch(
      () => props.currentNodeKey,
      (key) => {
        currentKey.value = key;
        version.value++;
      }
    );

    const checkedInfo = (): TreeV2CheckedInfo => {
      const checkedKeys: TreeV2Key[] = [];
      const checkedNodes: TreeV2Data[] = [];
      const halfCheckedKeys: TreeV2Key[] = [];
      const halfCheckedNodes: TreeV2Data[] = [];
      const walk = (list: TreeV2InnerNode[]) =>
        list.forEach((node) => {
          if (node.checked) {
            checkedKeys.push(node.key);
            checkedNodes.push(node.data);
          } else if (node.indeterminate) {
            halfCheckedKeys.push(node.key);
            halfCheckedNodes.push(node.data);
          }
          walk(node.children);
        });
      walk(nodes.value);
      return { checkedKeys, checkedNodes, halfCheckedKeys, halfCheckedNodes };
    };

    const applyChecked = (node: TreeV2InnerNode, checked: boolean, deep?: boolean, emitEvent = true) => {
      if (isEffectivelyDisabled(node)) return;
      node.checked = checked;
      node.indeterminate = false;
      if (!props.checkStrictly && deep !== false) cascadeDown(node, checked);
      if (!props.checkStrictly) recalcUp(node.parent);
      version.value++;
      if (emitEvent) {
        emit('check-change', node.data, checked);
        emit('check', node.data, checkedInfo());
      }
    };

    const filterRows = computed(() => {
      // 依赖 version（展开/勾选等节点内部状态）以触发重算
      const stateTick = version.value;
      const keyword = query.value;
      const matches = (node: TreeV2InnerNode): boolean => {
        const self = props.filterMethod
          ? props.filterMethod(keyword, node.data)
          : node.label.toLowerCase().includes(keyword.toLowerCase());
        const childMatch = node.children.map(matches).some(Boolean);
        node.visible = !keyword || self || childMatch;
        return node.visible && (self || childMatch);
      };
      nodes.value.forEach(matches);
      return stateTick >= 0 ? nodes.value : [];
    });

    const rows = computed<TreeV2InnerNode[]>(() => {
      const result: TreeV2InnerNode[] = [];
      const walk = (list: TreeV2InnerNode[]) =>
        list.forEach((node) => {
          if (!node.visible) return;
          result.push(node);
          if (node.expanded || query.value) walk(node.children);
        });
      walk(filterRows.value);
      return result;
    });

    const windowRows = computed(() => {
      const count = Math.ceil(props.height / props.itemSize) + 4;
      const start = Math.max(0, Math.floor(scrollTop.value / props.itemSize) - 2);
      return { start, items: rows.value.slice(start, start + count) };
    });

    const setExpanded = (node: TreeV2InnerNode, expanded: boolean) => {
      if (node.isLeaf || node.expanded === expanded) return;
      node.expanded = expanded;
      version.value++;
      emit(expanded ? 'node-expand' : 'node-collapse', node.data, toPublicNode(node));
    };

    const setCurrent = (node: TreeV2InnerNode | null) => {
      currentKey.value = node?.key;
      version.value++;
      emit('current-change', node ? node.data : null, node ? toPublicNode(node) : null);
    };

    const handleRowClick = (node: TreeV2InnerNode, event: MouseEvent) => {
      if (isEffectivelyDisabled(node)) return;
      if (props.showCheckbox && (props.checkOnClickNode || (props.checkOnClickLeaf && node.isLeaf))) {
        applyChecked(node, !node.checked || node.indeterminate);
      }
      if (!node.isLeaf && props.expandOnClickNode) setExpanded(node, !node.expanded);
      setCurrent(node);
      emit('node-click', node.data, toPublicNode(node), event);
    };

    const filter = (value: string) => {
      query.value = value;
      version.value++;
    };

    expose({
      filter,
      getCheckedNodes: (leafOnly = false) => {
        const result: TreeV2Data[] = [];
        const walk = (list: TreeV2InnerNode[]) =>
          list.forEach((node) => {
            if (node.checked && (!leafOnly || node.isLeaf)) result.push(node.data);
            walk(node.children);
          });
        walk(nodes.value);
        return result;
      },
      getCheckedKeys: (leafOnly = false) => {
        const result: TreeV2Key[] = [];
        const walk = (list: TreeV2InnerNode[]) =>
          list.forEach((node) => {
            if (node.checked && (!leafOnly || node.isLeaf)) result.push(node.key);
            walk(node.children);
          });
        walk(nodes.value);
        return result;
      },
      setCheckedKeys: (keys: TreeV2Key[]) => {
        nodes.value.forEach((node) => cascadeDown(node, false));
        keyMap.forEach((node) => {
          node.checked = false;
          node.indeterminate = false;
        });
        keys.forEach((key) => {
          const node = keyMap.get(key);
          if (node) {
            node.checked = true;
            if (!props.checkStrictly) cascadeDown(node, true);
          }
        });
        if (!props.checkStrictly) nodes.value.forEach((node) => recalcUp(node));
        version.value++;
      },
      setChecked: (key: TreeV2Key, checked: boolean, deep?: boolean) => {
        const node = keyMap.get(key);
        if (node) applyChecked(node, checked, deep);
      },
      setExpandedKeys: (keys: TreeV2Key[]) => {
        keyMap.forEach((node, nodeKey) => {
          node.expanded = keys.includes(nodeKey);
        });
        version.value++;
      },
      getHalfCheckedNodes: () => {
        const result: TreeV2Data[] = [];
        const walk = (list: TreeV2InnerNode[]) =>
          list.forEach((node) => {
            if (node.indeterminate) result.push(node.data);
            walk(node.children);
          });
        walk(nodes.value);
        return result;
      },
      getHalfCheckedKeys: () => {
        const result: TreeV2Key[] = [];
        const walk = (list: TreeV2InnerNode[]) =>
          list.forEach((node) => {
            if (node.indeterminate) result.push(node.key);
            walk(node.children);
          });
        walk(nodes.value);
        return result;
      },
      getCurrentKey: () => currentKey.value,
      getCurrentNode: () => keyMap.get(currentKey.value ?? '')?.data ?? null,
      setCurrentKey: (key: TreeV2Key) => setCurrent(keyMap.get(key) ?? null),
      getNode: (target: TreeV2Key | TreeV2Data) => {
        const key = typeof target === 'object' ? (target[valueKey.value] as TreeV2Key) : target;
        const node = keyMap.get(key);
        return node ? toPublicNode(node) : null;
      },
      expandNode: (node: TreeV2Node) => {
        const target = keyMap.get(node.key);
        if (target) setExpanded(target, true);
      },
      collapseNode: (node: TreeV2Node) => {
        const target = keyMap.get(node.key);
        if (target) setExpanded(target, false);
      },
      scrollTo: (offset: number) => {
        scrollTop.value = offset;
      },
      scrollToNode: (key: TreeV2Key) => {
        const index = rows.value.findIndex((node) => node.key === key);
        if (index >= 0) scrollTop.value = index * props.itemSize;
      }
    });

    return () => (
      <div
        class={['i-tree-v2', props.scrollbarAlwaysOn && 'has-scrollbar']}
        role='tree'
        aria-multiselectable={props.showCheckbox ? 'true' : undefined}>
        {rows.value.length === 0 && <div class='i-tree-v2__empty'>{slots.empty?.() ?? props.emptyText}</div>}
        {rows.value.length > 0 && (
          <div
            class='i-tree-v2__list'
            style={{ height: `${props.height}px`, overflow: 'auto' }}
            onScroll={(event: Event) => {
              scrollTop.value = (event.target as HTMLElement).scrollTop;
            }}>
            <div style={{ height: `${rows.value.length * props.itemSize}px`, position: 'relative' }}>
              <div style={{ transform: `translateY(${windowRows.value.start * props.itemSize}px)` }}>
                {windowRows.value.items.map((node) => {
                  const disabled = isEffectivelyDisabled(node);
                  return (
                    <div
                      key={String(node.key)}
                      role='treeitem'
                      aria-expanded={node.isLeaf ? undefined : node.expanded}
                      aria-checked={props.showCheckbox ? (node.indeterminate ? 'mixed' : node.checked) : undefined}
                      aria-selected={currentKey.value === node.key}
                      aria-disabled={disabled || undefined}
                      style={{ height: `${props.itemSize}px` }}
                      class={[
                        'i-tree-v2__row',
                        typeof props.props?.class === 'function'
                          ? props.props.class(node.data, toPublicNode(node))
                          : props.props?.class,
                        {
                          'is-current': props.highlightCurrent && currentKey.value === node.key,
                          'is-disabled': disabled
                        }
                      ]}
                      onClick={(event: MouseEvent) => handleRowClick(node, event)}
                      onContextmenu={(event: MouseEvent) => emit('node-contextmenu', event, node.data, toPublicNode(node))}>
                      <span style={{ width: `${(node.level - 1) * props.indent}px`, flex: '0 0 auto' }} />
                      {node.isLeaf ? (
                        <span class='i-tree-v2__leaf' aria-hidden='true' />
                      ) : (
                        <button
                          type='button'
                          class={['i-tree-v2__expand', node.expanded && 'is-expanded']}
                          aria-label={node.expanded ? '收起' : '展开'}
                          onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                            setExpanded(node, !node.expanded);
                          }}>
                          {typeof props.icon === 'string' ? <i class={props.icon} aria-hidden='true' /> : '›'}
                        </button>
                      )}
                      {props.showCheckbox && (
                        <input
                          class='i-tree-v2__checkbox'
                          type='checkbox'
                          checked={node.checked}
                          disabled={disabled}
                          ref={(element) => {
                            if (element instanceof HTMLInputElement) element.indeterminate = node.indeterminate;
                          }}
                          aria-label={node.label}
                          onClick={(event: MouseEvent) => event.stopPropagation()}
                          onChange={(event: Event) =>
                            applyChecked(node, (event.target as HTMLInputElement).checked)
                          }
                        />
                      )}
                      <span class='i-tree-v2__label'>{slots.default?.({ node: toPublicNode(node) }) ?? node.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
});
