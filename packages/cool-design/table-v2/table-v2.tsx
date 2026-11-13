import { computed, defineComponent, ref, watch, type CSSProperties, type PropType } from 'vue';
import type {
  TableV2CellProps,
  TableV2Column,
  TableV2RowEventHandlers,
  TableV2RowHeight,
  TableV2SortBy,
  TableV2SortOrder
} from './types';

export default defineComponent({
  name: 'i-table-v2',
  props: {
    columns: { type: Array as PropType<TableV2Column[]>, default: () => [] },
    data: { type: Array as PropType<object[]>, default: () => [] },
    width: { type: [String, Number] as PropType<string | number>, default: '100%' },
    height: { type: Number, default: 400 },
    headerHeight: { type: Number, default: 40 },
    footerHeight: { type: Number, default: 0 },
    rowHeight: { type: [Number, Function] as PropType<TableV2RowHeight>, default: 40 },
    rowKey: { type: [String, Function] as PropType<string | ((row: object) => string | number)>, default: 'id' },
    expandedRowKeys: { type: Array as PropType<Array<string | number>>, default: undefined },
    expandColumnKey: { type: String, default: undefined },
    childrenKey: { type: String, default: 'children' },
    sortBy: { type: Object as PropType<TableV2SortBy>, default: undefined },
    filter: { type: Function as PropType<(rowData: object) => boolean>, default: undefined },
    rowEventHandlers: { type: Object as PropType<TableV2RowEventHandlers>, default: undefined },
    overscan: { type: Number, default: 3 },
    cache: { type: Number, default: undefined },
    sortState: { type: Object as PropType<TableV2SortBy>, default: undefined },
    rowClass: {
      type: [String, Function] as PropType<string | ((params: { rowData: object; rowIndex: number }) => string)>,
      default: undefined
    },
    cellProps: {
      type: Function as PropType<
        (params: { rowData: object; column: TableV2Column; rowIndex: number }) => TableV2CellProps | undefined
      >,
      default: undefined
    },
    emptyText: { type: String, default: '暂无数据' }
  },
  emits: ['column-sort', 'expanded-rows-change', 'scroll', 'end-reached'],
  setup(props, { emit, slots, expose }) {
    const key = (row: object) =>
      typeof props.rowKey === 'function'
        ? props.rowKey(row)
        : ((row as Record<string, unknown>)[props.rowKey] as string | number);
    const toPx = (value: string | number | undefined) =>
      value === undefined ? undefined : typeof value === 'number' ? `${value}px` : value;
    const totalWidth = computed(() => props.columns.reduce((n, c) => n + c.width, 0));
    const expandKey = computed(() => props.expandColumnKey ?? props.columns[0]?.key);

    // 展开（受控兼容：外部 keys 变化时同步）
    const expandedKeys = ref<Array<string | number>>([...(props.expandedRowKeys ?? [])]);
    watch(
      () => props.expandedRowKeys,
      (value) => {
        expandedKeys.value = [...(value ?? [])];
      },
      { deep: true }
    );
    const childRowsOf = (row: object): object[] => {
      const value = (row as Record<string, unknown>)[props.childrenKey];
      return Array.isArray(value) ? (value as object[]) : [];
    };
    const expandedRowsOf = (rows: object[]): object[] => rows.filter((row) => expandedKeys.value.includes(key(row)));
    const toggleExpand = (row: object) => {
      const k = key(row);
      expandedKeys.value = expandedKeys.value.includes(k)
        ? expandedKeys.value.filter((id) => id !== k)
        : [...expandedKeys.value, k];
      emit('expanded-rows-change', expandedRowsOf(props.data), [...expandedKeys.value]);
    };

    // 排序与过滤（作用于根行；sortState 受控优先）
    const sortState = ref<{ key: string; order: 'asc' | 'desc' } | null>(
      props.sortState ? { ...props.sortState } : props.sortBy ? { ...props.sortBy } : null
    );
    watch(
      () => props.sortState,
      (value) => {
        sortState.value = value ? { ...value } : null;
      },
      { deep: true }
    );
    const cycleSort = (column: TableV2Column) => {
      if (!column.sortable) return;
      const next: TableV2SortOrder =
        sortState.value?.key !== column.key || sortState.value.order === null
          ? 'asc'
          : sortState.value.order === 'asc'
            ? 'desc'
            : null;
      sortState.value = next === null ? null : { key: column.key, order: next };
      emit('column-sort', { key: column.key, order: next });
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
      const state = sortState.value;
      const column = state ? props.columns.find((c) => c.key === state.key) : undefined;
      if (!state || !column) return rows;
      const direction = state.order === 'desc' ? -1 : 1;
      return rows
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          const diff = compareValues(
            (a.row as Record<string, unknown>)[column.dataKey],
            (b.row as Record<string, unknown>)[column.dataKey]
          );
          return diff !== 0 ? diff * direction : a.index - b.index;
        })
        .map((item) => item.row);
    });

    // 扁平化（含树）
    interface FlatRow {
      rowData: object;
      rowIndex: number;
      level: number;
    }
    const flatRows = computed<FlatRow[]>(() => {
      const out: FlatRow[] = [];
      const walk = (rows: object[], level: number) => {
        if (level > 100) return;
        rows.forEach((row) => {
          out.push({ rowData: row, rowIndex: out.length, level });
          if (expandedKeys.value.includes(key(row))) {
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
    const wasAtEnd = ref(false);
    const totalBodyHeight = computed(() => rowTops.value[rowTops.value.length - 1] ?? 0);
    const onScroll = (event: Event) => {
      const el = event.target as HTMLDivElement;
      scrollTop.value = el.scrollTop;
      emit('scroll', { scrollLeft: el.scrollLeft, scrollTop: el.scrollTop });
      const atEnd = el.scrollTop + props.height >= props.headerHeight + totalBodyHeight.value - 1;
      if (atEnd && !wasAtEnd.value) emit('end-reached');
      wasAtEnd.value = atEnd;
    };
    const rowHeights = computed(() =>
      flatRows.value.map(({ rowData, rowIndex }) =>
        typeof props.rowHeight === 'function' ? Math.max(1, props.rowHeight({ rowData, rowIndex })) : props.rowHeight
      )
    );
    const rowTops = computed(() => {
      const tops: number[] = [0];
      rowHeights.value.forEach((h) => tops.push(tops[tops.length - 1] + h));
      return tops;
    });
    const firstVisible = (y: number) => {
      let lo = 0;
      let hi = flatRows.value.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (rowTops.value[mid + 1] <= y) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    };
    const windowRows = computed(() => {
      const y0 = Math.max(0, scrollTop.value - props.headerHeight);
      const y1 = scrollTop.value + props.height - props.headerHeight;
      const start = Math.max(0, firstVisible(y0) - overscan.value);
      const end = Math.min(flatRows.value.length, firstVisible(y1 - 1) + 1 + overscan.value);
      return flatRows.value.slice(start, Math.max(start, end)).map((r) => ({
        ...r,
        top: rowTops.value[r.rowIndex],
        height: rowHeights.value[r.rowIndex]
      }));
    });

    const fireRowEvent = (name: keyof TableV2RowEventHandlers) => (rowData: object, rowIndex: number, event: Event) =>
      props.rowEventHandlers?.[name]?.({ rowData, rowIndex, event });

    expose({
      scrollTo: (options?: { top?: number; left?: number }) => {
        const el = scrollEl.value;
        if (!el || !options) return;
        if (options.top !== undefined) el.scrollTop = options.top;
        if (options.left !== undefined) el.scrollLeft = options.left;
      },
      scrollToRow: (rowIndex: number, align: 'auto' | 'start' | 'center' | 'end' = 'auto') => {
        const el = scrollEl.value;
        if (!el || rowIndex < 0 || rowIndex >= flatRows.value.length) return;
        const top = props.headerHeight + rowTops.value[rowIndex];
        const bottom = top + rowHeights.value[rowIndex];
        const viewTop = el.scrollTop;
        const viewBottom = el.scrollTop + props.height;
        if (align === 'start' || (align === 'auto' && top < viewTop)) el.scrollTop = top;
        else if (align === 'end' || (align === 'auto' && bottom > viewBottom)) el.scrollTop = bottom - props.height;
        else if (align === 'center') el.scrollTop = top - (props.height - rowHeights.value[rowIndex]) / 2;
      }
    });

    const cellStyle = (column: TableV2Column): CSSProperties => ({
      width: `${column.width}px`,
      minWidth: `${column.width}px`,
      textAlign: column.align ?? 'left'
    });
    const fixedSideOf = (column: TableV2Column) =>
      column.fixed === true ? 'left' : column.fixed === 'left' || column.fixed === 'right' ? column.fixed : undefined;
    const cellFixedStyle = (column: TableV2Column, index: number, header: boolean): CSSProperties => {
      const side = fixedSideOf(column);
      if (!side) return {};
      const cols = props.columns;
      const offset =
        side === 'left'
          ? cols.slice(0, index).reduce((n, c) => n + (fixedSideOf(c) === 'left' ? c.width : 0), 0)
          : cols.slice(index + 1).reduce((n, c) => n + (fixedSideOf(c) === 'right' ? c.width : 0), 0);
      const style: CSSProperties = {
        position: 'sticky',
        zIndex: header ? 3 : 1,
        background: header ? 'var(--i-bg-subtle)' : 'var(--i-bg)'
      };
      style[side] = `${offset}px`;
      return style;
    };

    return () => (
      <div
        class='i-table-v2'
        style={{ width: toPx(props.width), height: `${props.height}px` }}
        role='grid'
        aria-rowcount={flatRows.value.length}
        aria-colcount={props.columns.length}>
        <div class='i-table-v2__scroll' ref={scrollEl} onScroll={onScroll}>
          <div class='i-table-v2__header' style={{ height: `${props.headerHeight}px` }}>
            <div class='i-table-v2__row' role='row' style={{ width: `${totalWidth.value}px` }}>
              {props.columns.map((column, columnIndex) => (
                <div
                  key={column.key}
                  class='i-table-v2__cell is-header'
                  role='columnheader'
                  tabindex={column.sortable ? 0 : undefined}
                  style={{ ...cellStyle(column), ...cellFixedStyle(column, columnIndex, true) }}
                  aria-sort={
                    column.sortable
                      ? sortState.value?.key === column.key
                        ? sortState.value.order === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                  onClick={() => cycleSort(column)}
                  onKeydown={(event: KeyboardEvent) => {
                    if (column.sortable && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      cycleSort(column);
                    }
                  }}>
                  {slots['header-cell']?.({ column }) ?? (
                    <>
                      {column.title ?? column.key}{' '}
                      {column.sortable && (
                        <span aria-hidden='true'>
                          {sortState.value?.key !== column.key || sortState.value.order === null
                            ? '↕'
                            : sortState.value.order === 'asc'
                              ? '↑'
                              : '↓'}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div class='i-table-v2__body' style={{ height: `${totalBodyHeight.value}px` }}>
            {windowRows.value.map(({ rowData, rowIndex, level, top, height }) => (
              <div
                key={key(rowData)}
                class={[
                  'i-table-v2__row is-body',
                  typeof props.rowClass === 'function' ? props.rowClass({ rowData, rowIndex }) : props.rowClass
                ]}
                role='row'
                style={{ width: `${totalWidth.value}px`, height: `${height}px`, top: `${top}px` }}
                onClick={(event: MouseEvent) => fireRowEvent('onClick')(rowData, rowIndex, event)}
                onDblclick={(event: MouseEvent) => fireRowEvent('onDblclick')(rowData, rowIndex, event)}
                onContextmenu={(event: MouseEvent) => fireRowEvent('onContextmenu')(rowData, rowIndex, event)}
                onMouseenter={(event: MouseEvent) => fireRowEvent('onMouseenter')(rowData, rowIndex, event)}
                onMouseleave={(event: MouseEvent) => fireRowEvent('onMouseleave')(rowData, rowIndex, event)}>
                {props.columns.map((column, columnIndex) => {
                  const children = childRowsOf(rowData);
                  const showToggle = column.key === expandKey.value && children.length > 0;
                  const extra = props.cellProps?.({ rowData, column, rowIndex });
                  return (
                    <div
                      key={column.key}
                      class={['i-table-v2__cell', extra?.class]}
                      role='gridcell'
                      style={{ ...cellStyle(column), ...cellFixedStyle(column, columnIndex, false), ...extra?.style }}>
                      {column.key === expandKey.value && level > 0 && (
                        <span class='i-table-v2__indent' style={{ width: `${level * 16}px` }} aria-hidden='true' />
                      )}
                      {column.key === expandKey.value &&
                        (showToggle ? (
                          <button
                            type='button'
                            class='i-table-v2__expand-toggle'
                            aria-expanded={expandedKeys.value.includes(key(rowData))}
                            aria-label={expandedKeys.value.includes(key(rowData)) ? '收起子行' : '展开子行'}
                            onClick={(event: MouseEvent) => {
                              event.stopPropagation();
                              toggleExpand(rowData);
                            }}>
                            <span
                              class={{
                                'i-table-v2__expand-icon': true,
                                'is-expanded': expandedKeys.value.includes(key(rowData))
                              }}
                              aria-hidden='true'>
                              ›
                            </span>
                          </button>
                        ) : (
                          <span class='i-table-v2__tree-placeholder' aria-hidden='true' />
                        ))}
                      {slots.cell?.({ rowData, column, rowIndex }) ??
                        String((rowData as Record<string, unknown>)[column.dataKey] ?? '')}
                    </div>
                  );
                })}
              </div>
            ))}
            {!flatRows.value.length && <div class='i-table-v2__empty'>{slots.empty?.() ?? props.emptyText}</div>}
          </div>
          {props.footerHeight > 0 && (
            <div class='i-table-v2__footer' style={{ height: `${props.footerHeight}px` }}>
              {slots.footer?.()}
            </div>
          )}
        </div>
      </div>
    );
  }
});
