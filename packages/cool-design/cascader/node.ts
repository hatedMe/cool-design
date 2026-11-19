import { computed, reactive } from 'vue';
import type {
  CascaderItemValue,
  CascaderLazyLoad,
  CascaderModelValue,
  CascaderNode,
  CascaderNodeValue,
  CascaderOption,
  CascaderPropsMapping
} from './types';

export type NodeState = 'checked' | 'indeterminate' | 'unchecked';

export interface CascaderNodeSource {
  options: () => CascaderOption[];
  mapping: () => CascaderPropsMapping | undefined;
  model: () => CascaderModelValue;
  multiple: () => boolean;
  checkStrictly: () => boolean;
  /** 组件级整体禁用（如禁用的输入态） */
  disabled?: () => boolean;
  lazy: () => boolean;
  lazyLoad: () => CascaderLazyLoad | undefined;
  /** 根层级起始序号：级联选择为 1，独立面板为 0 */
  rootLevel: number;
}

/**
 * 级联节点共享逻辑：字段映射、建树、路径解析、勾选级联与半选计算、
 * 菜单展开列、懒加载子级注入。级联选择与独立面板共用，避免实现漂移。
 */
export function useCascaderNodes(source: CascaderNodeSource) {
  // 懒加载完成的子级按源数据对象缓存；loading 防止重复发起。
  const lazyChildren = reactive(new Map<CascaderOption, CascaderOption[]>());
  const loadingData = reactive(new Set<CascaderOption>());

  const labelKey = computed(() => source.mapping()?.label || 'label');
  const valueKey = computed(() => source.mapping()?.value || 'value');
  const childrenKey = computed(() => source.mapping()?.children || 'children');
  const disabledKey = computed(() => source.mapping()?.disabled || 'disabled');
  const leafKey = computed(() => source.mapping()?.leaf || 'leaf');

  const createNode = (data: CascaderOption, parent: CascaderNode | null): CascaderNode => {
    const rawChildren = data[childrenKey.value] as CascaderOption[] | undefined;
    // 声明了子级用声明值；否则取懒加载结果。
    const childrenData = Array.isArray(rawChildren) ? rawChildren : (lazyChildren.get(data) ?? []);
    const rawLeaf = data[leafKey.value];
    const node: CascaderNode = {
      value: (data[valueKey.value] ?? '') as CascaderNodeValue,
      label: String(data[labelKey.value] ?? ''),
      disabled: Boolean(data[disabledKey.value]),
      // 懒加载模式下：未加载的节点视为待展开；加载完成后无子级即叶子。
      leaf:
        rawLeaf === undefined
          ? source.lazy()
            ? lazyChildren.has(data) && childrenData.length === 0
            : childrenData.length === 0
          : Boolean(rawLeaf),
      loading: loadingData.has(data),
      loaded: lazyChildren.has(data),
      level: parent ? parent.level + 1 : source.rootLevel,
      data,
      parent,
      children: [],
      path: []
    };
    node.path = parent ? [...parent.path, node] : [node];
    node.children = childrenData.map((child) => createNode(child, node));
    return node;
  };

  const trees = computed(() => source.options().map((option) => createNode(option, null)));
  const nodeByValue = computed(() => {
    const map = new Map<CascaderNodeValue, CascaderNode>();
    const walk = (list: CascaderNode[]) =>
      list.forEach((node) => {
        if (node.value !== undefined && node.value !== null && !map.has(node.value)) map.set(node.value, node);
        walk(node.children);
      });
    walk(trees.value);
    return map;
  });

  const resolveNode = (item: CascaderItemValue): CascaderNode | null => {
    if (Array.isArray(item)) {
      // 路径值逐层下钻，首层只匹配根节点。
      let list = trees.value;
      let node: CascaderNode | null = null;
      for (const value of item) {
        node = list.find((candidate) => candidate.value === value) ?? null;
        if (!node) return null;
        list = node.children;
      }
      return node;
    }
    return nodeByValue.value.get(item) ?? null;
  };

  const modelItems = computed<CascaderItemValue[]>(() => {
    const value = source.model();
    if (value === null || value === undefined) return [];
    if (source.multiple()) return (Array.isArray(value) ? value : [value]) as CascaderItemValue[];
    return [value as CascaderItemValue];
  });

  const selectedNodes = computed(() =>
    modelItems.value.map(resolveNode).filter((node): node is CascaderNode => !!node)
  );

  const isEffectivelyDisabled = (node: CascaderNode): boolean => {
    if (source.disabled?.()) return true;
    let cursor: CascaderNode | null = node;
    while (cursor) {
      if (cursor.disabled) return true;
      cursor = cursor.parent;
    }
    return false;
  };

  const checkState = computed<{ checked: Set<CascaderNode>; indeterminate: Set<CascaderNode> }>(() => {
    const checked = new Set<CascaderNode>();
    const indeterminate = new Set<CascaderNode>();
    if (!source.multiple()) return { checked, indeterminate };
    const add = (node: CascaderNode, isRoot: boolean) => {
      if (node.disabled && !isRoot) return;
      checked.add(node);
      node.children.forEach((child) => add(child, false));
    };
    selectedNodes.value.forEach((node) => add(node, true));
    if (source.checkStrictly()) return { checked, indeterminate };
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

  const valueFromChecked = (set: Set<CascaderNode>, nodeValue: (node: CascaderNode) => CascaderItemValue): CascaderItemValue[] => {
    const result: CascaderItemValue[] = [];
    const walk = (list: CascaderNode[]) =>
      list.forEach((node) => {
        if (source.checkStrictly()) {
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

  const columns = (activeValues: CascaderNodeValue[]): CascaderNode[][] => {
    const result: CascaderNode[][] = [trees.value];
    let list = trees.value;
    for (const value of activeValues) {
      const node = list.find((candidate) => candidate.value === value);
      if (!node || node.children.length === 0) break;
      list = node.children;
      result.push(list);
    }
    return result;
  };

  const activePathValues = (node: CascaderNode): CascaderNodeValue[] =>
    // 叶子展开到其父级；非叶子展开到自身（懒加载节点子级就绪后即出现下一列）。
    (node.leaf ? node.path.slice(0, -1) : node.path).map((item) => item.value);

  // 以既有勾选集为基础重算级联勾选与父级状态。
  const recalcChecked = (set: Set<CascaderNode>) => {
    const recalc = (target: CascaderNode) => {
      target.children.forEach(recalc);
      if (target.children.length === 0) return;
      const enabled = target.children.filter((child) => !child.disabled);
      const list = enabled.length ? enabled : target.children;
      if (list.every((child) => set.has(child))) set.add(target);
      else set.delete(target);
    };
    trees.value.forEach(recalc);
  };

  /** 勾选/取消勾选一个节点并级联子级，返回新的勾选集 */
  const cascadeCheckedSet = (base: Set<CascaderNode>, node: CascaderNode, checking: boolean): Set<CascaderNode> => {
    const next = new Set(base);
    const apply = (target: CascaderNode, value: boolean) => {
      if (target.disabled && target !== node) return;
      if (value) next.add(target);
      else next.delete(target);
      target.children.forEach((child) => apply(child, value));
    };
    if (source.checkStrictly()) {
      if (checking) next.add(node);
      else next.delete(node);
    } else {
      apply(node, checking);
      recalcChecked(next);
    }
    return next;
  };

  /** 移除一个节点及其后代的勾选，返回新的勾选集 */
  const pruneCheckedSet = (base: Set<CascaderNode>, node: CascaderNode): Set<CascaderNode> => {
    const next = new Set(base);
    if (source.checkStrictly()) {
      next.delete(node);
    } else {
      const remove = (target: CascaderNode) => {
        next.delete(target);
        target.children.forEach(remove);
      };
      remove(node);
      recalcChecked(next);
    }
    return next;
  };

  /** 展开前确保子级就绪；发起懒加载时返回 true。 */
  const ensureChildren = (node: CascaderNode): boolean => {
    if (!source.lazy() || node.leaf || lazyChildren.has(node.data) || loadingData.has(node.data)) return false;
    const lazyLoad = source.lazyLoad();
    if (!lazyLoad) return false;
    loadingData.add(node.data);
    let settled = false;
    lazyLoad({ level: node.level, value: node.value, data: node.data }, (children) => {
      if (settled) return;
      settled = true;
      loadingData.delete(node.data);
      lazyChildren.set(node.data, Array.isArray(children) ? children : []);
    });
    return true;
  };

  return {
    labelKey,
    valueKey,
    childrenKey,
    disabledKey,
    leafKey,
    trees,
    nodeByValue,
    resolveNode,
    modelItems,
    selectedNodes,
    isEffectivelyDisabled,
    checkState,
    nodeState,
    valueFromChecked,
    columns,
    activePathValues,
    cascadeCheckedSet,
    pruneCheckedSet,
    ensureChildren
  };
}

export type CascaderNodesApi = ReturnType<typeof useCascaderNodes>;
