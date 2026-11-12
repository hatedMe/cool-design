import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onMounted,
  ref,
  reactive,
  toRaw,
  type Component,
  watch,
  type PropType
} from 'vue';
import { createNamespace } from '../../../src/utils/create';
import type {
  TreeAllowDrag,
  TreeAllowDrop,
  TreeCheckedInfo,
  TreeData,
  TreeDropType,
  TreeExposed,
  TreeFilterMethod,
  TreeKey,
  TreeLoadFunction,
  TreeNode,
  TreeNodeParam,
  TreePropsMapping,
  TreeRenderContent
} from './types';

const [name, bem] = createNamespace('tree');

type InnerNode = TreeNode;

const isTreeNodeShape = (value: unknown): value is InnerNode => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return 'data' in candidate && 'level' in candidate && 'children' in candidate && 'uid' in candidate;
};

export default defineComponent({
  name,
  props: {
    data: { type: Array as PropType<TreeData[]>, default: () => [] },
    nodeKey: { type: String, default: 'id' },
    props: { type: Object as PropType<TreePropsMapping>, default: () => ({}) },
    defaultExpandAll: Boolean,
    defaultExpandedKeys: { type: Array as PropType<TreeKey[]>, default: () => [] },
    autoExpandParent: { type: Boolean, default: true },
    expandOnClickNode: { type: Boolean, default: true },
    checkOnClickNode: Boolean,
    accordion: Boolean,
    indent: { type: Number, default: 18 },
    icon: { type: [String, Object, Function] as PropType<string | Component>, default: '' },
    showCheckbox: Boolean,
    checkStrictly: Boolean,
    checkOnClickLeaf: { type: Boolean, default: true },
    checkDescendants: Boolean,
    defaultCheckedKeys: { type: Array as PropType<TreeKey[]>, default: () => [] },
    defaultCurrentKey: { type: [String, Number] as PropType<TreeKey | undefined>, default: undefined },
    currentNodeKey: { type: [String, Number] as PropType<TreeKey | null>, default: null },
    highlightCurrent: Boolean,
    filterNodeMethod: Function as PropType<TreeFilterMethod>,
    filterable: Boolean,
    filterPlaceholder: { type: String, default: '请输入关键字进行过滤' },
    lazy: Boolean,
    load: Function as PropType<TreeLoadFunction>,
    draggable: Boolean,
    allowDrag: Function as PropType<TreeAllowDrag>,
    allowDrop: Function as PropType<TreeAllowDrop>,
    disabled: Boolean,
    emptyText: { type: String, default: '暂无数据' },
    renderAfterExpand: { type: Boolean, default: true },
    renderContent: Function as PropType<TreeRenderContent>
  },
  emits: [
    'node-click',
    'node-contextmenu',
    'check-change',
    'check',
    'current-change',
    'node-expand',
    'node-collapse',
    'node-drag-start',
    'node-drag-enter',
    'node-drag-leave',
    'node-drag-over',
    'node-drag-end',
    'node-drop'
  ],
  setup(props, { emit, slots, expose }) {
    const instance = getCurrentInstance();
    const proxy = instance?.proxy;
    const rootNodes = ref<InnerNode[]>([]);
    const currentNode = ref<InnerNode | null>(null);
    const filterQuery = ref('');
    const draggingNode = ref<InnerNode | null>(null);
    const dropNode = ref<InnerNode | null>(null);
    const dropType = ref<TreeDropType | null>(null);
    const keyMap = new Map<TreeKey, InnerNode>();
    const dataMap = new WeakMap<object, InnerNode>();
    let uidSeed = 0;

    const labelKey = computed(() =>
      typeof props.props?.label === 'string' ? (props.props.label as string) : 'label'
    );
    const childrenKey = computed(() => props.props?.children || 'children');
    const disabledKey = computed(() =>
      typeof props.props?.disabled === 'string' ? (props.props.disabled as string) : 'disabled'
    );
    const isLeafKey = computed(() =>
      typeof props.props?.isLeaf === 'string' ? (props.props.isLeaf as string) : 'isLeaf'
    );
    const getNodeClass = (data: TreeData, node: InnerNode): string | Record<string, boolean> | undefined => {
      const className = props.props?.class;
      return typeof className === 'function' ? className(data, node) : className;
    };

    const getLabel = (data: TreeData, node: InnerNode | null): string => {
      const label = props.props?.label;
      if (typeof label === 'function') return String(label(data, node as InnerNode) ?? '');
      return String(data[labelKey.value] ?? '');
    };
    const getChildrenData = (data: TreeData): TreeData[] => {
      const children = data[childrenKey.value] as TreeData[] | undefined;
      return Array.isArray(children) ? children : [];
    };
    const getDisabled = (data: TreeData, node: InnerNode | null): boolean => {
      const disabled = props.props?.disabled;
      if (typeof disabled === 'function') return Boolean(disabled(data, node as InnerNode));
      return Boolean(data[disabledKey.value]);
    };
    const getIsLeafRaw = (data: TreeData, node: InnerNode | null): boolean | undefined => {
      const isLeaf = props.props?.isLeaf;
      if (typeof isLeaf === 'function') return Boolean(isLeaf(data, node as InnerNode));
      const raw = data[isLeafKey.value] as unknown;
      if (raw === undefined) return undefined;
      return Boolean(raw);
    };

    const eachNode = (fn: (node: InnerNode) => void, nodes: InnerNode[] = rootNodes.value): void => {
      nodes.forEach((node) => {
        fn(node);
        if (node.children.length) eachNode(fn, node.children);
      });
    };

    const unregisterSubtree = (node: InnerNode): void => {
      if (node.key !== null && node.key !== undefined) keyMap.delete(node.key);
      if (node.data && typeof node.data === 'object') dataMap.delete(node.data as object);
      node.children.forEach(unregisterSubtree);
      if (currentNode.value === node) currentNode.value = null;
    };

    const createNode = (data: TreeData, parent: InnerNode | null, level: number): InnerNode => {
      const key =
        props.nodeKey && data && typeof data === 'object' && (data as Record<string, unknown>)[props.nodeKey] !== undefined
          ? ((data as Record<string, unknown>)[props.nodeKey] as TreeKey)
          : null;
      const node = reactive({
        uid: (uidSeed += 1),
        key,
        data,
        parent,
        children: [] as InnerNode[],
        level,
        label: '',
        disabled: false,
        isLeaf: true,
        loaded: true,
        loading: false,
        expanded: false,
        everExpanded: false,
        checked: false,
        indeterminate: false,
        visible: true,
        isCurrent: false
      }) as InnerNode;
      node.label = getLabel(data, node);
      node.disabled = getDisabled(data, node);
      const rawLeaf = getIsLeafRaw(data, node);
      const childrenData = getChildrenData(data);
      if (rawLeaf === true) {
        node.isLeaf = true;
        node.loaded = true;
      } else if (childrenData.length > 0) {
        node.isLeaf = false;
        node.loaded = true;
      } else if (props.lazy) {
        node.isLeaf = false;
        node.loaded = false;
      } else {
        node.isLeaf = true;
        node.loaded = true;
      }
      if (key !== null && key !== undefined) keyMap.set(key, node);
      if (data && typeof data === 'object') dataMap.set(data as object, node);
      childrenData.forEach((child) => {
        node.children.push(createNode(child, node, level + 1));
      });
      return node;
    };

    const setChildrenData = (node: InnerNode | null, childrenData: TreeData[]): void => {
      if (node) {
        node.children.forEach(unregisterSubtree);
        node.children = childrenData.map((child) => createNode(child, node, node.level + 1));
        (node.data as Record<string, unknown>)[childrenKey.value] = childrenData;
        const rawLeaf = getIsLeafRaw(node.data, node);
        node.isLeaf = rawLeaf === true ? true : node.children.length === 0 ? (props.lazy ? false : true) : false;
        if (node.children.length > 0) node.loaded = true;
      } else {
        rootNodes.value.forEach(unregisterSubtree);
        rootNodes.value = childrenData.map((child) => createNode(child, null, 1));
      }
    };

    const isEffectivelyDisabled = (node: InnerNode): boolean => {
      if (props.disabled) return true;
      let cursor: InnerNode | null = node;
      while (cursor) {
        if (cursor.disabled) return true;
        cursor = cursor.parent;
      }
      return false;
    };

    const isDescendantOf = (ancestor: InnerNode, node: InnerNode | null): boolean => {
      let cursor = node?.parent ?? null;
      while (cursor) {
        if (cursor === ancestor) return true;
        cursor = cursor.parent;
      }
      return false;
    };

    const resolveNode = (param: TreeNodeParam | null | undefined): InnerNode | null => {
      if (param === null || param === undefined) return null;
      if (isTreeNodeShape(param)) {
        if (param.key !== null && param.key !== undefined) return keyMap.get(param.key) ?? param;
        return param;
      }
      if (typeof param === 'string' || typeof param === 'number') return keyMap.get(param) ?? null;
      const rawParam = param as Record<string, unknown>;
      if (props.nodeKey && rawParam[props.nodeKey] !== undefined) {
        const byKey = keyMap.get(rawParam[props.nodeKey] as TreeKey);
        if (byKey) return byKey;
      }
      const mapped = dataMap.get(param as object);
      if (mapped) return mapped;
      const rawTarget = toRaw(param as object);
      let found: InnerNode | null = null;
      eachNode((node) => {
        if (!found && (node.data === param || toRaw(node.data as object) === rawTarget)) found = node;
      });
      return found;
    };

    const expandAncestors = (node: InnerNode): void => {
      let cursor = node.parent;
      while (cursor) {
        cursor.expanded = true;
        cursor.everExpanded = true;
        cursor = cursor.parent;
      }
    };

    const checkedInfo = (): TreeCheckedInfo => {
      const checkedNodes: TreeData[] = [];
      const checkedKeys: TreeKey[] = [];
      const halfCheckedNodes: TreeData[] = [];
      const halfCheckedKeys: TreeKey[] = [];
      eachNode((node) => {
        if (node.checked) {
          checkedNodes.push(node.data);
          if (node.key !== null && node.key !== undefined) checkedKeys.push(node.key);
        } else if (node.indeterminate) {
          halfCheckedNodes.push(node.data);
          if (node.key !== null && node.key !== undefined) halfCheckedKeys.push(node.key);
        }
      });
      return { checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKeys };
    };

    const emitCheck = (node: InnerNode): void => {
      const info = checkedInfo();
      emit('check', node.data, info);
    };

    const cascadeDown = (node: InnerNode, checked: boolean, changed: InnerNode[]): void => {
      node.children.forEach((child) => {
        if (isEffectivelyDisabled(child)) return;
        if (child.checked !== checked || child.indeterminate) {
          child.checked = checked;
          child.indeterminate = false;
          changed.push(child);
        }
        cascadeDown(child, checked, changed);
      });
    };

    const recalcUp = (node: InnerNode | null, changed: InnerNode[]): void => {
      let cursor = node;
      while (cursor) {
        const enabled = cursor.children.filter((child) => !isEffectivelyDisabled(child));
        if (enabled.length > 0) {
          const checkedCount = enabled.filter((child) => child.checked).length;
          const hasIndeterminate = enabled.some((child) => child.indeterminate);
          const nextChecked = checkedCount === enabled.length;
          const nextIndeterminate = !nextChecked && (checkedCount > 0 || hasIndeterminate);
          if (cursor.checked !== nextChecked || cursor.indeterminate !== nextIndeterminate) {
            cursor.checked = nextChecked;
            cursor.indeterminate = nextIndeterminate;
            changed.push(cursor);
          }
        }
        cursor = cursor.parent;
      }
    };

    const applyChecked = (
      node: InnerNode,
      checked: boolean,
      deep: boolean | undefined,
      emitEvent: boolean
    ): void => {
      const changed: InnerNode[] = [];
      const shouldDeep = deep === undefined ? !props.checkStrictly : deep;
      if (props.checkStrictly && !props.checkDescendants && !shouldDeep) {
        if (node.checked !== checked || node.indeterminate) {
          node.checked = checked;
          node.indeterminate = false;
          changed.push(node);
        }
      } else if (props.checkStrictly && (props.checkDescendants || shouldDeep)) {
        if (node.checked !== checked || node.indeterminate) {
          node.checked = checked;
          node.indeterminate = false;
          changed.push(node);
        }
        if (shouldDeep) cascadeDown(node, checked, changed);
      } else {
        if (node.checked !== checked || node.indeterminate) {
          node.checked = checked;
          node.indeterminate = false;
          changed.push(node);
        }
        if (shouldDeep) cascadeDown(node, checked, changed);
        recalcUp(node.parent, changed);
      }
      if (emitEvent) {
        changed.forEach((item) => emit('check-change', item.data, item.checked, item.indeterminate));
        emitCheck(node);
      }
    };

    const doExpand = (node: InnerNode, expand: boolean, emitEvent: boolean): void => {
      if (node.isLeaf) return;
      if (node.expanded === expand) return;
      if (!expand) {
        node.expanded = false;
        if (emitEvent) emit('node-collapse', node.data, node, proxy);
        return;
      }
      if (props.accordion) {
        const siblings = node.parent ? node.parent.children : rootNodes.value;
        siblings.forEach((sibling) => {
          if (sibling !== node && sibling.expanded) {
            sibling.expanded = false;
            if (emitEvent) emit('node-collapse', sibling.data, sibling, proxy);
          }
        });
      }
      if (props.lazy && !node.loaded && !node.loading) {
        node.loading = true;
        const resolve = (children: TreeData[]): void => {
          node.loading = false;
          node.loaded = true;
          setChildrenData(node, Array.isArray(children) ? children : []);
          if (node.checked && !props.checkStrictly) {
            const changed: InnerNode[] = [];
            cascadeDown(node, true, changed);
          }
          node.expanded = true;
          node.everExpanded = true;
          applyFilter(filterQuery.value, false);
          if (emitEvent) emit('node-expand', node.data, node, proxy);
        };
        const reject = (): void => {
          node.loading = false;
          node.expanded = false;
        };
        if (props.load) {
          const result = props.load(node, resolve, reject) as unknown;
          if (Array.isArray(result)) resolve(result as TreeData[]);
          else if (result && typeof (result as Promise<TreeData[]>).then === 'function') {
            (result as Promise<TreeData[]>).then((list) => resolve(Array.isArray(list) ? list : [])).catch(reject);
          }
        } else {
          resolve([]);
        }
        return;
      }
      node.expanded = true;
      node.everExpanded = true;
      if (emitEvent) emit('node-expand', node.data, node, proxy);
    };

    const toggleExpand = (node: InnerNode): void => {
      doExpand(node, !node.expanded, true);
    };

    const setCurrent = (node: InnerNode | null, shouldAutoExpandParent = true, emitEvent = true): void => {
      if (currentNode.value === node) return;
      if (currentNode.value) currentNode.value.isCurrent = false;
      currentNode.value = node;
      if (node) {
        node.isCurrent = true;
        if (shouldAutoExpandParent && props.autoExpandParent) expandAncestors(node);
        if (emitEvent) emit('current-change', node.data, node);
      } else if (emitEvent) {
        emit('current-change', null, null);
      }
    };

    const matchNode = (value: string, node: InnerNode): boolean => {
      if (!value) return true;
      if (props.filterNodeMethod) return Boolean(props.filterNodeMethod(value, node.data, node));
      return node.label.includes(value);
    };

    const markSubtreeVisible = (node: InnerNode): void => {
      node.visible = true;
      node.children.forEach(markSubtreeVisible);
    };

    const calcVisible = (node: InnerNode, value: string): boolean => {
      if (!value) {
        node.visible = true;
        node.children.forEach((child) => calcVisible(child, value));
        return true;
      }
      const matched = matchNode(value, node);
      if (matched) {
        markSubtreeVisible(node);
        return true;
      }
      let childVisible = false;
      node.children.forEach((child) => {
        if (calcVisible(child, value)) childVisible = true;
      });
      node.visible = childVisible;
      return node.visible;
    };

    const applyFilter = (value: string, autoExpand = true): void => {
      rootNodes.value.forEach((node) => calcVisible(node, value));
      if (value && autoExpand) {
        eachNode((node) => {
          if (node.visible && node.children.some((child) => child.visible) && !node.isLeaf) {
            node.expanded = true;
            node.everExpanded = true;
          }
        });
      }
    };

    const canDrag = (node: InnerNode): boolean => {
      if (!props.draggable || props.disabled || isEffectivelyDisabled(node)) return false;
      if (props.allowDrag) return Boolean(props.allowDrag(node));
      return true;
    };

    const canDrop = (drag: InnerNode, drop: InnerNode, type: TreeDropType): boolean => {
      if (drag === drop || isDescendantOf(drag, drop)) return false;
      if (props.allowDrop) return Boolean(props.allowDrop(drag, drop, type));
      return true;
    };

    const dropTypeOf = (event: DragEvent, el: HTMLElement): TreeDropType => {
      const rect = el.getBoundingClientRect();
      if (!rect || rect.height === 0) return 'inner';
      const offset = event.clientY - rect.top;
      if (offset < rect.height * 0.25) return 'prev';
      if (offset > rect.height * 0.75) return 'next';
      return 'inner';
    };

    const childrenArrayOf = (node: InnerNode | null): TreeData[] => {
      if (!node) return props.data as TreeData[];
      const raw = node.data[childrenKey.value] as TreeData[] | undefined;
      if (!Array.isArray(raw)) {
        (node.data as Record<string, unknown>)[childrenKey.value] = [];
        return (node.data as Record<string, unknown>)[childrenKey.value] as TreeData[];
      }
      return raw;
    };

    const moveNode = (drag: InnerNode, drop: InnerNode, type: TreeDropType): void => {
      const fromParent = drag.parent;
      const fromList = fromParent ? fromParent.children : rootNodes.value;
      const fromIndex = fromList.indexOf(drag);
      if (fromIndex >= 0) fromList.splice(fromIndex, 1);
      const fromDataList = childrenArrayOf(fromParent);
      const fromDataIndex = fromDataList.indexOf(drag.data);
      if (fromDataIndex >= 0) fromDataList.splice(fromDataIndex, 1);
      if (fromParent && fromParent.children.length === 0 && !props.lazy) fromParent.isLeaf = true;

      const updateLevel = (target: InnerNode, level: number): void => {
        target.level = level;
        target.children.forEach((child) => updateLevel(child, level + 1));
      };
      if (type === 'inner') {
        drop.children.push(drag);
        drag.parent = drop;
        updateLevel(drag, drop.level + 1);
        childrenArrayOf(drop).push(drag.data);
        drop.isLeaf = false;
        drop.loaded = true;
        drop.expanded = true;
        drop.everExpanded = true;
      } else {
        const toParent = drop.parent;
        const toList = toParent ? toParent.children : rootNodes.value;
        const dropIndex = toList.indexOf(drop);
        const insertIndex = type === 'prev' ? dropIndex : dropIndex + 1;
        toList.splice(insertIndex < 0 ? toList.length : insertIndex, 0, drag);
        drag.parent = toParent;
        updateLevel(drag, toParent ? toParent.level + 1 : 1);
        const toDataList = childrenArrayOf(toParent);
        const dropDataIndex = toDataList.indexOf(drop.data);
        const dataInsertIndex = type === 'prev' ? dropDataIndex : dropDataIndex + 1;
        toDataList.splice(dataInsertIndex < 0 ? toDataList.length : dataInsertIndex, 0, drag.data);
      }
      const changed: InnerNode[] = [];
      recalcUp(fromParent, changed);
      recalcUp(drag.parent, changed);
    };

    const build = (preserve: boolean): void => {
      const expandedKeys = new Set<TreeKey>();
      const everExpandedKeys = new Set<TreeKey>();
      const checkedKeys = new Set<TreeKey>();
      const currentKey = currentNode.value?.key ?? null;
      if (preserve) {
        eachNode((node) => {
          if (node.key !== null && node.key !== undefined) {
            if (node.expanded) expandedKeys.add(node.key);
            if (node.everExpanded) everExpandedKeys.add(node.key);
            if (node.checked) checkedKeys.add(node.key);
          }
        });
      }
      rootNodes.value.forEach(unregisterSubtree);
      keyMap.clear();
      rootNodes.value = props.data.map((item) => createNode(item, null, 1));
      currentNode.value = null;
      if (preserve) {
        everExpandedKeys.forEach((key) => {
          const node = keyMap.get(key);
          if (node && !node.isLeaf) node.everExpanded = true;
        });
        expandedKeys.forEach((key) => {
          const node = keyMap.get(key);
          if (node && !node.isLeaf) {
            node.expanded = true;
            node.everExpanded = true;
          }
        });
        checkedKeys.forEach((key) => {
          const node = keyMap.get(key);
          if (node) applyChecked(node, true, !props.checkStrictly, false);
        });
        if (currentKey !== null && currentKey !== undefined) {
          const node = keyMap.get(currentKey);
          if (node) setCurrent(node, true, false);
        }
        applyFilter(filterQuery.value, false);
        return;
      }
      if (props.defaultExpandAll) {
        eachNode((node) => {
          if (!node.isLeaf) {
            node.expanded = true;
            node.everExpanded = true;
          }
        });
      } else if (props.defaultExpandedKeys.length > 0) {
        props.defaultExpandedKeys.forEach((key) => {
          const node = keyMap.get(key);
          if (node && !node.isLeaf) {
            node.expanded = true;
            node.everExpanded = true;
            if (props.autoExpandParent) expandAncestors(node);
          }
        });
      }
      if (props.defaultCheckedKeys.length > 0) {
        props.defaultCheckedKeys.forEach((key) => {
          const node = keyMap.get(key);
          if (node && !isEffectivelyDisabled(node)) applyChecked(node, true, !props.checkStrictly, false);
        });
      }
      const initialCurrent = props.currentNodeKey ?? props.defaultCurrentKey ?? null;
      if (initialCurrent !== null && initialCurrent !== undefined) {
        const node = keyMap.get(initialCurrent);
        if (node) setCurrent(node, true, false);
      }
    };

    const loadRoot = (): void => {
      if (!props.lazy || !props.load || rootNodes.value.length > 0) return;
      const fake = reactive({
        uid: (uidSeed += 1),
        key: null,
        data: {} as TreeData,
        parent: null,
        children: rootNodes.value,
        level: 0,
        label: '',
        disabled: false,
        isLeaf: false,
        loaded: false,
        loading: true,
        expanded: true,
        everExpanded: true,
        checked: false,
        indeterminate: false,
        visible: true,
        isCurrent: false
      }) as InnerNode;
      const resolve = (children: TreeData[]): void => {
        fake.loading = false;
        fake.loaded = true;
        setChildrenData(null, Array.isArray(children) ? children : []);
        applyFilter(filterQuery.value, false);
      };
      const reject = (): void => {
        fake.loading = false;
      };
      const result = props.load(fake, resolve, reject) as unknown;
      if (Array.isArray(result)) resolve(result as TreeData[]);
      else if (result && typeof (result as Promise<TreeData[]>).then === 'function') {
        (result as Promise<TreeData[]>).then((list) => resolve(Array.isArray(list) ? list : [])).catch(reject);
      }
    };

    build(false);

    watch(
      () => props.data,
      () => build(true),
      { deep: true }
    );
    watch(
      () => props.currentNodeKey,
      (value) => {
        if (value === null || value === undefined) setCurrent(null, true, true);
        else {
          const node = keyMap.get(value);
          setCurrent(node ?? null, true, true);
        }
      }
    );
    watch(filterQuery, (value) => applyFilter(value, true));

    onMounted(() => {
      loadRoot();
    });

    const handleNodeClick = (node: InnerNode, event: MouseEvent): void => {
      emit('node-click', node.data, node, proxy, event);
      if (props.disabled || isEffectivelyDisabled(node)) {
        if (props.expandOnClickNode && !node.isLeaf) toggleExpand(node);
        return;
      }
      if (props.showCheckbox && (props.checkOnClickNode || (props.checkOnClickLeaf && node.isLeaf))) {
        applyChecked(node, !node.checked, undefined, true);
      }
      if (props.expandOnClickNode && !node.isLeaf) toggleExpand(node);
      setCurrent(node, true, true);
    };

    const handleCheckChange = (node: InnerNode, event: Event): void => {
      const target = event.target as HTMLInputElement | null;
      const checked = target ? target.checked : !node.checked;
      applyChecked(node, checked, undefined, true);
    };

    const handleContextmenu = (node: InnerNode, event: MouseEvent): void => {
      emit('node-contextmenu', event, node.data, node, proxy);
    };

    const handleDragStart = (node: InnerNode, event: DragEvent): void => {
      if (!canDrag(node)) {
        event.preventDefault();
        return;
      }
      draggingNode.value = node;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        try {
          event.dataTransfer.setData('text/plain', String(node.key ?? node.uid));
        } catch {
          /* jsdom 忽略 */
        }
      }
      emit('node-drag-start', node, event);
    };

    const handleDragEnter = (node: InnerNode, event: DragEvent): void => {
      const drag = draggingNode.value;
      if (!drag || drag === node) return;
      emit('node-drag-enter', drag, node, event);
    };

    const handleDragOver = (node: InnerNode, event: DragEvent): void => {
      const drag = draggingNode.value;
      if (!drag || drag === node) return;
      const el = event.currentTarget as HTMLElement | null;
      const type = el ? dropTypeOf(event, el) : 'inner';
      if (!canDrop(drag, node, type)) {
        if (dropNode.value === node) {
          dropNode.value = null;
          dropType.value = null;
        }
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      dropNode.value = node;
      dropType.value = type;
      emit('node-drag-over', drag, node, event);
    };

    const handleDragLeave = (node: InnerNode, event: DragEvent): void => {
      const drag = draggingNode.value;
      if (drag) emit('node-drag-leave', drag, node, event);
      if (dropNode.value === node) {
        dropNode.value = null;
        dropType.value = null;
      }
    };

    const handleDrop = (node: InnerNode, event: DragEvent): void => {
      const drag = draggingNode.value;
      if (!drag) return;
      event.preventDefault();
      const el = event.currentTarget as HTMLElement | null;
      const type = dropNode.value === node && dropType.value ? dropType.value : el ? dropTypeOf(event, el) : 'inner';
      if (!canDrop(drag, node, type)) {
        draggingNode.value = null;
        dropNode.value = null;
        dropType.value = null;
        return;
      }
      moveNode(drag, node, type);
      emit('node-drop', drag, node, type, event);
      emit('node-drag-end', drag, node, type, event);
      draggingNode.value = null;
      dropNode.value = null;
      dropType.value = null;
    };

    const handleDragEnd = (node: InnerNode, event: DragEvent): void => {
      const drag = draggingNode.value ?? node;
      emit('node-drag-end', drag, dropNode.value, dropType.value, event);
      draggingNode.value = null;
      dropNode.value = null;
      dropType.value = null;
    };

    const syncIndeterminate = (node: InnerNode) => (el: unknown): void => {
      const input = el as HTMLInputElement | null;
      if (input) input.indeterminate = node.indeterminate;
    };

    const filter: TreeExposed['filter'] = (value: string): void => {
      filterQuery.value = value ?? '';
      applyFilter(filterQuery.value, true);
    };

    const getNode: TreeExposed['getNode'] = (param: TreeNodeParam): InnerNode | null => resolveNode(param);

    const getCheckedNodes: TreeExposed['getCheckedNodes'] = (leafOnly = false, includeHalfChecked = false): TreeData[] => {
      const result: TreeData[] = [];
      eachNode((node) => {
        if (leafOnly && !node.isLeaf) return;
        if (node.checked) result.push(node.data);
        else if (includeHalfChecked && node.indeterminate) result.push(node.data);
      });
      return result;
    };

    const getCheckedKeys: TreeExposed['getCheckedKeys'] = (leafOnly = false): TreeKey[] => {
      const result: TreeKey[] = [];
      eachNode((node) => {
        if (leafOnly && !node.isLeaf) return;
        if (node.checked && node.key !== null && node.key !== undefined) result.push(node.key);
      });
      return result;
    };

    const getHalfCheckedNodes: TreeExposed['getHalfCheckedNodes'] = (): TreeData[] => {
      const result: TreeData[] = [];
      eachNode((node) => {
        if (node.indeterminate) result.push(node.data);
      });
      return result;
    };

    const getHalfCheckedKeys: TreeExposed['getHalfCheckedKeys'] = (): TreeKey[] => {
      const result: TreeKey[] = [];
      eachNode((node) => {
        if (node.indeterminate && node.key !== null && node.key !== undefined) result.push(node.key);
      });
      return result;
    };

    const clearChecked = (): void => {
      eachNode((node) => {
        node.checked = false;
        node.indeterminate = false;
      });
    };

    const setCheckedNodes: TreeExposed['setCheckedNodes'] = (nodes: TreeNodeParam[], leafOnly = false): void => {
      clearChecked();
      let firstApplied: InnerNode | null = null;
      nodes.forEach((item) => {
        const node = resolveNode(item);
        if (!node) return;
        if (leafOnly && !node.isLeaf) return;
        if (!firstApplied) firstApplied = node;
        applyChecked(node, true, !props.checkStrictly, false);
      });
      if (firstApplied) emitCheck(firstApplied);
    };

    const setCheckedKeys: TreeExposed['setCheckedKeys'] = (keys: TreeKey[], leafOnly = false): void => {
      clearChecked();
      let firstApplied: InnerNode | null = null;
      keys.forEach((key) => {
        const node = keyMap.get(key);
        if (!node) return;
        if (leafOnly && !node.isLeaf) return;
        if (!firstApplied) firstApplied = node;
        applyChecked(node, true, !props.checkStrictly, false);
      });
      if (firstApplied) emitCheck(firstApplied);
    };

    const setChecked: TreeExposed['setChecked'] = (param: TreeNodeParam, checked: boolean, deep?: boolean): void => {
      const node = resolveNode(param);
      if (node) applyChecked(node, checked, deep, true);
    };

    const getCurrentKey: TreeExposed['getCurrentKey'] = (): TreeKey | null =>
      currentNode.value?.key ?? null;

    const getCurrentNode: TreeExposed['getCurrentNode'] = (): TreeData | null =>
      currentNode.value ? currentNode.value.data : null;

    const setCurrentKey: TreeExposed['setCurrentKey'] = (
      key: TreeKey | null,
      shouldAutoExpandParent = true
    ): void => {
      if (key === null || key === undefined) setCurrent(null, shouldAutoExpandParent, true);
      else setCurrent(keyMap.get(key) ?? null, shouldAutoExpandParent, true);
    };

    const setCurrentNode: TreeExposed['setCurrentNode'] = (
      param: TreeNodeParam | null,
      shouldAutoExpandParent = true
    ): void => {
      setCurrent(param === null ? null : resolveNode(param), shouldAutoExpandParent, true);
    };

    const expandAll: TreeExposed['expandAll'] = (expand = true): void => {
      eachNode((node) => {
        if (node.isLeaf) return;
        if (expand) {
          if (props.lazy && !node.loaded && !node.loading) {
            doExpand(node, true, false);
          } else {
            node.expanded = true;
            node.everExpanded = true;
          }
        } else {
          node.expanded = false;
        }
      });
    };

    const expandNode: TreeExposed['expandNode'] = (param: TreeNodeParam): void => {
      const node = resolveNode(param);
      if (node) doExpand(node, true, true);
    };

    const collapseNode: TreeExposed['collapseNode'] = (param: TreeNodeParam): void => {
      const node = resolveNode(param);
      if (node) doExpand(node, false, true);
    };

    const updateKeyChildren: TreeExposed['updateKeyChildren'] = (key: TreeKey, children: TreeData[]): void => {
      const node = keyMap.get(key);
      if (!node) return;
      node.loading = false;
      node.loaded = true;
      setChildrenData(node, Array.isArray(children) ? children : []);
      if (node.checked && !props.checkStrictly) {
        const changed: InnerNode[] = [];
        cascadeDown(node, true, changed);
      } else {
        const changed: InnerNode[] = [];
        recalcUp(node, changed);
      }
      applyFilter(filterQuery.value, false);
    };

    const remove: TreeExposed['remove'] = (param: TreeNodeParam): void => {
      const node = resolveNode(param);
      if (!node) return;
      const parent = node.parent;
      const list = parent ? parent.children : rootNodes.value;
      const index = list.indexOf(node);
      if (index >= 0) list.splice(index, 1);
      const dataList = childrenArrayOf(parent);
      const dataIndex = dataList.indexOf(node.data);
      if (dataIndex >= 0) dataList.splice(dataIndex, 1);
      if (parent && parent.children.length === 0 && !props.lazy) parent.isLeaf = true;
      const changed: InnerNode[] = [];
      recalcUp(parent, changed);
      unregisterSubtree(node);
    };

    const append: TreeExposed['append'] = (data: TreeData | TreeData[], parent?: TreeNodeParam | null): void => {
      const parentNode = parent === undefined || parent === null ? null : resolveNode(parent);
      if (parent !== undefined && parent !== null && !parentNode) return;
      const list = Array.isArray(data) ? data : [data];
      list.forEach((item) => {
        const node = createNode(item, parentNode, parentNode ? parentNode.level + 1 : 1);
        if (parentNode) {
          parentNode.children.push(node);
          parentNode.isLeaf = false;
          parentNode.loaded = true;
        } else {
          rootNodes.value.push(node);
        }
        childrenArrayOf(parentNode).push(item);
        if (parentNode?.checked && !props.checkStrictly && !isEffectivelyDisabled(node)) {
          applyChecked(node, true, true, false);
        }
      });
      if (parentNode) {
        const changed: InnerNode[] = [];
        recalcUp(parentNode, changed);
      }
      applyFilter(filterQuery.value, false);
    };

    const insertAt = (data: TreeData, refParam: TreeNodeParam, after: boolean): void => {
      const refNode = resolveNode(refParam);
      if (!refNode) return;
      const parent = refNode.parent;
      const list = parent ? parent.children : rootNodes.value;
      const index = list.indexOf(refNode);
      const node = createNode(data, parent, refNode.level);
      list.splice(index < 0 ? list.length : index + (after ? 1 : 0), 0, node);
      const dataList = childrenArrayOf(parent);
      const dataIndex = dataList.indexOf(refNode.data);
      dataList.splice(dataIndex < 0 ? dataList.length : dataIndex + (after ? 1 : 0), 0, data);
      if (parent?.checked && !props.checkStrictly && !isEffectivelyDisabled(node)) {
        applyChecked(node, true, true, false);
      }
      applyFilter(filterQuery.value, false);
    };

    const insertBefore: TreeExposed['insertBefore'] = (data: TreeData, ref: TreeNodeParam): void => {
      insertAt(data, ref, false);
    };

    const insertAfter: TreeExposed['insertAfter'] = (data: TreeData, ref: TreeNodeParam): void => {
      insertAt(data, ref, true);
    };

    expose({
      filter,
      getNode,
      getCheckedNodes,
      getCheckedKeys,
      getHalfCheckedNodes,
      getHalfCheckedKeys,
      setCheckedNodes,
      setCheckedKeys,
      setChecked,
      getCurrentKey,
      getCurrentNode,
      setCurrentKey,
      setCurrentNode,
      expandAll,
      expandNode,
      collapseNode,
      updateKeyChildren,
      remove,
      append,
      insertBefore,
      insertAfter
    });

    const renderContent = (node: InnerNode): unknown => {
      if (slots.default) return slots.default({ node, data: node.data });
      if (props.renderContent) return props.renderContent(h, { node, data: node.data });
      return <span class={bem('label')}>{node.label}</span>;
    };

    const renderIcon = (node: InnerNode): unknown => {
      if (node.loading) return <span class={bem('loading')} aria-hidden="true" />;
      if (slots.icon) return slots.icon({ node, data: node.data, expanded: node.expanded });
      if (typeof props.icon === 'string' && props.icon) return <i class={[bem('icon'), props.icon]} aria-hidden="true" />;
      if (props.icon) return h(props.icon, { class: bem('icon'), 'aria-hidden': 'true' });
      return (
        <span class={[bem('caret'), node.expanded && 'is-expanded']} aria-hidden="true">
          ▸
        </span>
      );
    };

    const renderNode = (node: InnerNode): unknown => {
      const disabled = isEffectivelyDisabled(node);
      const isDropTarget = dropNode.value === node && draggingNode.value && draggingNode.value !== node;
      const shouldRenderChildren = props.renderAfterExpand ? node.everExpanded : true;
      return (
        <div
          class={[bem('node'), getNodeClass(node.data, node)]}
          key={node.key !== null && node.key !== undefined ? String(node.key) : `uid-${node.uid}`}
          role="treeitem"
          aria-expanded={!node.isLeaf ? node.expanded : undefined}
          aria-selected={node.isCurrent}
          aria-disabled={disabled || undefined}
          aria-checked={props.showCheckbox ? (node.indeterminate ? 'mixed' : node.checked) : undefined}
          aria-level={node.level}>
          <div
            class={[
              bem('content'),
              node.isCurrent && props.highlightCurrent && 'is-current',
              disabled && 'is-disabled',
              draggingNode.value === node && 'is-dragging',
              isDropTarget && dropType.value && `is-drop-${dropType.value}`
            ]}
            style={{ paddingLeft: `${(node.level - 1) * props.indent + 8}px` }}
            draggable={canDrag(node)}
            onClick={(event: MouseEvent) => handleNodeClick(node, event)}
            onContextmenu={(event: MouseEvent) => handleContextmenu(node, event)}
            onDragstart={(event: DragEvent) => handleDragStart(node, event)}
            onDragenter={(event: DragEvent) => handleDragEnter(node, event)}
            onDragover={(event: DragEvent) => handleDragOver(node, event)}
            onDragleave={(event: DragEvent) => handleDragLeave(node, event)}
            onDrop={(event: DragEvent) => handleDrop(node, event)}
            onDragend={(event: DragEvent) => handleDragEnd(node, event)}>
            {!node.isLeaf ? (
              <span
                class={bem('expand-icon')}
                onClick={(event: MouseEvent) => {
                  event.stopPropagation();
                  toggleExpand(node);
                }}>
                {renderIcon(node)}
              </span>
            ) : (
              <span class={bem('leaf')} aria-hidden="true" />
            )}
            {props.showCheckbox && (
              <input
                class={bem('checkbox')}
                type="checkbox"
                checked={node.checked}
                disabled={disabled}
                ref={syncIndeterminate(node)}
                aria-label={node.label}
                onClick={(event: MouseEvent) => event.stopPropagation()}
                onChange={(event: Event) => handleCheckChange(node, event)}
              />
            )}
            <span class={bem('text')}>{renderContent(node)}</span>
          </div>
          {!node.isLeaf && shouldRenderChildren && node.children.length > 0 && (
            <div
              class={bem('children')}
              role="group"
              style={{ display: node.expanded ? undefined : 'none' }}>
              {node.children.filter((child) => child.visible).map((child) => renderNode(child))}
            </div>
          )}
          {node.loading && (
            <div class={bem('children')}>
              <span class={bem('loading-text')}>加载中...</span>
            </div>
          )}
        </div>
      );
    };

    return () => {
      const visibleRoots = rootNodes.value.filter((node) => node.visible);
      const isEmpty = visibleRoots.length === 0;
      return (
        <div class={[bem(), props.disabled && 'is-disabled']} role="tree" aria-multiselectable={props.showCheckbox ? 'true' : undefined}>
          {props.filterable && (
            <input
              class={bem('filter')}
              type="text"
              value={filterQuery.value}
              placeholder={props.filterPlaceholder}
              aria-label={props.filterPlaceholder}
              disabled={props.disabled}
              onInput={(event: Event) => {
                filterQuery.value = (event.target as HTMLInputElement).value;
              }}
            />
          )}
          {isEmpty
            ? slots.empty?.() ?? <div class={bem('empty')}>{props.emptyText}</div>
            : visibleRoots.map((node) => renderNode(node))}
        </div>
      );
    };
  }
});
