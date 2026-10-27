import Empty from '../empty';
import Loading from '../loading';
import { computed, defineComponent, ref, watch, type CSSProperties, type PropType } from 'vue';
import Checkbox from '../checkbox';
import type { TableColumn, SortChange } from './types';
export default defineComponent({
  name: 'i-table',
  props: {
    data: { type: Array as PropType<object[]>, default: () => [] },
    columns: { type: Array as PropType<TableColumn[]>, default: () => [] },
    rowKey: { type: String, default: 'id' },
    selection: Boolean,
    loading: Boolean,
    maxHeight: { type: Number, default: 440 },
    emptyText: { type: String, default: '没有符合条件的数据' },
    stripe: Boolean,
    border: Boolean,
    showHeader: { type: Boolean, default: true }
  },
  emits: ['selection-change', 'sort-change'],
  setup(props, { emit, slots, expose }) {
    const selected = ref<Array<string | number>>([]);
    const sort = ref<SortChange>({ key: '', order: null });
    const key = (row: object) => (row as Record<string, unknown>)[props.rowKey] as string | number;
    const selectionChanged = () =>
      emit(
        'selection-change',
        props.data.filter((row) => selected.value.includes(key(row)))
      );
    watch(
      () => props.data,
      () => {
        const valid = new Set(props.data.map(key));
        const remaining = selected.value.filter((id) => valid.has(id));
        if (remaining.length !== selected.value.length) {
          selected.value = remaining;
          selectionChanged();
        }
      }
    );
    expose({
      clearSelection: () => {
        selected.value = [];
        selectionChanged();
      }
    });
    const allSelected = computed(
      () => props.data.length > 0 && props.data.every((row) => selected.value.includes(key(row)))
    );
    const columnStyle = (column: TableColumn, index: number): CSSProperties => {
      const style: CSSProperties = {
        width: column.width ? `${column.width}px` : undefined,
        minWidth: `${column.width || 140}px`
      };
      if (column.fixed) {
        style.position = 'sticky';
        style[column.fixed] = `${
          column.fixed === 'left'
            ? (props.selection ? 48 : 0) +
              props.columns
                .slice(0, index)
                .filter((c) => c.fixed === 'left')
                .reduce((n, c) => n + (c.width || 140), 0)
            : props.columns
                .slice(index + 1)
                .filter((c) => c.fixed === 'right')
                .reduce((n, c) => n + (c.width || 140), 0)
        }px`;
        style.zIndex = 1;
      }
      return style;
    };
    const changeSort = (column: TableColumn) => {
      if (props.loading) return;
      sort.value = {
        key: column.key,
        order:
          sort.value.key !== column.key || sort.value.order === null
            ? 'asc'
            : sort.value.order === 'asc'
              ? 'desc'
              : null
      };
      emit('sort-change', { ...sort.value });
    };
    return () => (
      <div
        class={{ 'i-table': true, 'is-striped': props.stripe, 'is-bordered': props.border }}
        aria-busy={props.loading}>
        <Loading loading={props.loading} overlay>
          <div class='i-table__scroll' style={{ maxHeight: `${props.maxHeight}px` }}>
            <table>
              {props.showHeader && (
                <thead>
                  <tr>
                    {props.selection && (
                      <th class='i-table__selection'>
                        <Checkbox
                          aria-label='选择当前页全部'
                          modelValue={allSelected.value}
                          indeterminate={selected.value.length > 0 && !allSelected.value}
                          disabled={props.loading || !props.data.length}
                          onChange={(checked: boolean) => {
                            selected.value = checked ? props.data.map(key) : [];
                            selectionChanged();
                          }}
                        />
                      </th>
                    )}
                    {props.columns.map((column, index) => (
                      <th
                        key={column.key}
                        scope='col'
                        style={{
                          ...columnStyle(column, index),
                          textAlign: column.headerAlign || column.align
                        }}
                        aria-sort={
                          column.sortable
                            ? sort.value.key === column.key && sort.value.order
                              ? sort.value.order === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : 'none'
                            : undefined
                        }>
                        {column.sortable ? (
                          <button type='button' onClick={() => changeSort(column)}>
                            {column.title}{' '}
                            <span aria-hidden='true'>
                              {sort.value.key === column.key
                                ? sort.value.order === 'asc'
                                  ? '↑'
                                  : sort.value.order === 'desc'
                                    ? '↓'
                                    : '↕'
                                : '↕'}
                            </span>
                          </button>
                        ) : (
                          column.title
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {props.data.map((row, index) => (
                  <tr key={key(row)} class={{ 'i-table__selected': selected.value.includes(key(row)) }}>
                    {props.selection && (
                      <td class='i-table__selection'>
                        <Checkbox
                          aria-label={`选择第 ${index + 1} 行`}
                          modelValue={selected.value.includes(key(row))}
                          disabled={props.loading}
                          onChange={(checked: boolean) => {
                            selected.value = checked
                              ? [...selected.value, key(row)]
                              : selected.value.filter((id) => id !== key(row));
                            selectionChanged();
                          }}
                        />
                      </td>
                    )}
                    {props.columns.map((column, columnIndex) => (
                      <td
                        key={column.key}
                        style={{
                          ...columnStyle(column, columnIndex),
                          textAlign: column.align
                        }}>
                        {slots[column.key]?.({ row, index }) ??
                          column.formatter?.(row as Record<string, unknown>) ??
                          String((row as Record<string, unknown>)[column.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
                {!props.data.length && !props.loading && (
                  <tr>
                    <td class='i-table__empty' colspan={props.columns.length + (props.selection ? 1 : 0)}>
                      {slots.empty?.() ?? <Empty description={props.emptyText} />}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Loading>
      </div>
    );
  }
});
