import Empty from '../empty';
import Loading from '../loading';
import {
  Fragment,
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  watch,
  type CSSProperties,
  type PropType
} from 'vue';
import Checkbox from '../checkbox';
import Tooltip from '../tooltip';
import type {
  TableCellClassName,
  TableCellStyle,
  TableColumn,
  TableHeaderCellClassName,
  TableHeaderCellStyle,
  TableHeaderRowClassName,
  TableHeaderRowStyle,
  TableLoadMethod,
  TableOverflowTooltipOptions,
  TableRowClassName,
  TableRowStyle,
  TableSize,
  TableSortOrder,
  TableSpanMethod,
  TableSummaryMethod,
  TableTooltipFormatter,
  TableTreeProps
} from './types';

const SELECTION_KEY = '__i_selection__';
const selectionColumn: TableColumn = { type: 'selection', key: SELECTION_KEY, width: 48 };

interface HeaderCell {
  column: TableColumn;
  colspan: number;
  rowspan: number;
  group: boolean;
}
interface FlatNode {
  row: object;
  key: string | number;
  level: number;
  parent: string | number | null;
  children: Array<string | number>;
}
interface VisibleRow {
  row: object;
  index: number;
  level: number;
}

export default defineComponent({
  name: 'i-table',
  props: {
    data: { type: Array as PropType<object[]>, default: () => [] },
    columns: { type: Array as PropType<TableColumn[]>, default: () => [] },
    rowKey: { type: [String, Function] as PropType<string | ((row: object) => string | number)>, default: 'id' },
    selection: Boolean,
    loading: Boolean,
    height: { type: [String, Number] as PropType<string | number>, default: undefined },
    maxHeight: { type: [String, Number] as PropType<string | number>, default: 440 },
    emptyText: { type: String, default: '没有符合条件的数据' },
    stripe: Boolean,
    border: Boolean,
    showHeader: { type: Boolean, default: true },
    size: { type: String as PropType<TableSize>, default: 'default' },
    fit: { type: Boolean, default: true },
    highlightCurrentRow: Boolean,
    currentRowKey: { type: [String, Number] as PropType<string | number>, default: undefined },
    tableLayout: { type: String as PropType<'fixed' | 'auto'>, default: 'fixed' },
    showOverflowTooltip: { type: [Boolean, Object] as PropType<boolean | TableOverflowTooltipOptions>, default: false },
    showSummary: Boolean,
    sumText: { type: String, default: '合计' },
    summaryMethod: { type: Function as PropType<TableSummaryMethod>, default: undefined },
    spanMethod: { type: Function as PropType<TableSpanMethod>, default: undefined },
    rowClassName: { type: [String, Function] as PropType<TableRowClassName>, default: undefined },
    expandRowKeys: { type: Array as PropType<Array<string | number>>, default: undefined },
    reserveSelection: Boolean,
    treeProps: { type: Object as PropType<TableTreeProps>, default: undefined },
    lazy: Boolean,
    load: { type: Function as PropType<TableLoadMethod>, default: undefined },
    resizable: { type: Boolean, default: true },
    allowDragLastColumn: Boolean,
    tooltipFormatter: { type: Function as PropType<TableTooltipFormatter>, default: undefined },
    rowStyle: { type: [Object, Function] as PropType<TableRowStyle>, default: undefined },
    cellClassName: { type: [String, Function] as PropType<TableCellClassName>, default: undefined },
    cellStyle: { type: [Object, Function] as PropType<TableCellStyle>, default: undefined },
    headerRowClassName: { type: [String, Function] as PropType<TableHeaderRowClassName>, default: undefined },
    headerRowStyle: { type: [Object, Function] as PropType<TableHeaderRowStyle>, default: undefined },
    headerCellClassName: { type: [String, Function] as PropType<TableHeaderCellClassName>, default: undefined },
    headerCellStyle: { type: [Object, Function] as PropType<TableHeaderCellStyle>, default: undefined },
    defaultExpandAll: Boolean,
    defaultSort: {
      type: Object as PropType<{ prop: string; order: 'ascending' | 'descending' } | null>,
      default: undefined
    },
    indent: { type: Number, default: 16 },
    selectOnIndeterminate: { type: Boolean, default: true },
    scrollbarAlwaysOn: Boolean,
    scrollbarTabindex: { type: Number, default: undefined },
    flexible: Boolean,
    nativeScrollbar: { type: Boolean, default: true },
    preserveExpandedContent: Boolean,
    tooltipEffect: { type: String as PropType<'light' | 'dark'>, default: 'dark' }
  },
  emits: [
    'select',
    'select-all',
    'selection-change',
    'current-change',
    'row-click',
    'row-dblclick',
    'row-contextmenu',
    'cell-click',
    'cell-dblclick',
    'cell-contextmenu',
    'cell-mouse-enter',
    'cell-mouse-leave',
    'header-click',
    'header-contextmenu',
    'header-dragend',
    'sort-change',
    'filter-change',
    'expand-change',
    'cell-edit-start',
    'cell-edit',
    'cell-edit-cancel',
    'update:data',
    'scroll'
  ],
  setup(props, { emit, slots, expose }) {
    const fieldOf = (column: TableColumn) => column.prop ?? column.property ?? column.key ?? '';
    const titleOf = (column: TableColumn) => column.label ?? column.title ?? '';
    const kindOf = (column: TableColumn) => column.type ?? 'default';
    const filterKeyOf = (column: TableColumn) => column.columnKey ?? fieldOf(column);
    const fixedSide = (column: TableColumn) =>
      column.fixed === true ? 'left' : column.fixed === 'left' || column.fixed === 'right' ? column.fixed : undefined;
    const toPx = (value: string | number | undefined) =>
      value === undefined ? undefined : typeof value === 'number' ? `${value}px` : value;
    const numWidth = (value: number | string | undefined): number | undefined => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trimEnd().endsWith('px')) {
        const parsed = Number.parseFloat(value);
        if (Number.isFinite(parsed)) return parsed;
      }
      return undefined;
    };
    const key = (row: object) =>
      typeof props.rowKey === 'function'
        ? props.rowKey(row)
        : ((row as Record<string, unknown>)[props.rowKey] as string | number);

    // 叶子列与多级表头
    const countLeaves = (cols: TableColumn[]): number =>
      cols.reduce((n, c) => n + (c.children?.length ? countLeaves(c.children) : visibleOf(c) ? 1 : 0), 0);
    const maxDepth = (cols: TableColumn[]): number =>
      cols.reduce((n, c) => Math.max(n, c.children?.length ? 1 + maxDepth(c.children) : 1), 1);
    const autoIds = new WeakMap<TableColumn, string>();
    let autoSeq = 0;
    const colKeyOf = (column: TableColumn) => {
      const k = filterKeyOf(column);
      if (k !== '') return k;
      let id = autoIds.get(column);
      if (!id) {
        autoSeq += 1;
        id = `$auto${autoSeq}`;
        autoIds.set(column, id);
      }
      return id;
    };
    const visibilityOverrides = ref<Record<string, boolean>>({});
    const visibleOf = (column: TableColumn) => visibilityOverrides.value[colKeyOf(column)] ?? column.visible ?? true;
    const topOrder = ref<string[]>([]);
    watch(
      () => props.columns,
      (cols) => {
        const keys = cols.map(colKeyOf);
        topOrder.value = [
          ...topOrder.value.filter((k) => keys.includes(k)),
          ...keys.filter((k) => !topOrder.value.includes(k))
        ];
      },
      { immediate: true }
    );
    const orderedTop = computed(() => {
      const byKey = new Map(props.columns.map((c) => [colKeyOf(c), c] as const));
      return topOrder.value.map((k) => byKey.get(k)).filter((c): c is TableColumn => c !== undefined);
    });
    const leafColumns = computed<TableColumn[]>(() => {
      const out: TableColumn[] = [];
      const walk = (cols: TableColumn[]) =>
        cols.forEach((c) => {
          if (c.children?.length) walk(c.children);
          else out.push(c);
        });
      walk(orderedTop.value);
      return out;
    });
    const visibleLeaves = computed(() => leafColumns.value.filter(visibleOf));
    const setColumnVisibility = (k: string, visible: boolean) => {
      visibilityOverrides.value = { ...visibilityOverrides.value, [k]: visible };
    };
    const moveColumn = (fromKey: string, toIndex: number) => {
      if (!topOrder.value.includes(fromKey)) return;
      const order = topOrder.value.filter((k) => k !== fromKey);
      order.splice(Math.max(0, Math.min(toIndex, order.length)), 0, fromKey);
      topOrder.value = order;
    };
    const getColumnOrder = () => [...topOrder.value];
    const headerRows = computed<HeaderCell[][]>(() => {
      const visibleKids = (cols: TableColumn[]): TableColumn[] =>
        cols.filter((c) => (c.children?.length ? visibleKids(c.children).length > 0 : visibleOf(c)));
      const cols = visibleKids(orderedTop.value);
      const total = cols.length ? maxDepth(cols) : 1;
      const rows: HeaderCell[][] = Array.from({ length: total }, () => []);
      const walk = (list: TableColumn[], level: number) =>
        list.forEach((c) => {
          if (c.children?.length) {
            const kids = visibleKids(c.children);
            rows[level].push({ column: c, colspan: countLeaves(kids), rowspan: 1, group: true });
            walk(kids, level + 1);
          } else {
            rows[level].push({ column: c, colspan: 1, rowspan: total - level, group: false });
          }
        });
      walk(cols, 0);
      return rows;
    });
    const hasExplicitSelection = computed(() => visibleLeaves.value.some((column) => kindOf(column) === 'selection'));
    const hasPseudoSelection = computed(() => props.selection && !hasExplicitSelection.value);
    const renderColumns = computed<TableColumn[]>(() =>
      hasPseudoSelection.value ? [selectionColumn, ...visibleLeaves.value] : [...visibleLeaves.value]
    );
    const leafPosition = computed(() => new Map<TableColumn, number>(visibleLeaves.value.map((c, i) => [c, i])));
    const renderIndexOf = (column: TableColumn) =>
      (leafPosition.value.get(column) ?? 0) + (hasPseudoSelection.value ? 1 : 0);
    const treeColumn = computed(() => visibleLeaves.value.find((c) => kindOf(c) === 'default'));

    // 拖拽调整列宽
    const dragWidths = ref<Record<string, number>>({});
    const dragState = ref<{ key: string; column: TableColumn; startX: number; startWidth: number } | null>(null);
    const isResizing = ref(false);
    const resizableOf = (column: TableColumn) => column.resizable ?? props.resizable;
    const showResizeHandle = (column: TableColumn) => {
      if (!resizableOf(column)) return false;
      if (props.allowDragLastColumn) return true;
      return renderIndexOf(column) < renderColumns.value.length - 1;
    };
    const onResizeMove = (event: MouseEvent) => {
      const st = dragState.value;
      if (!st) return;
      dragWidths.value = {
        ...dragWidths.value,
        [st.key]: Math.max(40, Math.round(st.startWidth + event.clientX - st.startX))
      };
    };
    const onResizeEnd = (event: MouseEvent) => {
      window.removeEventListener('mousemove', onResizeMove);
      const st = dragState.value;
      dragState.value = null;
      isResizing.value = false;
      if (!st) return;
      emit('header-dragend', dragWidths.value[st.key] ?? st.startWidth, st.startWidth, st.column, event);
    };
    const startResize = (event: MouseEvent, column: TableColumn) => {
      if (props.loading) return;
      event.stopPropagation();
      event.preventDefault();
      const k = colKeyOf(column);
      const measured = (event.target as HTMLElement).closest?.('th')?.offsetWidth || 0;
      dragState.value = {
        key: k,
        column,
        startX: event.clientX,
        startWidth:
          dragWidths.value[k] ?? (measured > 0 ? measured : numWidth(column.width) ?? numWidth(column.minWidth) ?? 140)
      };
      isResizing.value = true;
      window.addEventListener('mousemove', onResizeMove);
      window.addEventListener('mouseup', onResizeEnd, { once: true });
    };
    onBeforeUnmount(() => window.removeEventListener('mousemove', onResizeMove));
    const resizeWidthOf = (column: TableColumn) =>
      dragWidths.value[colKeyOf(column)] ?? numWidth(column.width) ?? numWidth(column.minWidth) ?? 140;
    const onResizeKeydown = (event: KeyboardEvent, column: TableColumn) => {
      if (props.loading || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
      event.preventDefault();
      event.stopPropagation();
      const oldWidth = resizeWidthOf(column);
      const newWidth = Math.max(40, oldWidth + (event.key === 'ArrowRight' ? 10 : -10));
      dragWidths.value = { ...dragWidths.value, [colKeyOf(column)]: newWidth };
      emit('header-dragend', newWidth, oldWidth, column, event);
    };

    const widthOf = (column: TableColumn) => {
      const dragged = dragWidths.value[colKeyOf(column)];
      if (dragged !== undefined) return dragged;
      if (column.width !== undefined) return column.width;
      const kind = kindOf(column);
      return kind === 'selection' ? 48 : kind === 'index' || kind === 'expand' ? 50 : undefined;
    };
    const columnStyle = (column: TableColumn, index: number): CSSProperties => {
      const width = widthOf(column);
      const style: CSSProperties = { width: toPx(width), minWidth: toPx(column.minWidth ?? width) ?? '140px' };
      const side = column === selectionColumn ? undefined : fixedSide(column);
      if (!side) return style;
      const cols = renderColumns.value;
      const stickyWidth = (c: TableColumn) => numWidth(widthOf(c)) ?? numWidth(c.minWidth) ?? 140;
      const offset =
        side === 'left'
          ? cols
              .slice(0, index)
              .reduce((n, c) => n + (c === selectionColumn || fixedSide(c) === 'left' ? stickyWidth(c) : 0), 0)
          : cols.slice(index + 1).reduce((n, c) => n + (fixedSide(c) === 'right' ? stickyWidth(c) : 0), 0);
      style.position = 'sticky';
      style[side] = `${offset}px`;
      style.zIndex = 1;
      return style;
    };

    // 树形数据
    const childrenKey = computed(() => props.treeProps?.children ?? 'children');
    const hasChildrenKey = computed(() => props.treeProps?.hasChildren ?? 'hasChildren');
    const checkStrict = computed(() => props.treeProps?.checkStrictly === true);
    const loadedChildren = ref<Record<string | number, object[]>>({});
    const resolvedKeys = ref<Array<string | number>>([]);
    const loadingKeys = ref<Array<string | number>>([]);
    const ownChildren = (row: object): object[] | undefined => {
      const value = (row as Record<string, unknown>)[childrenKey.value];
      return Array.isArray(value) ? (value as object[]) : undefined;
    };
    const childRowsOf = (row: object): object[] => ownChildren(row) ?? loadedChildren.value[key(row)] ?? [];
    const allNodes = computed<FlatNode[]>(() => {
      const out: FlatNode[] = [];
      const walk = (rows: object[], level: number, parent: string | number | null) => {
        if (level > 100) return;
        rows.forEach((row) => {
          const k = key(row);
          const children = childRowsOf(row);
          out.push({ row, key: k, level, parent, children: children.map(key) });
          if (children.length) walk(children, level + 1, k);
        });
      };
      walk(props.data, 0, null);
      return out;
    });
    const expandableOf = (row: object): boolean => {
      if (childRowsOf(row).length > 0) return true;
      if (!props.lazy || ownChildren(row) !== undefined) return false;
      if (resolvedKeys.value.includes(key(row))) return false;
      return Boolean((row as Record<string, unknown>)[hasChildrenKey.value]);
    };
    const treeActive = computed(
      () =>
        allNodes.value.some((n) => n.children.length > 0) ||
        (props.lazy && props.data.some((r) => Boolean((r as Record<string, unknown>)[hasChildrenKey.value])))
    );
    const childKeyMap = computed(() => {
      const map = new Map<string | number, Array<string | number>>();
      allNodes.value.forEach((n) => map.set(n.key, n.children));
      return map;
    });
    const parentKeyMap = computed(() => {
      const map = new Map<string | number, string | number>();
      allNodes.value.forEach((n) => {
        if (n.parent !== null) map.set(n.key, n.parent);
      });
      return map;
    });
    const descendantKeys = (k: string | number): Array<string | number> => {
      const out: Array<string | number> = [];
      const walk = (id: string | number) => {
        (childKeyMap.value.get(id) ?? []).forEach((c) => {
          out.push(c);
          walk(c);
        });
      };
      walk(k);
      return out;
    };
    const cascadeActive = computed(() => treeActive.value && !checkStrict.value);

    // 选择
    const selected = ref<Array<string | number>>([]);
    const selectionColumns = computed(() => visibleLeaves.value.filter((c) => kindOf(c) === 'selection'));
    const selectableOf = (row: object, index: number) =>
      selectionColumns.value.every((c) => c.selectable?.(row as Record<string, unknown>, index) !== false);
    const selectableByKey = computed(() => {
      const map = new Map<string | number, boolean>();
      const visibleIndex = new Map<string | number, number>();
      visibleRows.value.forEach(({ row, index }) => visibleIndex.set(key(row), index));
      allNodes.value.forEach((n, i) => {
        map.set(n.key, selectableOf(n.row, visibleIndex.get(n.key) ?? i));
      });
      return map;
    });
    const selectedRows = () => allNodes.value.filter((n) => selected.value.includes(n.key)).map((n) => n.row);
    const halfKeys = computed(() => {
      const half = new Set<string | number>();
      if (!cascadeActive.value) return half;
      [...allNodes.value]
        .sort((a, b) => b.level - a.level)
        .forEach((n) => {
          const children = (childKeyMap.value.get(n.key) ?? []).filter((c) => selectableByKey.value.get(c) !== false);
          if (!children.length) return;
          const sel = children.filter((c) => selected.value.includes(c)).length;
          const halves = children.filter((c) => half.has(c)).length;
          if ((sel > 0 || halves > 0) && sel < children.length) half.add(n.key);
        });
      return half;
    });
    const getHalfSelectionRows = () => allNodes.value.filter((n) => halfKeys.value.has(n.key)).map((n) => n.row);
    const emitSelection = () => emit('selection-change', selectedRows());
    const flatSet = (k: string | number, checked: boolean) => {
      selected.value = checked
        ? selected.value.includes(k)
          ? selected.value
          : [...selected.value, k]
        : selected.value.filter((id) => id !== k);
    };
    const fixAncestors = (k: string | number) => {
      let parent = parentKeyMap.value.get(k);
      while (parent !== undefined) {
        const children = (childKeyMap.value.get(parent) ?? []).filter((c) => selectableByKey.value.get(c) !== false);
        if (children.length)
          flatSet(
            parent,
            children.every((c) => selected.value.includes(c))
          );
        parent = parentKeyMap.value.get(parent);
      }
    };
    const setRowSelected = (row: object, checked: boolean) => {
      const k = key(row);
      if (!cascadeActive.value) {
        flatSet(k, checked);
        return;
      }
      const keys = [k, ...descendantKeys(k)].filter((id) => selectableByKey.value.get(id) !== false);
      if (checked) {
        selected.value = [...new Set([...selected.value, ...keys])];
      } else {
        const drop = new Set(keys);
        selected.value = selected.value.filter((id) => !drop.has(id));
      }
      fixAncestors(k);
    };
    const shouldReserveSelection = () =>
      props.reserveSelection || selectionColumns.value.some((c) => c.reserveSelection === true);
    watch(
      () => props.data,
      () => {
        if (shouldReserveSelection()) return;
        const valid = new Set(allNodes.value.map((n) => n.key));
        const remaining = selected.value.filter((id) => valid.has(id));
        if (remaining.length !== selected.value.length) {
          selected.value = remaining;
          if (cascadeActive.value) selected.value.forEach((k) => fixAncestors(k));
          emitSelection();
        }
      }
    );

    // 筛选（作用于根行）
    const activeFilters = ref<Record<string, unknown[]>>({});
    visibleLeaves.value.forEach((c) => {
      if (c.filteredValue) activeFilters.value[filterKeyOf(c)] = [...c.filteredValue];
    });
    watch(
      () => visibleLeaves.value.map((c) => c.filteredValue),
      (values) => {
        visibleLeaves.value.forEach((c, i) => {
          if (values[i] !== undefined) activeFilters.value[filterKeyOf(c)] = [...(values[i] as unknown[])];
        });
      },
      { deep: true }
    );
    const allFilterValues = () => {
      const out: Record<string, unknown[]> = {};
      Object.entries(activeFilters.value).forEach(([k, v]) => {
        if (v.length) out[k] = [...v];
      });
      return out;
    };
    const openFilter = ref<string | null>(null);
    const draftFilters = ref<unknown[]>([]);
    const openFilterPanel = (column: TableColumn) => {
      const k = filterKeyOf(column);
      openFilter.value = openFilter.value === k ? null : k;
      draftFilters.value = [...(activeFilters.value[k] ?? [])];
    };
    const toggleDraft = (value: unknown, checked: boolean) => {
      draftFilters.value = checked ? [...draftFilters.value, value] : draftFilters.value.filter((v) => v !== value);
    };
    const commitFilter = (column: TableColumn, values: unknown[]) => {
      activeFilters.value[filterKeyOf(column)] = [...values];
      openFilter.value = null;
      emit('filter-change', allFilterValues());
    };
    const clearFilter = (keys?: string[]) => {
      if (!keys) {
        activeFilters.value = {};
      } else {
        const next = { ...activeFilters.value };
        keys.forEach((k) => delete next[k]);
        activeFilters.value = next;
      }
      openFilter.value = null;
      emit('filter-change', allFilterValues());
    };
    const filteredData = computed(() =>
      props.data.filter((row) =>
        visibleLeaves.value.every((column) => {
          const values = activeFilters.value[filterKeyOf(column)];
          const method = column.filterMethod;
          if (!values || !values.length || !method) return true;
          const record = row as Record<string, unknown>;
          return column.filterMultiple === false
            ? method(values[0], record, column)
            : values.some((v) => method(v, record, column));
        })
      )
    );

    // 排序（作用于根行）
    const sortState = ref<{ column: TableColumn; prop: string; order: 'ascending' | 'descending' } | null>(null);
    if (props.defaultSort) {
      const target = visibleLeaves.value.find(
        (c) => c.sortable && (fieldOf(c) === props.defaultSort!.prop || c.columnKey === props.defaultSort!.prop)
      );
      if (target) sortState.value = { column: target, prop: fieldOf(target), order: props.defaultSort.order };
    }
    const ordersOf = (column: TableColumn): TableSortOrder[] => column.sortOrders ?? ['ascending', 'descending', null];
    const applySort = (column: TableColumn, prop: string, order: TableSortOrder, alwaysEmit: boolean) => {
      const before = sortState.value;
      const changed =
        !before || before.prop !== prop || filterKeyOf(before.column) !== filterKeyOf(column) || before.order !== order;
      sortState.value = order === null ? null : { column, prop, order };
      if (alwaysEmit || changed) emit('sort-change', { column, prop, order });
    };
    const cycleSort = (column: TableColumn) => {
      if (props.loading) return;
      const prop = fieldOf(column);
      const orders = ordersOf(column);
      const same =
        sortState.value !== null &&
        sortState.value.prop === prop &&
        filterKeyOf(sortState.value.column) === filterKeyOf(column);
      const at = same ? orders.indexOf(sortState.value!.order) : -1;
      applySort(column, prop, orders.length ? orders[(at + 1) % orders.length] : null, true);
    };
    const compareValues = (a: unknown, b: unknown): number => {
      const x = a ?? '';
      const y = b ?? '';
      if (x === y) return 0;
      if (typeof x === 'number' && typeof y === 'number') return x - y;
      return String(x) < String(y) ? -1 : 1;
    };
    const sortValuesOf = (column: TableColumn, prop: string, row: object, index: number): unknown[] => {
      const by = column.sortBy ?? prop;
      if (typeof by === 'function') {
        const result = by(row as Record<string, unknown>, index);
        return Array.isArray(result) ? result : [result];
      }
      return (Array.isArray(by) ? by : [by]).map((k) => (row as Record<string, unknown>)[k]);
    };
    const displayData = computed(() => {
      const rows = filteredData.value;
      const state = sortState.value;
      if (!state || state.column.sortable === 'custom') return rows;
      const direction = state.order === 'descending' ? -1 : 1;
      const method = state.column.sortMethod;
      return rows
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          if (method) return method(a.row as Record<string, unknown>, b.row as Record<string, unknown>) * direction;
          const va = sortValuesOf(state.column, state.prop, a.row, a.index);
          const vb = sortValuesOf(state.column, state.prop, b.row, b.index);
          for (let i = 0; i < Math.max(va.length, vb.length); i += 1) {
            const diff = compareValues(va[i], vb[i]);
            if (diff !== 0) return diff * direction;
          }
          return a.index - b.index;
        })
        .map((item) => item.row);
    });
    const clearSort = () => {
      const state = sortState.value;
      if (!state) return;
      sortState.value = null;
      emit('sort-change', { column: state.column, prop: state.prop, order: null });
    };
    const sort = (prop: string, order: TableSortOrder) => {
      const column = visibleLeaves.value.find((c) => c.sortable && (fieldOf(c) === prop || c.columnKey === prop));
      if (!column) return;
      applySort(column, fieldOf(column), order, false);
    };

    // 展开行（与树形共用展开键）
    const expandColumns = computed(() => visibleLeaves.value.filter((c) => kindOf(c) === 'expand'));
    const expandedKeys = ref<Array<string | number>>([...(props.expandRowKeys ?? [])]);
    watch(
      () => props.expandRowKeys,
      (value) => {
        expandedKeys.value = [...(value ?? [])];
      },
      { deep: true }
    );
    const expandedRows = () => allNodes.value.filter((n) => expandedKeys.value.includes(n.key)).map((n) => n.row);
    const setExpanded = (row: object, expanded: boolean) => {
      const k = key(row);
      const has = expandedKeys.value.includes(k);
      if (has === expanded) return;
      expandedKeys.value = expanded ? [...expandedKeys.value, k] : expandedKeys.value.filter((id) => id !== k);
      emit('expand-change', row, expandedRows());
    };
    const toggleRowExpansion = (row: object, expanded?: boolean) =>
      setExpanded(row, expanded ?? !expandedKeys.value.includes(key(row)));
    const toggleTreeNode = (row: object) => {
      const k = key(row);
      if (expandedKeys.value.includes(k)) {
        setExpanded(row, false);
        return;
      }
      if (props.lazy && props.load && ownChildren(row) === undefined && !resolvedKeys.value.includes(k)) {
        if (loadingKeys.value.includes(k)) return;
        loadingKeys.value = [...loadingKeys.value, k];
        const level = allNodes.value.find((n) => n.key === k)?.level ?? 0;
        props.load(row, { level }, (children: object[]) => {
          loadingKeys.value = loadingKeys.value.filter((id) => id !== k);
          if (!resolvedKeys.value.includes(k)) resolvedKeys.value = [...resolvedKeys.value, k];
          loadedChildren.value = { ...loadedChildren.value, [k]: children ?? [] };
          if ((children ?? []).length) setExpanded(row, true);
        });
        return;
      }
      setExpanded(row, true);
    };
    const updateKeyChildren = (k: string | number, children: object[]) => {
      if (!resolvedKeys.value.includes(k)) resolvedKeys.value = [...resolvedKeys.value, k];
      loadedChildren.value = { ...loadedChildren.value, [k]: children ?? [] };
    };
    const expandAll = () => {
      const keys = allNodes.value.filter((n) => expandableOf(n.row)).map((n) => n.key);
      expandedKeys.value = [...new Set([...expandedKeys.value, ...keys])];
    };
    if (props.defaultExpandAll) expandAll();
    watch(
      () => props.data,
      () => {
        if (props.defaultExpandAll) expandAll();
      }
    );
    const visibleRows = computed<VisibleRow[]>(() => {
      const out: VisibleRow[] = [];
      const walk = (rows: object[], level: number) => {
        if (level > 100) return;
        rows.forEach((row) => {
          out.push({ row, index: out.length, level });
          if (expandedKeys.value.includes(key(row))) {
            const children = childRowsOf(row);
            if (children.length) walk(children, level + 1);
          }
        });
      };
      walk(displayData.value, 0);
      return out;
    });

    // 选择动作（作用于可见行）
    const allSelected = computed(() => {
      const selectable = visibleRows.value.filter(({ row, index }) => selectableOf(row, index));
      return selectable.length > 0 && selectable.every(({ row }) => selected.value.includes(key(row)));
    });
    const someViewSelected = computed(() =>
      visibleRows.value.some(({ row }) => selected.value.includes(key(row)) || halfKeys.value.has(key(row)))
    );
    const applyHeaderSelection = (checked: boolean, fromUser: boolean) => {
      if (checked) {
        visibleRows.value.forEach(({ row, index }) => {
          if (selectableOf(row, index)) setRowSelected(row, true);
        });
      } else {
        const drop = new Set(visibleRows.value.map(({ row }) => key(row)));
        selected.value = selected.value.filter((k) => !drop.has(k));
        if (cascadeActive.value) visibleRows.value.forEach(({ row }) => fixAncestors(key(row)));
      }
      const rows = selectedRows();
      if (fromUser) emit('select-all', rows);
      emit('selection-change', rows);
    };
    const onHeaderCheck = (checked: boolean) => {
      if (!props.selectOnIndeterminate && checked && someViewSelected.value && !allSelected.value) {
        applyHeaderSelection(false, true);
        return;
      }
      applyHeaderSelection(checked, true);
    };
    const onRowCheck = (row: object, checked: boolean) => {
      setRowSelected(row, checked);
      const rows = selectedRows();
      emit('select', rows, row);
      emit('selection-change', rows);
    };
    const clearSelection = () => {
      selected.value = [];
      emitSelection();
    };

    // 当前行
    const currentKey = ref<string | number | null>(props.currentRowKey ?? null);
    const findRowByKey = (k: string | number) => allNodes.value.find((n) => n.key === k)?.row ?? null;
    const setCurrentRow = (row?: object | null) => {
      const target = row ?? null;
      const next = target ? key(target) : null;
      if (currentKey.value === next) return;
      const old = currentKey.value === null ? null : findRowByKey(currentKey.value);
      currentKey.value = next;
      emit('current-change', target, old);
    };
    watch(
      () => props.currentRowKey,
      (v) => setCurrentRow(v === undefined ? null : findRowByKey(v))
    );

    // 合并单元格
    const spanPlan = computed(() => {
      const skip = new Set<string>();
      const spans = new Map<string, { rowspan: number; colspan: number }>();
      if (!props.spanMethod) return { skip, spans };
      const cols = renderColumns.value;
      visibleRows.value.forEach(({ row, index: r }) => {
        cols.forEach((column, c) => {
          const at = `${r}:${c}`;
          if (skip.has(at)) return;
          const result = props.spanMethod!({ row, column, rowIndex: r, columnIndex: c });
          const rowspan = Array.isArray(result) ? result[0] ?? 1 : result?.rowspan ?? 1;
          const colspan = Array.isArray(result) ? result[1] ?? 1 : result?.colspan ?? 1;
          if (rowspan === 0 || colspan === 0) {
            skip.add(at);
            return;
          }
          if (rowspan === 1 && colspan === 1) return;
          spans.set(at, { rowspan, colspan });
          for (let i = r; i < r + rowspan; i += 1)
            for (let j = c; j < c + colspan; j += 1) if (i !== r || j !== c) skip.add(`${i}:${j}`);
        });
      });
      return { skip, spans };
    });

    // 合计行
    const sums = computed<Array<string | number>>(() => {
      if (props.summaryMethod) return props.summaryMethod({ columns: visibleLeaves.value, data: props.data });
      return visibleLeaves.value.map((column, i) => {
        if (i === 0) return props.sumText;
        const field = fieldOf(column);
        if (!field) return 'N/A';
        const values = props.data.map((row) => (row as Record<string, unknown>)[field]);
        return values.length > 0 && values.every((v) => typeof v === 'number')
          ? values.reduce<number>((n, v) => n + (v as number), 0)
          : 'N/A';
      });
    });

    // 行列事件
    const onCellClick = (event: MouseEvent, row: object, column: TableColumn) => {
      emit('cell-click', row, column, event.currentTarget as HTMLTableCellElement, event);
      emit('row-click', row, column, event);
      setCurrentRow(row);
    };
    const onCellDblclick = (event: MouseEvent, row: object, column: TableColumn, index: number) => {
      emit('cell-dblclick', row, column, event.currentTarget as HTMLTableCellElement, event);
      emit('row-dblclick', row, column, event);
      startEdit(row, column, index);
    };
    const onCellContextmenu = (event: MouseEvent, row: object, column: TableColumn) => {
      emit('cell-contextmenu', row, column, event.currentTarget as HTMLTableCellElement, event);
      emit('row-contextmenu', row, column, event);
    };
    const onCellMouseEnter = (event: MouseEvent, row: object, column: TableColumn) =>
      emit('cell-mouse-enter', row, column, event.currentTarget as HTMLTableCellElement, event);
    const onCellMouseLeave = (event: MouseEvent, row: object, column: TableColumn) =>
      emit('cell-mouse-leave', row, column, event.currentTarget as HTMLTableCellElement, event);

    const indexText = (column: TableColumn, index: number): string | number =>
      typeof column.index === 'function' ? column.index(index) : index + (column.index ?? 1);
    const overflowOf = (column: TableColumn): TableOverflowTooltipOptions | null => {
      const value = column.showOverflowTooltip ?? props.showOverflowTooltip;
      if (!value) return null;
      return value === true ? {} : value;
    };
    const tooltipTextOf = (column: TableColumn, row: object, cellValue: unknown, index: number, text: string) => {
      const formatter = column.tooltipFormatter ?? props.tooltipFormatter;
      return formatter ? formatter({ row, column, cellValue, index }) : text;
    };
    // 单元格编辑（受控：需监听 update:data 更新数据）
    const editingCell = ref<{ rowKey: string | number; field: string } | null>(null);
    const editingDraft = ref('');
    const startEdit = (row: object, column: TableColumn, index: number) => {
      if (props.loading || kindOf(column) !== 'default' || !column.editable) return;
      const rowKey = key(row);
      const field = fieldOf(column);
      if (editingCell.value?.rowKey === rowKey && editingCell.value?.field === field) return;
      editingCell.value = { rowKey, field };
      editingDraft.value = String((row as Record<string, unknown>)[field] ?? '');
      emit('cell-edit-start', { row, column, index });
    };
    const isEditing = (row: object, column: TableColumn) =>
      editingCell.value !== null &&
      kindOf(column) === 'default' &&
      editingCell.value.rowKey === key(row) &&
      editingCell.value.field === fieldOf(column);
    const applyEdit = (rows: object[], k: string | number, field: string, value: unknown): object[] =>
      rows.map((r) => {
        if (key(r) === k) return { ...r, [field]: value };
        const children = ownChildren(r);
        if (children?.length) return { ...r, [childrenKey.value]: applyEdit(children, k, field, value) };
        return r;
      });
    const confirmEdit = (row: object, column: TableColumn, index: number) => {
      if (!editingCell.value) return;
      const field = fieldOf(column);
      const oldValue = (row as Record<string, unknown>)[field];
      const value = editingDraft.value;
      editingCell.value = null;
      emit('cell-edit', { row, column, index, value, oldValue });
      emit('update:data', applyEdit(props.data, key(row), field, value));
    };
    const cancelEdit = (row: object, column: TableColumn, index: number) => {
      if (!editingCell.value) return;
      editingCell.value = null;
      emit('cell-edit-cancel', { row, column, index });
    };
    const rowClassNameOf = (row: object, index: number): string => {
      const value = props.rowClassName;
      if (!value) return '';
      return typeof value === 'function' ? value({ row, rowIndex: index }) : value;
    };
    const rowStyleOf = (row: object, index: number): CSSProperties => {
      const value = props.rowStyle;
      if (!value) return {};
      return (typeof value === 'function' ? value({ row, rowIndex: index }) : value) ?? {};
    };
    const cellClassNameOf = (row: object, column: TableColumn, rowIndex: number, columnIndex: number): string => {
      const value = props.cellClassName;
      if (!value) return '';
      const result = typeof value === 'function' ? value({ row, column, rowIndex, columnIndex }) : value;
      return result ?? '';
    };
    const cellStyleOf = (row: object, column: TableColumn, rowIndex: number, columnIndex: number): CSSProperties => {
      const value = props.cellStyle;
      if (!value) return {};
      return (typeof value === 'function' ? value({ row, column, rowIndex, columnIndex }) : value) ?? {};
    };
    const headerRowClassNameOf = (rowIndex: number): string => {
      const value = props.headerRowClassName;
      if (!value) return '';
      const result = typeof value === 'function' ? value({ rowIndex }) : value;
      return result ?? '';
    };
    const headerRowStyleOf = (rowIndex: number): CSSProperties => {
      const value = props.headerRowStyle;
      if (!value) return {};
      return (typeof value === 'function' ? value({ rowIndex }) : value) ?? {};
    };
    const headerCellClassNameOf = (rowIndex: number, column: TableColumn, columnIndex: number): string => {
      const value = props.headerCellClassName;
      if (!value) return '';
      const result = typeof value === 'function' ? value({ rowIndex, column, columnIndex }) : value;
      return result ?? '';
    };
    const headerCellStyleOf = (rowIndex: number, column: TableColumn, columnIndex: number): CSSProperties => {
      const value = props.headerCellStyle;
      if (!value) return {};
      return (typeof value === 'function' ? value({ rowIndex, column, columnIndex }) : value) ?? {};
    };
    const firstLeafOf = (column: TableColumn): TableColumn => {
      let current = column;
      while (current.children?.length) current = current.children[0];
      return current;
    };
    const scrollEl = ref<HTMLDivElement | null>(null);
    const scrollStyle = computed<CSSProperties>(() =>
      props.height !== undefined ? { height: toPx(props.height) } : { maxHeight: toPx(props.maxHeight) }
    );
    const onScroll = (event: Event) => {
      const el = event.target as HTMLDivElement;
      emit('scroll', { scrollLeft: el.scrollLeft, scrollTop: el.scrollTop });
    };

    expose({
      clearSelection,
      getSelectionRows: selectedRows,
      getHalfSelectionRows,
      toggleRowSelection: (row: object, checked?: boolean) => {
        setRowSelected(row, checked ?? !selected.value.includes(key(row)));
        emitSelection();
      },
      toggleAllSelection: () => applyHeaderSelection(!allSelected.value, false),
      toggleRowExpansion,
      setCurrentRow,
      clearSort,
      sort,
      doLayout: () => {
        // 纯 CSS 布局无需手动重算，保留方法以兼容 Element Plus 调用
      },
      scrollTo: (options?: { top?: number; left?: number }) => {
        const el = scrollEl.value;
        if (!el || !options) return;
        if (options.top !== undefined) el.scrollTop = options.top;
        if (options.left !== undefined) el.scrollLeft = options.left;
      },
      setScrollTop: (top: number) => {
        if (scrollEl.value) scrollEl.value.scrollTop = top;
      },
      setScrollLeft: (left: number) => {
        if (scrollEl.value) scrollEl.value.scrollLeft = left;
      },
      updateKeyChildren,
      setColumnVisibility,
      moveColumn,
      getColumnOrder,
      clearFilter
    });

    const stop = (event: Event) => event.stopPropagation();

    const renderLeafHead = (column: TableColumn, columnIndex: number) => {
      const kind = kindOf(column);
      const field = fieldOf(column);
      const filterKey = filterKeyOf(column);
      const active =
        sortState.value !== null && sortState.value.prop === field && filterKeyOf(sortState.value.column) === filterKey;
      const label = slots[`${field}-header`]?.({ column, $index: columnIndex }) ?? titleOf(column);
      return (
        <>
          {kind === 'selection' ? (
            <Checkbox
              aria-label='选择当前页全部'
              modelValue={allSelected.value}
              indeterminate={someViewSelected.value && !allSelected.value}
              disabled={props.loading || !visibleRows.value.length}
              onChange={(checked: boolean) => onHeaderCheck(checked)}
            />
          ) : (
            <>
              {kind === 'default' && column.sortable ? (
                <button type='button' onClick={() => cycleSort(column)}>
                  {label}{' '}
                  <span aria-hidden='true'>{!active ? '↕' : sortState.value!.order === 'ascending' ? '↑' : '↓'}</span>
                </button>
              ) : (
                label
              )}
              {kind === 'default' && column.filters?.length ? (
                <>
                  <button
                    type='button'
                    class={{
                      'i-table__filter-trigger': true,
                      'is-active': (activeFilters.value[filterKey] ?? []).length > 0
                    }}
                    aria-label={`筛选${titleOf(column)}`}
                    aria-expanded={openFilter.value === filterKey}
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation();
                      openFilterPanel(column);
                    }}>
                    {slots[`${field}-filter-icon`]?.({ column }) ?? column.filterIcon?.({ column }) ?? (
                      <svg width='12' height='12' viewBox='0 0 12 12' fill='currentColor' aria-hidden='true'>
                        <path d='M1 2h10L7 6.5V10l-2 1V6.5Z' />
                      </svg>
                    )}
                  </button>
                  {openFilter.value === filterKey && (
                    <>
                      <div
                        class='i-table__filter-mask'
                        onClick={(event: MouseEvent) => {
                          event.stopPropagation();
                          openFilter.value = null;
                        }}
                      />
                      <div
                        class={[
                          'i-table__filter-panel',
                          `is-${column.filterPlacement ?? 'bottom'}`,
                          column.filterClassName
                        ]}
                        role='dialog'
                        aria-label={`${titleOf(column)}筛选`}
                        onClick={stop}>
                        {column.filterMultiple === false ? (
                          column.filters.map((opt, i) => (
                            <button
                              key={i}
                              type='button'
                              class={{
                                'i-table__filter-option': true,
                                'is-active': (activeFilters.value[filterKey] ?? []).includes(opt.value)
                              }}
                              onClick={() =>
                                commitFilter(
                                  column,
                                  (activeFilters.value[filterKey] ?? []).includes(opt.value) ? [] : [opt.value]
                                )
                              }>
                              {opt.text}
                            </button>
                          ))
                        ) : (
                          <>
                            {column.filters.map((opt, i) => (
                              <Checkbox
                                key={i}
                                modelValue={draftFilters.value.includes(opt.value)}
                                onChange={(checked: boolean) => toggleDraft(opt.value, checked)}>
                                {opt.text}
                              </Checkbox>
                            ))}
                            <div class='i-table__filter-actions'>
                              <button type='button' onClick={() => commitFilter(column, [])}>
                                重置
                              </button>
                              <button
                                type='button'
                                class='is-primary'
                                onClick={() => commitFilter(column, draftFilters.value)}>
                                确定
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </>
          )}
        </>
      );
    };

    return () => (
      <div
        class={{
          'i-table': true,
          'is-striped': props.stripe,
          'is-bordered': props.border,
          'is-fit': props.fit,
          'is-flexible': props.flexible,
          'is-resizing': isResizing.value,
          'is-large': props.size === 'large',
          'is-small': props.size === 'small'
        }}
        aria-busy={props.loading}>
        <Loading loading={props.loading} overlay>
          <div
            class={{
              'i-table__scroll': true,
              'has-always-scrollbar': props.scrollbarAlwaysOn,
              'has-custom-scrollbar': !props.nativeScrollbar
            }}
            ref={scrollEl}
            style={scrollStyle.value}
            tabindex={props.scrollbarTabindex}
            onScroll={onScroll}>
            <table style={{ tableLayout: props.tableLayout }}>
              {props.showHeader && (
                <thead>
                  {headerRows.value.map((cells, r) => (
                    <tr key={r} class={headerRowClassNameOf(r)} style={headerRowStyleOf(r)}>
                      {r === 0 && hasPseudoSelection.value && (
                        <th
                          scope='col'
                          class={['i-table__selection', headerCellClassNameOf(0, selectionColumn, 0)]}
                          rowspan={headerRows.value.length > 1 ? headerRows.value.length : undefined}
                          style={{ ...columnStyle(selectionColumn, 0), ...headerCellStyleOf(0, selectionColumn, 0) }}>
                          <Checkbox
                            aria-label='选择当前页全部'
                            modelValue={allSelected.value}
                            indeterminate={someViewSelected.value && !allSelected.value}
                            disabled={props.loading || !visibleRows.value.length}
                            onChange={(checked: boolean) => onHeaderCheck(checked)}
                          />
                        </th>
                      )}
                      {cells.map((cell, ci) =>
                        cell.group ? (
                          <th
                            key={`g${ci}`}
                            scope='colgroup'
                            colspan={cell.colspan > 1 ? cell.colspan : undefined}
                            class={[
                              cell.column.labelClassName,
                              headerCellClassNameOf(r, cell.column, renderIndexOf(firstLeafOf(cell.column)))
                            ]}
                            style={{
                              textAlign: cell.column.headerAlign || cell.column.align,
                              ...headerCellStyleOf(r, cell.column, renderIndexOf(firstLeafOf(cell.column)))
                            }}
                            onClick={(event: MouseEvent) => emit('header-click', cell.column, event)}
                            onContextmenu={(event: MouseEvent) => emit('header-contextmenu', cell.column, event)}>
                            {titleOf(cell.column)}
                          </th>
                        ) : (
                          <th
                            key={`${filterKeyOf(cell.column)}@${renderIndexOf(cell.column)}`}
                            scope='col'
                            rowspan={cell.rowspan > 1 ? cell.rowspan : undefined}
                            class={[
                              cell.column.labelClassName,
                              headerCellClassNameOf(r, cell.column, renderIndexOf(cell.column))
                            ]}
                            style={{
                              ...columnStyle(cell.column, renderIndexOf(cell.column)),
                              textAlign: cell.column.headerAlign || cell.column.align,
                              ...headerCellStyleOf(r, cell.column, renderIndexOf(cell.column))
                            }}
                            aria-sort={
                              kindOf(cell.column) === 'default' && cell.column.sortable
                                ? sortState.value !== null &&
                                  sortState.value.prop === fieldOf(cell.column) &&
                                  filterKeyOf(sortState.value.column) === filterKeyOf(cell.column)
                                  ? sortState.value.order === 'ascending'
                                    ? 'ascending'
                                    : 'descending'
                                  : 'none'
                                : undefined
                            }
                            onClick={(event: MouseEvent) => emit('header-click', cell.column, event)}
                            onContextmenu={(event: MouseEvent) => emit('header-contextmenu', cell.column, event)}>
                            {renderLeafHead(cell.column, renderIndexOf(cell.column))}
                            {showResizeHandle(cell.column) && (
                              <span
                                class='i-table__resize-handle'
                                role='separator'
                                tabindex={props.loading ? undefined : 0}
                                aria-orientation='horizontal'
                                aria-label={`调整${titleOf(cell.column)}列宽`}
                                aria-valuenow={resizeWidthOf(cell.column)}
                                onMousedown={(event: MouseEvent) => startResize(event, cell.column)}
                                onClick={stop}
                                onKeydown={(event: KeyboardEvent) => onResizeKeydown(event, cell.column)}
                              />
                            )}
                          </th>
                        )
                      )}
                    </tr>
                  ))}
                </thead>
              )}
              <tbody>
                {visibleRows.value.map(({ row, index, level }) => (
                  <Fragment key={key(row)}>
                    <tr
                      class={[
                        rowClassNameOf(row, index),
                        {
                          'i-table__selected': selected.value.includes(key(row)),
                          'is-current':
                            props.highlightCurrentRow && currentKey.value !== null && key(row) === currentKey.value
                        }
                      ]}
                      style={rowStyleOf(row, index)}>
                      {renderColumns.value.map((column, columnIndex) => {
                        const at = `${index}:${columnIndex}`;
                        if (spanPlan.value.skip.has(at)) return null;
                        const span = spanPlan.value.spans.get(at);
                        const kind = kindOf(column);
                        const field = fieldOf(column);
                        const control = kind === 'selection' || kind === 'expand';
                        const record = row as Record<string, unknown>;
                        const cellValue = record[field];
                        const custom =
                          kind === 'default' ? slots[field]?.({ row, column, index, $index: index }) : undefined;
                        const text =
                          custom === undefined && kind === 'default'
                            ? column.formatter?.(record, column, cellValue, index) ?? String(cellValue ?? '')
                            : undefined;
                        const overflow = kind === 'default' ? overflowOf(column) : null;
                        const defaultContent =
                          custom !== undefined ? (
                            custom
                          ) : overflow ? (
                            <Tooltip
                              content={tooltipTextOf(column, row, cellValue, index, text ?? '')}
                              placement={overflow.placement ?? 'top'}
                              offset={overflow.offset}
                              popperClass={overflow.popperClass}
                              effect={overflow.effect ?? props.tooltipEffect}>
                              <span class='i-table__cell-text'>{text}</span>
                            </Tooltip>
                          ) : (
                            text
                          );
                        const editing = isEditing(row, column);
                        const editorParams = {
                          row,
                          column,
                          value: editingDraft.value,
                          index,
                          confirm: () => confirmEdit(row, column, index),
                          cancel: () => cancelEdit(row, column, index),
                          update: (value: string) => {
                            editingDraft.value = value;
                          }
                        };
                        const cellInner = editing
                          ? slots[`${field}-edit`]?.(editorParams) ??
                            column.editor?.(editorParams) ?? (
                              <input
                                class='i-table__editor'
                                value={editingDraft.value}
                                aria-label={`编辑${titleOf(column)}`}
                                ref={(el: unknown) => {
                                  if (el instanceof HTMLInputElement) el.focus();
                                }}
                                onInput={(event: Event) => {
                                  editingDraft.value = (event.target as HTMLInputElement).value;
                                }}
                                onKeydown={(event: KeyboardEvent) => {
                                  if (event.key === 'Enter') confirmEdit(row, column, index);
                                  else if (event.key === 'Escape') cancelEdit(row, column, index);
                                }}
                                onBlur={() => confirmEdit(row, column, index)}
                                onClick={stop}
                                onDblclick={stop}
                              />
                            )
                          : defaultContent;
                        return (
                          <td
                            key={`${filterKeyOf(column)}@${columnIndex}`}
                            rowspan={span && span.rowspan > 1 ? span.rowspan : undefined}
                            colspan={span && span.colspan > 1 ? span.colspan : undefined}
                            class={[
                              column === selectionColumn ? 'i-table__selection' : undefined,
                              column.className,
                              cellClassNameOf(row, column, index, columnIndex)
                            ]}
                            style={{
                              ...columnStyle(column, columnIndex),
                              textAlign: column.align,
                              ...cellStyleOf(row, column, index, columnIndex)
                            }}
                            onClick={control ? stop : (event: MouseEvent) => onCellClick(event, row, column)}
                            onDblclick={
                              control ? stop : (event: MouseEvent) => onCellDblclick(event, row, column, index)
                            }
                            onContextmenu={
                              control ? stop : (event: MouseEvent) => onCellContextmenu(event, row, column)
                            }
                            onMouseenter={(event: MouseEvent) => onCellMouseEnter(event, row, column)}
                            onMouseleave={(event: MouseEvent) => onCellMouseLeave(event, row, column)}>
                            {kind === 'selection' ? (
                              <Checkbox
                                aria-label={`选择第 ${index + 1} 行`}
                                modelValue={selected.value.includes(key(row))}
                                indeterminate={halfKeys.value.has(key(row)) && !selected.value.includes(key(row))}
                                disabled={props.loading || !selectableOf(row, index)}
                                onChange={(checked: boolean) => onRowCheck(row, checked)}
                              />
                            ) : kind === 'index' ? (
                              indexText(column, index)
                            ) : kind === 'expand' ? (
                              <button
                                type='button'
                                class='i-table__expand-toggle'
                                aria-expanded={expandedKeys.value.includes(key(row))}
                                aria-label={expandedKeys.value.includes(key(row)) ? '收起行' : '展开行'}
                                onClick={() => toggleRowExpansion(row)}>
                                <span
                                  class={{
                                    'i-table__expand-icon': true,
                                    'is-expanded': expandedKeys.value.includes(key(row))
                                  }}
                                  aria-hidden='true'>
                                  ›
                                </span>
                              </button>
                            ) : treeActive.value && column === treeColumn.value ? (
                              <>
                                {level > 0 && (
                                  <span
                                    class='i-table__indent'
                                    style={{ width: `${level * props.indent}px` }}
                                    aria-hidden='true'
                                  />
                                )}
                                {expandableOf(row) ? (
                                  <button
                                    type='button'
                                    class='i-table__expand-toggle'
                                    disabled={loadingKeys.value.includes(key(row))}
                                    aria-expanded={expandedKeys.value.includes(key(row))}
                                    aria-label={expandedKeys.value.includes(key(row)) ? '收起子行' : '展开子行'}
                                    onClick={(event: MouseEvent) => {
                                      event.stopPropagation();
                                      toggleTreeNode(row);
                                    }}>
                                    {loadingKeys.value.includes(key(row)) ? (
                                      '…'
                                    ) : (
                                      <span
                                        class={{
                                          'i-table__expand-icon': true,
                                          'is-expanded': expandedKeys.value.includes(key(row))
                                        }}
                                        aria-hidden='true'>
                                        ›
                                      </span>
                                    )}
                                  </button>
                                ) : (
                                  <span class='i-table__tree-placeholder' aria-hidden='true' />
                                )}
                                {cellInner}
                              </>
                            ) : (
                              cellInner
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {(props.preserveExpandedContent || expandedKeys.value.includes(key(row))) &&
                      expandColumns.value.map((column, i) => {
                        const field = fieldOf(column);
                        const expanded = expandedKeys.value.includes(key(row));
                        return (
                          <tr
                            key={`${String(key(row))}__expand_${i}`}
                            class='i-table__expanded-row'
                            style={props.preserveExpandedContent && !expanded ? { display: 'none' } : undefined}>
                            <td colspan={renderColumns.value.length}>
                              {slots[field]?.({ row, column, index, $index: index }) ??
                                (field ? String((row as Record<string, unknown>)[field] ?? '') : '')}
                            </td>
                          </tr>
                        );
                      })}
                  </Fragment>
                ))}
                {!visibleRows.value.length && !props.loading && (
                  <tr>
                    <td class='i-table__empty' colspan={renderColumns.value.length}>
                      {slots.empty?.() ?? <Empty description={props.emptyText} />}
                    </td>
                  </tr>
                )}
              </tbody>
              {props.showSummary && (
                <tfoot>
                  <tr class='i-table__summary'>
                    {renderColumns.value.map((column, columnIndex) => {
                      if (column === selectionColumn)
                        return <td key='__summary_selection' class='i-table__selection' />;
                      const i = columnIndex - (hasPseudoSelection.value ? 1 : 0);
                      return <td key={`${filterKeyOf(column)}@${columnIndex}`}>{sums.value[i] ?? ''}</td>;
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
            {slots.append?.()}
          </div>
        </Loading>
      </div>
    );
  }
});
