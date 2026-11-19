import { withInstall } from '../../../src/utils/with-install';
import { camelize, defineComponent, h, ref, type ComponentPublicInstance } from 'vue';
import Component from './table';
import { resolveColumns } from './declarative-columns';

export const Table = withInstall(
  defineComponent({
    name: 'i-table',
    inheritAttrs: false,
    props: Component.props,
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
  })
);
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
  TableHeaderRowClassName,
  TableHeaderRowStyle,
  TableLoadMethod,
  TableOverflowTooltipOptions,
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
