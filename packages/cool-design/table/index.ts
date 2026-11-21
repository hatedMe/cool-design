import { withInstall } from '../../../src/utils/with-install';
import { camelize, defineComponent, h, ref, type ComponentPublicInstance } from 'vue';
import Component, { tableProps } from './table';
import { resolveColumns } from './declarative-columns';

import type { TableSortOrder } from './types';

export interface TableInstance {
  clearSelection(): void;
  getSelectionRows(): object[];
  getHalfSelectionRows(): object[];
  toggleRowSelection(row: object, checked?: boolean): void;
  toggleAllSelection(): void;
  toggleRowExpansion(row: object, expanded?: boolean): void;
  setCurrentRow(row?: object | null): void;
  clearSort(): void;
  sort(prop: string, order: TableSortOrder): void;
  doLayout(): void;
  scrollTo(options?: { top?: number; left?: number }): void;
  setScrollTop(top: number): void;
  setScrollLeft(left: number): void;
  updateKeyChildren(key: string | number, children: object[]): void;
  setColumnVisibility(key: string, visible: boolean): void;
  moveColumn(fromKey: string, toIndex: number): void;
  getColumnOrder(): string[];
  clearFilter(keys?: string[]): void;
}

const TableComponent = defineComponent({
    name: 'i-table',
    inheritAttrs: false,
    props: tableProps,
    emits: Component.emits,
    setup(props, { attrs, slots, emit, expose }) {
      const table = ref<ComponentPublicInstance>();
      expose(
        new Proxy(
          {},
          {
            get: (_, key) =>
              typeof key === 'string' && !key.startsWith('$') && !key.startsWith('__')
                ? table.value?.[key as keyof ComponentPublicInstance]
                : undefined,
            has: (_, key) =>
              typeof key === 'string' &&
              !key.startsWith('$') &&
              !key.startsWith('__') &&
              !!table.value &&
              key in table.value
          }
        )
      );
      const listeners = Object.fromEntries(
        (Component.emits ?? []).map((event) => [
          `on${camelize(event).replace(/^./, (char) => char.toUpperCase())}`,
          (...args: unknown[]) => emit(event, ...args)
        ])
      );
      return () => {
        const columns = resolveColumns(slots.default?.() ?? []);
        return h(
          Component,
          { ...props, ...attrs, ...listeners, columns: columns.length ? columns : props.columns, ref: table },
          slots
        );
      };
    }
  });
export const Table = withInstall<typeof TableComponent, TableInstance>(TableComponent);
export default Table;
export type {
  TableCellClassName,
  TableCellEditParams,
  TableCellStyle,
  TableColumn,
  TableColumnType,
  TableEditor,
  TableEditorParams,
  TableFilterItem,
  TableHeaderCellClassName,
  TableHeaderCellStyle,
  TableHeaderRenderParams,
  TableHeaderRowClassName,
  TableHeaderRowStyle,
  TableLoadMethod,
  TableOverflowTooltipOptions,
  TableRowExpandable,
  TableRowClassName,
  TableRowStyle,
  TableSize,
  TableSortOrder,
  TableSpanMethod,
  TableSpanParams,
  TableSummaryMethod,
  TableSummaryParams,
  TableTooltipFormatter,
  TableTooltipParams,
  TableTreeNode,
  TableTreeProps,
  SortChange
} from './types';
