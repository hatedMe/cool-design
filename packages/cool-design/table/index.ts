import { withInstall } from '../../../src/utils/with-install';
import Component from './table';
export const Table = withInstall(Component);
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
