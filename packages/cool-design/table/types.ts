export type TableSize = 'large' | 'default' | 'small';
export type TableColumnType = 'default' | 'selection' | 'index' | 'expand';
export type TableSortOrder = 'ascending' | 'descending' | null;

export interface TableFilterItem {
  text: string;
  value: unknown;
}

export interface TableColumn<T extends object = Record<string, unknown>> {
  type?: TableColumnType;
  index?: number | ((index: number) => number | string);
  columnKey?: string;
  key?: string;
  /** Element Plus 风格，等价于 key */
  prop?: string;
  /** Element Plus 旧别名，等价于 prop */
  property?: string;
  title?: string;
  /** Element Plus 风格，等价于 title */
  label?: string;
  width?: number | string;
  minWidth?: number | string;
  fixed?: boolean | 'left' | 'right';
  sortable?: boolean | 'custom';
  sortMethod?: (a: T, b: T) => number;
  sortBy?: string | string[] | ((row: T, index: number) => unknown);
  sortOrders?: TableSortOrder[];
  formatter?: (row: T, column: TableColumn<T>, cellValue: unknown, index: number) => string;
  filters?: TableFilterItem[];
  filterMultiple?: boolean;
  filterMethod?: (value: unknown, row: T, column: TableColumn<T>) => boolean;
  filteredValue?: unknown[];
  filterPlacement?: 'top' | 'bottom' | 'left' | 'right';
  filterClassName?: string;
  filterIcon?: (params: { column: TableColumn }) => unknown;
  showOverflowTooltip?: boolean | TableOverflowTooltipOptions;
  className?: string;
  labelClassName?: string;
  selectable?: (row: T, index: number) => boolean;
  reserveSelection?: boolean;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  children?: TableColumn[];
  resizable?: boolean;
  tooltipFormatter?: TableTooltipFormatter;
  editable?: boolean;
  editor?: TableEditor;
  visible?: boolean;
}

/** 对标 Element Plus sort-change 载荷 */
export interface SortChange {
  column: TableColumn | null;
  prop: string;
  order: TableSortOrder;
}

export interface TableSummaryParams {
  columns: TableColumn[];
  data: object[];
}
export type TableSummaryMethod = (params: TableSummaryParams) => Array<string | number>;

export interface TableSpanParams {
  row: object;
  column: TableColumn;
  rowIndex: number;
  columnIndex: number;
}
export type TableSpanMethod = (
  params: TableSpanParams
) => [number, number] | { rowspan?: number; colspan?: number } | void;

export interface TableTreeProps {
  children?: string;
  hasChildren?: string;
  checkStrictly?: boolean;
}

export interface TableTreeNode {
  level: number;
}

export type TableLoadMethod = (row: object, treeNode: TableTreeNode, resolve: (children: object[]) => void) => void;

export type TableRowClassName = string | ((params: { row: object; rowIndex: number }) => string);

export interface TableTooltipParams {
  row: object;
  column: TableColumn;
  cellValue: unknown;
  index: number;
}
export type TableTooltipFormatter = (params: TableTooltipParams) => string;

export interface TableCellEditParams {
  row: object;
  column: TableColumn;
  index: number;
  value: unknown;
  oldValue: unknown;
}

export interface TableOverflowTooltipOptions {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  popperClass?: string;
  effect?: 'light' | 'dark';
}

export interface TableEditorParams {
  row: object;
  column: TableColumn;
  value: string;
  index: number;
  confirm: () => void;
  cancel: () => void;
  update: (value: string) => void;
}
export type TableEditor = (params: TableEditorParams) => unknown;

export type TableRowStyle =
  | Record<string, string>
  | ((params: { row: object; rowIndex: number }) => Record<string, string> | undefined);
export type TableCellClassName =
  | string
  | ((params: { row: object; column: TableColumn; rowIndex: number; columnIndex: number }) => string | undefined);
export type TableCellStyle =
  | Record<string, string>
  | ((params: {
      row: object;
      column: TableColumn;
      rowIndex: number;
      columnIndex: number;
    }) => Record<string, string> | undefined);

export type TableHeaderRowClassName = string | ((params: { rowIndex: number }) => string | undefined);
export type TableHeaderRowStyle =
  | Record<string, string>
  | ((params: { rowIndex: number }) => Record<string, string> | undefined);
export type TableHeaderCellClassName =
  | string
  | ((params: { rowIndex: number; column: TableColumn; columnIndex: number }) => string | undefined);
export type TableHeaderCellStyle =
  | Record<string, string>
  | ((params: { rowIndex: number; column: TableColumn; columnIndex: number }) => Record<string, string> | undefined);
