import {
  computed, defineComponent, mergeProps, nextTick, onBeforeUnmount, onMounted, ref, shallowReactive, watch, withDirectives,
  type CSSProperties, type ObjectDirective, type PropType
} from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import type {
  TableV2CellParams,
  TableV2Column,
  TableV2DataGetterParams,
  TableV2ElementProps,
  TableV2HeaderCellParams,
  TableV2HeaderParams,
  TableV2Key,
  TableV2RowEventHandlers,
  TableV2RowExpandParams,
  TableV2RowHeight,
  TableV2RowParams,
  TableV2RowsRenderedParams,
  TableV2ScrollOptions,
  TableV2ScrollStrategy,
  TableV2SortBy,
  TableV2SortOrder,
  TableV2SortState
} from './types';

const columnKey = (column: TableV2Column, index: number) => column.key ?? column.dataKey ?? index;
const isSortOrder = (order: unknown): order is TableV2SortBy['order'] => order === 'asc' || order === 'desc';
const resolveProps = <T,>(option: TableV2ElementProps<T> | undefined, context: T) =>
  typeof option === 'function' ? option(context) : option;

function readCellData(context: TableV2DataGetterParams): unknown {
  const { column, rowData } = context;
  if (column.dataGetter) return column.dataGetter(context);
  const key = column.dataKey;
  if (key === undefined) return undefined;
  const row = rowData as Record<TableV2Key, unknown>;
  if (typeof key !== 'string' || key in row) return row[key];
  const parts = key.startsWith('.') ? [''] : [];
  // 点号与方括号路径保留空键，带引号的键可以转义。
  const tokens = key.matchAll(/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g);
  for (const [token, number, quote, text] of tokens) {
    parts.push(quote ? text.replace(/\\(.)/g, '$1') : number ?? token);
  }
  if (!parts.length) return undefined;
  return parts.reduce<unknown>((value, part) => (value as Record<string, unknown> | undefined)?.[part], row);
}

const tableV2Emits = {
  columnSort: ({ order }: { key: TableV2Key; order: TableV2SortOrder }) => order === null || isSortOrder(order),
  rowExpand: ({ expanded }: TableV2RowExpandParams) => typeof expanded === 'boolean',
  expandedRowsChange: (keys: TableV2Key[]) => Array.isArray(keys),
  expandedRowDataChange: (rows: object[], keys: TableV2Key[]) => Array.isArray(rows) && Array.isArray(keys),
  rowsRendered: ({ rowCacheStart, rowCacheEnd }: TableV2RowsRenderedParams) => rowCacheEnd >= rowCacheStart,
  endReached: (remainDistance: number) => Number.isFinite(remainDistance)
};

export default defineComponent({
  name: 'i-table-v2',
  props: {
    columns: { type: Array as PropType<TableV2Column[]>, default: () => [] },
    data: { type: Array as PropType<object[]>, default: () => [] },
    fixedData: Array as PropType<object[]>,
    width: { type: [String, Number] as PropType<string | number>, default: '100%' },
    height: { type: Number, default: 400 },
    headerHeight: { type: [Number, Array] as PropType<number | number[]>, default: 50 },
    footerHeight: { type: Number, default: 0 },
    rowHeight: { type: [Number, Function] as PropType<TableV2RowHeight>, default: 50 },
    estimatedRowHeight: Number,
    rowKey: { type: [String, Function] as PropType<string | ((row: object) => TableV2Key)>, default: 'id' },
    expandedRowKeys: Array as PropType<TableV2Key[]>,
    defaultExpandedRowKeys: { type: Array as PropType<TableV2Key[]>, default: () => [] },
    expandColumnKey: [String, Number, Symbol] as PropType<TableV2Key>,
    childrenKey: { type: String, default: 'children' },
    sortBy: { type: Object as PropType<TableV2SortBy>, default: undefined },
    filter: { type: Function as PropType<(rowData: object) => boolean>, default: undefined },
    rowEventHandlers: { type: Object as PropType<TableV2RowEventHandlers>, default: undefined },
    overscan: { type: Number, default: 3 },
    cache: { type: Number, default: undefined },
    sortState: Object as PropType<TableV2SortBy | TableV2SortState>,
    headerClass: [String, Function] as PropType<string | ((params: TableV2HeaderParams) => string)>,
    rowClass: [String, Function] as PropType<string | ((params: TableV2RowParams) => string)>,
    headerProps: [Object, Function] as PropType<TableV2ElementProps<TableV2HeaderParams>>,
    headerCellProps: [Object, Function] as PropType<TableV2ElementProps<TableV2HeaderCellParams>>,
    rowProps: [Object, Function] as PropType<TableV2ElementProps<TableV2RowParams>>,
    cellProps: [Object, Function] as PropType<TableV2ElementProps<TableV2CellParams>>,
    useIsScrolling: Boolean,
    emptyText: { type: String, default: '暂无数据' },
    /** 前（后）N 列自动视为固定列，列级 fixed 声明优先 */
    fixedColumns: { type: Number, default: 0 },
    fixedColumnsMode: { type: String as PropType<'left' | 'right'>, default: 'left' }
  },
  emits: {
    ...tableV2Emits,
    'column-sort': tableV2Emits.columnSort,
    'update:expandedRowKeys': (keys: TableV2Key[]) => Array.isArray(keys),
    'row-expand': tableV2Emits.rowExpand,
    'expanded-rows-change': tableV2Emits.expandedRowsChange,
    'expanded-row-data-change': tableV2Emits.expandedRowDataChange,
    scroll: ({ scrollLeft, scrollTop }: { scrollLeft: number; scrollTop: number }) =>
      Number.isFinite(scrollLeft) && Number.isFinite(scrollTop),
    'rows-rendered': tableV2Emits.rowsRendered,
    'end-reached': tableV2Emits.endReached
  },
  setup(props, { emit, slots, expose }) {
    const ns = useNamespace('table-v2');
    const key = (row: object) =>
      typeof props.rowKey === 'function'
        ? props.rowKey(row)
        : (row as Record<string, TableV2Key>)[props.rowKey];
    const toPx = (value: string | number | undefined) =>
      value === undefined ? undefined : typeof value === 'number' ? `${value}px` : value;
    const totalWidth = computed(() => props.columns.reduce((n, c) => n + c.width, 0));
    const expandKey = computed(() => props.expandColumnKey ?? (props.columns.length ? columnKey(props.columns[0], 0) : undefined));
    const localExpandedKeys = ref<TableV2Key[]>([...props.defaultExpandedRowKeys]);
    const expandedKeys = computed(() => props.expandedRowKeys ?? localExpandedKeys.value);
    const childRowsOf = (row: object): object[] => {
      const value = (row as Record<string, unknown>)[props.childrenKey];
      return Array.isArray(value) ? (value as object[]) : [];
    };
    const toggleExpand = (rowData: object, rowIndex: number) => {
      const rowKey = key(rowData);
      const expanded = !expandedKeys.value.includes(rowKey);
      const keys = expanded ? [...expandedKeys.value, rowKey] : expandedKeys.value.filter((id) => id !== rowKey);
      if (props.expandedRowKeys === undefined) localExpandedKeys.value = keys;
      emit('update:expandedRowKeys', keys);
      emit('row-expand', { expanded, rowData, rowIndex, rowKey });
      emit('expanded-rows-change', keys);
      emit('expanded-row-data-change', props.data.filter((row) => keys.includes(key(row))), keys);
    };

    // 排序与过滤（作用于根行；sortState 受控优先）
    const sortState = ref({ orders: new Map<TableV2Key, TableV2SortBy['order']>(), byPropertyKey: false });
    watch(
      () => props.sortState ?? props.sortBy,
      (value) => {
        const orders = new Map<TableV2Key, TableV2SortBy['order']>();
        let byPropertyKey = false;
        const keys = value ? Reflect.ownKeys(value) : [];
        const isSingle = props.sortState === undefined || (keys.length === 2 && keys.includes('key') && keys.includes('order'));
        if (value && isSingle && 'key' in value && isSortOrder(value.order)) {
          orders.set((value as TableV2SortBy).key, value.order);
        } else if (value && props.sortState !== undefined) {
          byPropertyKey = true;
          const state = value as TableV2SortState;
          for (const key of keys) {
            const order = state[key];
            if (isSortOrder(order)) orders.set(key, order);
          }
        }
        sortState.value = { orders, byPropertyKey };
      },
      { deep: true, immediate: true }
    );
    // 排序映射沿用对象属性键规则，单列显式排序保留列键的原始类型。
    const sortKey = (key: TableV2Key) => sortState.value.byPropertyKey && typeof key === 'number' ? String(key) : key;
    const columnKeys = computed(() => props.columns.map(columnKey));
    const currentSortKeys = computed(() => columnKeys.value.map(sortKey));
    watch(columnKeys, (keys, previous) => {
      const current = keys.map(sortKey);
      for (const key of previous.map(sortKey)) {
        if (!current.includes(key)) sortState.value.orders.delete(key);
      }
    });
    const orderOf = (key: TableV2Key) => sortState.value.orders.get(sortKey(key));
    const cycleSort = (column: TableV2Column, key: TableV2Key) => {
      if (!column.sortable) return;
      const order = orderOf(key);
      const next: TableV2SortOrder = order === 'asc' ? 'desc' : order === 'desc' ? null : 'asc';
      sortState.value = { orders: new Map(next === null ? [] : [[key, next]]), byPropertyKey: false };
      emit('column-sort', { key, order: next });
    };
    const compareValues = (a: unknown, b: unknown): number => {
      const x = a ?? '';
      const y = b ?? '';
      if (x === y) return 0;
      if (typeof x === 'number' && typeof y === 'number') return x - y;
      return String(x) < String(y) ? -1 : 1;
    };
    const viewRows = computed(() => {
      const rows = props.filter ? props.data.filter(props.filter) : [...props.data];
      const activeSort = [...sortState.value.orders].find(([key]) => currentSortKeys.value.includes(key));
      if (!activeSort) return rows;
      const columnIndex = currentSortKeys.value.indexOf(activeSort[0]);
      const columns = props.columns;
      const column = columns[columnIndex];
      const direction = activeSort[1] === 'desc' ? -1 : 1;
      return rows
        .map((rowData, rowIndex) => ({
          rowData,
          rowIndex,
          value: readCellData({ columns, column, columnIndex, rowData, rowIndex })
        }))
        .sort((a, b) => {
          const diff = compareValues(a.value, b.value);
          return diff !== 0 ? diff * direction : a.rowIndex - b.rowIndex;
        })
        .map((item) => item.rowData);
    });

    // 扁平化（含树）
    interface FlatRow {
      rowData: object;
      rowIndex: number;
      level: number;
    }
    type BodyRow = FlatRow & { rowKey: TableV2Key };
    const flatRows = computed<BodyRow[]>(() => {
      const out: BodyRow[] = [];
      const walk = (rows: object[], level: number) => {
        if (level > 100) return;
        rows.forEach((row) => {
          const rowKey = key(row);
          out.push({ rowData: row, rowIndex: out.length, level, rowKey });
          if (expandedKeys.value.includes(rowKey)) {
            const children = childRowsOf(row);
            if (children.length) walk(children, level + 1);
          }
        });
      };
      walk(viewRows.value, 0);
      return out;
    });

    // 虚拟窗口（支持动态行高：前缀和 + 二分查找）
    const overscan = computed(() => props.cache ?? props.overscan);
    const scrollEl = ref<HTMLDivElement | null>(null);
    const scrollTop = ref(0);
    const scrollWidth = ref(0);
    const estimatedHeight = computed(() => {
      const estimate = props.estimatedRowHeight;
      return estimate !== undefined && Number.isFinite(estimate) && estimate > 0 ? estimate : undefined;
    });
    const measurementLayout = computed(() => ({
      width: props.width,
      viewportWidth: scrollWidth.value,
      columns: props.columns.map((column) => ({ ...column })),
      expandKey: expandKey.value,
      enabled: estimatedHeight.value !== undefined
    }));
    type Measurement = { row: BodyRow; layout: typeof measurementLayout.value; height: number };
    const measurements = shallowReactive(new Map<TableV2Key, Measurement>());
    const sameRow = (previous: BodyRow, current: BodyRow) => previous.rowData === current.rowData &&
      previous.rowIndex === current.rowIndex && previous.level === current.level;
    const measuredHeight = (row: BodyRow) => {
      const measurement = measurements.get(row.rowKey);
      return measurement && measurement.layout === measurementLayout.value && sameRow(measurement.row, row)
        ? measurement.height : undefined;
    };
    watch([flatRows, measurementLayout], ([rows, layout], [, previousLayout]) => {
      if (layout !== previousLayout) measurements.clear();
      else if (measurements.size) {
        const currentRows = new Map(rows.map((row) => [row.rowKey, row]));
        for (const [key, measurement] of measurements) {
          const row = currentRows.get(key);
          if (!row || !sameRow(measurement.row, row)) measurements.delete(key);
        }
      }
    });
    const headerHeights = computed(() => Array.isArray(props.headerHeight) ? props.headerHeight : [props.headerHeight]);
    const heightOf = (rowData: object, rowIndex: number) => typeof props.rowHeight === 'function'
      ? Math.max(1, props.rowHeight({ rowData, rowIndex }))
      : props.rowHeight;
    const fixedRows = computed(() => (props.fixedData ?? []).map((rowData, index) => {
      const rowIndex = -(index + 1);
      return { rowData, rowIndex, level: 0, height: heightOf(rowData, rowIndex) };
    }));
    const pinnedHeight = computed(() => headerHeights.value.reduce((sum, height) => sum + height, 0)
      + fixedRows.value.reduce((sum, row) => sum + row.height, 0));
    const scrollHeight = ref(0);
    const bodyViewportHeight = computed(() => Math.max(0,
      (scrollHeight.value || props.height) - pinnedHeight.value - Math.max(0, props.footerHeight)
    ));
    const syncViewport = () => {
      scrollHeight.value = scrollEl.value?.clientHeight ?? 0;
      if (estimatedHeight.value !== undefined) scrollWidth.value = scrollEl.value?.clientWidth ?? 0;
    };
    let scrollObserver: ResizeObserver | undefined;
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    const isScrolling = ref(false);
    // 窗口坐标可能先于原生 scroll 事件更新，单独保存方向基准。
    let scrollDirectionTop = 0;
    let wasAtEnd = false;
    const totalBodyHeight = computed(() => rowTops.value[rowTops.value.length - 1] ?? 0);
    const onScroll = (event: Event) => {
      const el = event.target as HTMLDivElement;
      syncViewport();
      const movingDown = el.scrollTop > scrollDirectionTop;
      scrollDirectionTop = el.scrollTop;
      scrollTop.value = scrollDirectionTop;
      if (props.useIsScrolling) {
        isScrolling.value = true;
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => { isScrolling.value = false; }, 150);
      }
      emit('scroll', { scrollLeft: el.scrollLeft, scrollTop: el.scrollTop });
      const remainDistance = Math.max(0, totalBodyHeight.value - el.scrollTop - bodyViewportHeight.value);
      if (remainDistance > 1) wasAtEnd = false;
      else if (movingDown && !wasAtEnd && rowRange.value) {
        wasAtEnd = true;
        emit('end-reached', remainDistance);
      }
    };
    const rowHeights = computed(() => {
      const estimate = estimatedHeight.value;
      return flatRows.value.map((row) => estimate === undefined
        ? heightOf(row.rowData, row.rowIndex)
        : measuredHeight(row) ?? estimate);
    });
    const rowTops = computed(() => {
      const tops: number[] = [0];
      rowHeights.value.forEach((h) => tops.push(tops[tops.length - 1] + h));
      return tops;
    });
    watch(totalBodyHeight, () => { wasAtEnd = false; });
    const rowAt = (y: number, includeBoundary = false, tops = rowTops.value) => {
      let lo = 0;
      let hi = tops.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const bottom = tops[mid + 1];
        if (bottom < y || (!includeBoundary && bottom === y)) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    };
    let pendingAnchorTop: number | undefined;
    watch([rowTops, flatRows], ([tops, rows], [previousTops, previousRows]) => {
      const el = scrollEl.value;
      if (estimatedHeight.value === undefined || !el || !previousRows.length || !rows.length) return;
      // 同一 Vue 更新可能产生多个前缀和版本，后续版本以待提交的坐标为准。
      const current = pendingAnchorTop ?? el.scrollTop;
      if (current === 0) return;
      const previousIndex = Math.min(previousRows.length - 1, rowAt(current, false, previousTops));
      const index = rows === previousRows ? previousIndex : rows.findIndex((row) => row.rowKey === previousRows[previousIndex].rowKey);
      const nextIndex = index >= 0 ? index : Math.min(previousIndex, rows.length - 1);
      const offset = Math.min(current - previousTops[previousIndex], Math.max(0, tops[nextIndex + 1] - tops[nextIndex] - 1));
      const top = Math.max(0, Math.min(tops[nextIndex] + offset, tops[rows.length] - bodyViewportHeight.value));
      if (top === current) return;
      if (pendingAnchorTop === undefined) {
        void nextTick(() => {
          const target = pendingAnchorTop;
          pendingAnchorTop = undefined;
          if (target === undefined || scrollEl.value !== el) return;
          const before = el.scrollTop;
          el.scrollTop = target;
          scrollTop.value = el.scrollTop;
          // 仅扣除自动补偿的位移，保留尚未派发的主动滚动。
          scrollDirectionTop += el.scrollTop - before;
        });
      }
      pendingAnchorTop = top;
      scrollTop.value = top;
    });
    const rowRange = computed<TableV2RowsRenderedParams | undefined>(() => {
      const last = flatRows.value.length - 1;
      if (last < 0 || bodyViewportHeight.value === 0) return;
      const rowVisibleStart = Math.min(last, rowAt(scrollTop.value));
      const rowVisibleEnd = Math.min(last, rowAt(scrollTop.value + bodyViewportHeight.value, true));
      const cache = Math.max(0, Math.floor(overscan.value));
      return {
        rowVisibleStart,
        rowVisibleEnd,
        rowCacheStart: Math.max(0, rowVisibleStart - cache),
        rowCacheEnd: Math.min(last, rowVisibleEnd + cache)
      };
    });
    const windowRows = computed(() => {
      const range = rowRange.value;
      return range ? flatRows.value.slice(range.rowCacheStart, range.rowCacheEnd + 1) : [];
    });
    const observedRows = new Map<HTMLElement, { row: BodyRow; contents: Element[] }>();
    const observedContents = new Map<Element, HTMLElement>();
    const pendingMeasurements = new Set<HTMLElement>();
    let rowObserver: ResizeObserver | undefined;
    const blockSpacing = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth]
        .reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    };
    const measureRows = (elements: Iterable<HTMLElement>) => {
      for (const element of elements) {
        const observed = observedRows.get(element);
        const row = observed?.row;
        // 虚拟窗口切换后，观察器仍可能传来旧节点的通知。
        if (!observed || !row || flatRows.value[row.rowIndex] !== row || !rowObserver || !element.getClientRects().length) continue;
        const contentHeight = Math.max(0, ...observed.contents.map((content) =>
          (parseFloat(getComputedStyle(content).height) || 0) + (content.parentElement ? blockSpacing(content.parentElement) : 0)
        ));
        const height = contentHeight + blockSpacing(element);
        if (height > 0 && height !== measuredHeight(row)) {
          measurements.set(row.rowKey, { row, height, layout: measurementLayout.value });
        }
      }
    };
    const unobserveRow = (element: HTMLElement) => {
      for (const content of observedRows.get(element)?.contents ?? []) {
        rowObserver?.unobserve(content);
        observedContents.delete(content);
      }
      observedRows.delete(element);
      pendingMeasurements.delete(element);
    };
    const syncRowObservation = (element: HTMLElement, { value: row }: { value?: BodyRow }) => {
      if (!row) {
        unobserveRow(element);
        return;
      }
      if (typeof ResizeObserver === 'undefined') return;
      rowObserver ??= new ResizeObserver((entries) => {
        const rows = new Set<HTMLElement>();
        for (const { target } of entries) {
          const element = observedContents.get(target);
          if (element) rows.add(element);
        }
        measureRows(rows);
      });
      const previous = observedRows.get(element)?.contents ?? [];
      const cellClass = ns.e('cell');
      const measureClass = ns.e('measure');
      const contents: Element[] = [];
      for (const cell of element.children) {
        if (!cell.classList.contains(cellClass)) continue;
        for (const content of cell.children) {
          if (content.classList.contains(measureClass)) contents.push(content);
        }
      }
      for (const content of previous) {
        if (!contents.includes(content)) {
          rowObserver.unobserve(content);
          observedContents.delete(content);
        }
      }
      for (const content of contents) {
        if (!observedContents.has(content)) {
          observedContents.set(content, element);
          rowObserver.observe(content, { box: 'border-box' });
        }
      }
      observedRows.set(element, { row, contents });
      // 行与单元格的内边距和边框可以改变，而测量包装层保持原高。
      if (!pendingMeasurements.size) queueMicrotask(() => {
        measureRows(pendingMeasurements);
        pendingMeasurements.clear();
      });
      pendingMeasurements.add(element);
    };
    const measureRow: ObjectDirective<HTMLElement, BodyRow | undefined> = {
      mounted: syncRowObservation,
      updated: syncRowObservation,
      beforeUnmount: unobserveRow
    };
    let renderedRange: TableV2RowsRenderedParams | undefined;
    const emitRowsRendered = () => {
      const range = rowRange.value;
      if (range && (!renderedRange || renderedRange.rowCacheStart !== range.rowCacheStart ||
        renderedRange.rowCacheEnd !== range.rowCacheEnd || renderedRange.rowVisibleStart !== range.rowVisibleStart ||
        renderedRange.rowVisibleEnd !== range.rowVisibleEnd)) emit('rows-rendered', { ...range });
      renderedRange = range;
    };
    watch(rowRange, emitRowsRendered, { flush: 'post' });
    onMounted(() => {
      if (scrollEl.value && typeof ResizeObserver !== 'undefined') {
        scrollObserver = new ResizeObserver(syncViewport);
        scrollObserver.observe(scrollEl.value);
      }
      syncViewport();
      emitRowsRendered();
    });
    onBeforeUnmount(() => {
      scrollObserver?.disconnect();
      rowObserver?.disconnect();
      rowObserver = undefined;
      clearTimeout(scrollTimer);
    });

    const fireRowEvent = (name: keyof TableV2RowEventHandlers, rowData: object, rowIndex: number, event: Event) =>
      props.rowEventHandlers?.[name]?.({ rowData, rowIndex, rowKey: key(rowData), event });

    const scrollTo = (options?: TableV2ScrollOptions) => {
      const el = scrollEl.value;
      if (!el || !options) return;
      const top = options.scrollTop ?? options.top;
      const left = options.scrollLeft ?? options.left;
      if (top !== undefined) {
        el.scrollTop = top;
        if (pendingAnchorTop !== undefined) {
          pendingAnchorTop = undefined;
          scrollTop.value = el.scrollTop;
        }
      }
      if (left !== undefined) el.scrollLeft = left;
    };
    expose({
      scrollTo,
      scrollToLeft: (scrollLeft: number) => scrollTo({ scrollLeft }),
      scrollToTop: (scrollTop: number) => scrollTo({ scrollTop }),
      scrollToRow: (rowIndex: number, strategy: TableV2ScrollStrategy = 'auto') => {
        const el = scrollEl.value;
        if (!el || !Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= flatRows.value.length) return;
        syncViewport();
        const viewport = bodyViewportHeight.value;
        const current = el.scrollTop;
        const max = Math.max(0, el.scrollHeight ? el.scrollHeight - el.clientHeight : totalBodyHeight.value - viewport);
        const rowTop = rowTops.value[rowIndex];
        const rowBottom = rowTops.value[rowIndex + 1];
        const start = Math.min(max, rowTop);
        const end = Math.max(0, rowBottom - viewport);
        if (strategy === 'smart') strategy = current >= end - viewport && current <= start + viewport ? 'auto' : 'center';
        let top = current;
        if (strategy === 'start') top = start;
        else if (strategy === 'end') top = end;
        else if (strategy === 'center') {
          const centeredTop = Math.round((rowTop + rowBottom - viewport) / 2);
          top = Math.max(0, Math.min(max, centeredTop));
        }
        else if (end > start || current < end) top = end;
        else if (current > start) top = start;
        scrollTo({ scrollTop: top });
      }
    });

    const cellStyle = (column: TableV2Column): CSSProperties => ({
      width: `${column.width}px`,
      minWidth: `${column.width}px`,
      textAlign: column.align ?? 'left'
    });
    // 列级 fixed 声明优先；fixedColumns 按模式自动把前/后 N 列视为固定列。
    const fixedSideOf = (column: TableV2Column, index: number): 'left' | 'right' | undefined => {
      if (column.fixed === true) return 'left';
      if (column.fixed === 'left' || column.fixed === 'right') return column.fixed;
      const total = props.columns.length;
      if (props.fixedColumns > 0) {
        if (props.fixedColumnsMode === 'right' && index >= total - props.fixedColumns) return 'right';
        if (props.fixedColumnsMode === 'left' && index < props.fixedColumns) return 'left';
      }
      return undefined;
    };
    const cellFixedStyle = (column: TableV2Column, index: number, header: boolean): CSSProperties => {
      const side = fixedSideOf(column, index);
      if (!side) return {};
      const cols = props.columns;
      const offset =
        side === 'left'
          ? cols
              .slice(0, index)
              .reduce((n, c, i) => n + (fixedSideOf(c, i) === 'left' ? c.width : 0), 0)
          : cols
              .slice(index + 1)
              .reduce((n, c, i) => n + (fixedSideOf(c, index + 1 + i) === 'right' ? c.width : 0), 0);
      const style: CSSProperties = {
        position: 'sticky',
        zIndex: header ? 3 : 1,
        background: `var(${ns.cssVarName(header ? 'bg-subtle' : 'bg')})`
      };
      style[side] = `${offset}px`;
      return style;
    };

    const renderHeader = (height: number, headerIndex: number) => {
      const columns = props.columns;
      const context = { columns, headerIndex };
      const sortStateMap = Object.fromEntries(sortState.value.orders);
      const cells = columns.map((column, columnIndex) => {
        const cellKey = columnKey(column, columnIndex);
        const order = orderOf(cellKey);
        const style = { ...cellStyle(column), ...cellFixedStyle(column, columnIndex, true) };
        const cellContext = { ...context, column, columnIndex };
        const rendererContext = {
          ...cellContext,
          class: ns.e('header-cell-text'),
          style,
          sortBy: props.sortBy,
          sortState: sortStateMap
        };
        return (
          <div {...mergeProps(resolveProps(props.headerCellProps, cellContext) ?? {}, {
            key: cellKey,
            class: [ns.e('cell'), 'is-header'],
            role: 'columnheader',
            tabindex: column.sortable ? 0 : undefined,
            style,
            'aria-sort': column.sortable ? order === 'asc' ? 'ascending' : order === 'desc' ? 'descending' : 'none' : undefined,
            onClick: () => cycleSort(column, cellKey),
            onKeydown: (event: KeyboardEvent) => {
              if (column.sortable && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                cycleSort(column, cellKey);
              }
            }
          })}>
            {column.headerCellRenderer
              ? column.headerCellRenderer(rendererContext)
              : slots['header-cell']?.(rendererContext) ?? column.title ?? String(cellKey)}
            {column.sortable && <span aria-hidden='true'>{order === 'asc' ? '↑' : order === 'desc' ? '↓' : '↕'}</span>}
          </div>
        );
      });
      return (
        <div {...mergeProps(resolveProps(props.headerProps, context) ?? {}, {
          key: headerIndex,
          class: [ns.e('row'), typeof props.headerClass === 'function' ? props.headerClass(context) : props.headerClass],
          role: 'row',
          style: { width: toPx(totalWidth.value), height: toPx(height) }
        })}>
          {slots.header?.({ ...context, cells }) ?? cells}
        </div>
      );
    };

    const renderRow = (row: FlatRow | BodyRow, height: number, top?: number) => {
      const { rowData, rowIndex, level } = row;
      const columns = props.columns;
      const context = { columns, rowData, rowIndex };
      const rowKey = 'rowKey' in row ? row.rowKey : key(rowData);
      const isFixed = rowIndex < 0;
      const dynamic = !isFixed && estimatedHeight.value !== undefined;
      const expanded = expandedKeys.value.includes(rowKey);
      const extra = resolveProps(props.rowProps, context);
      const style: CSSProperties = { width: toPx(totalWidth.value), height: toPx(height) };
      if (!isFixed) {
        style.position = 'absolute';
        style.left = '0px';
        style.top = toPx(top);
      }
      const node = (
        <div {...mergeProps(extra ?? {}, {
          key: rowKey,
          class: [
            ns.e('row'),
            isFixed ? 'is-fixed' : 'is-body',
            typeof props.rowClass === 'function' ? props.rowClass(context) : props.rowClass
          ],
          role: 'row',
          style,
          onClick: (event: MouseEvent) => fireRowEvent('onClick', rowData, rowIndex, event),
          onDblclick: (event: MouseEvent) => fireRowEvent('onDblclick', rowData, rowIndex, event),
          onContextmenu: (event: MouseEvent) => fireRowEvent('onContextmenu', rowData, rowIndex, event),
          onMouseenter: (event: MouseEvent) => fireRowEvent('onMouseenter', rowData, rowIndex, event),
          onMouseleave: (event: MouseEvent) => fireRowEvent('onMouseleave', rowData, rowIndex, event)
        })}>
          {columns.map((column, columnIndex) => {
            const cellKey = columnKey(column, columnIndex);
            const isExpandCell = !isFixed && cellKey === expandKey.value;
            const showToggle = isExpandCell && childRowsOf(rowData).length > 0;
            const getterContext = { ...context, column, columnIndex };
            const cellData = readCellData(getterContext);
            const cellContext = { ...getterContext, cellData };
            const rendererContext = {
              ...cellContext,
              class: ns.e('cell-text'),
              isScrolling: props.useIsScrolling ? isScrolling.value : undefined
            };
            const treeControls = (
              <>
                {isExpandCell && level > 0 && (
                  <span class={ns.e('indent')} style={{ width: toPx(level * 16) }} aria-hidden='true' />
                )}
                {isExpandCell && (
                  showToggle ? (
                    <button
                      type='button'
                      class={ns.e('expand-toggle')}
                      aria-expanded={expanded}
                      aria-label={expanded ? '收起子行' : '展开子行'}
                      onClick={(event: MouseEvent) => {
                        event.stopPropagation();
                        toggleExpand(rowData, rowIndex);
                      }}>
                      <span class={{ [ns.e('expand-icon')]: true, 'is-expanded': expanded }} aria-hidden='true'>›</span>
                    </button>
                  ) : <span class={ns.e('tree-placeholder')} aria-hidden='true' />
                )}
              </>
            );
            const content = column.cellRenderer ? column.cellRenderer(rendererContext) : slots.cell?.(rendererContext) ?? String(cellData ?? '');
            return (
              <div {...mergeProps(resolveProps(props.cellProps, cellContext) ?? {}, {
                key: cellKey,
                class: ns.e('cell'),
                role: 'gridcell',
                style: { ...cellStyle(column), ...cellFixedStyle(column, columnIndex, false) }
              })}>
                {dynamic
                  ? <div class={ns.e('measure')}>{treeControls}<div class={ns.e('measure-content')}>{content}</div></div>
                  : <>{treeControls}{content}</>}
              </div>
            );
          })}
        </div>
      );
      return 'rowKey' in row ? withDirectives(node, [[measureRow, dynamic ? row : undefined]]) : node;
    };

    return () => (
      <div
        class={ns.b()}
        style={{ width: toPx(props.width), height: toPx(props.height) }}
        role='grid'
        aria-rowcount={flatRows.value.length + fixedRows.value.length}
        aria-colcount={props.columns.length}>
        <div class={[ns.e('scroll'), { 'is-dynamic': estimatedHeight.value !== undefined }]} ref={scrollEl} onScroll={onScroll}>
          <div class={ns.e('header')} role='rowgroup'>
            {headerHeights.value.map(renderHeader)}
            {fixedRows.value.map((row) => renderRow(row, row.height))}
          </div>
          <div class={ns.e('body')} style={{ height: toPx(totalBodyHeight.value) }}>
            {windowRows.value.map((row) => renderRow(row, rowHeights.value[row.rowIndex], rowTops.value[row.rowIndex]))}
            {!flatRows.value.length && !fixedRows.value.length && (
              <div class={ns.e('empty')}>{slots.empty?.() ?? props.emptyText}</div>
            )}
          </div>
          {props.footerHeight > 0 && (
            <div class={ns.e('footer')} style={{ height: toPx(props.footerHeight) }}>
              {slots.footer?.()}
            </div>
          )}
        </div>
        {slots.overlay && <div class={ns.e('overlay')}>{slots.overlay()}</div>}
      </div>
    );
  }
});
