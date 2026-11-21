import type { CSSProperties, HTMLAttributes, VNode } from 'vue';

export type TableV2Key = string | number | symbol;
export type TableV2SortOrder = 'asc' | 'desc' | null;
export type TableV2SortState = Partial<Record<TableV2Key, TableV2SortBy['order']>>;

export interface TableV2Column {
  key?: TableV2Key;
  dataKey?: TableV2Key;
  title?: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: boolean | 'left' | 'right';
  dataGetter?: (params: TableV2DataGetterParams) => unknown;
  cellRenderer?: (params: TableV2CellRendererParams) => VNode;
  headerCellRenderer?: (params: TableV2HeaderCellRendererParams) => VNode;
}

export interface TableV2HeaderParams {
  columns: TableV2Column[];
  headerIndex: number;
}

export interface TableV2HeaderCellParams extends TableV2HeaderParams {
  column: TableV2Column;
  columnIndex: number;
}

export interface TableV2HeaderCellRendererParams extends TableV2HeaderCellParams {
  class: string;
  style: CSSProperties;
  sortBy?: TableV2SortBy;
  sortState?: TableV2SortState;
}

export interface TableV2RowParams {
  columns: TableV2Column[];
  rowData: object;
  rowIndex: number;
}

export interface TableV2DataGetterParams extends TableV2RowParams {
  column: TableV2Column;
  columnIndex: number;
}

export interface TableV2CellParams extends TableV2DataGetterParams {
  cellData: unknown;
}

export interface TableV2CellRendererParams extends TableV2CellParams {
  class: string;
  isScrolling?: boolean;
}

export interface TableV2HeaderSlotParams extends TableV2HeaderParams {
  cells: VNode[];
}

export interface TableV2Slots {
  header?: (params: TableV2HeaderSlotParams) => VNode[];
  'header-cell'?: (params: TableV2HeaderCellRendererParams) => VNode[];
  cell?: (params: TableV2CellRendererParams) => VNode[];
  empty?: () => VNode[];
  footer?: () => VNode[];
  overlay?: () => VNode[];
}

export type TableV2RowHeight = number | ((params: { rowData: object; rowIndex: number }) => number);

export interface TableV2SortBy {
  key: TableV2Key;
  order: 'asc' | 'desc';
}

export interface TableV2CellProps extends HTMLAttributes {
  [key: string]: unknown;
}

export type TableV2ElementProps<T> = TableV2CellProps | ((params: T) => TableV2CellProps | undefined);

export interface TableV2RowExpandParams {
  rowData: object;
  rowIndex: number;
  rowKey: TableV2Key;
  expanded: boolean;
}

export interface TableV2RowsRenderedParams {
  rowCacheStart: number;
  rowCacheEnd: number;
  rowVisibleStart: number;
  rowVisibleEnd: number;
}

export interface TableV2ScrollOptions {
  scrollLeft?: number;
  scrollTop?: number;
  left?: number;
  top?: number;
}

export type TableV2ScrollStrategy = 'auto' | 'smart' | 'start' | 'center' | 'end';

export interface TableV2RowEventParams {
  rowData: object;
  rowIndex: number;
  rowKey: TableV2Key;
  event: Event;
}

export interface TableV2RowEventHandlers {
  onClick?: (params: TableV2RowEventParams) => void;
  onDblclick?: (params: TableV2RowEventParams) => void;
  onContextmenu?: (params: TableV2RowEventParams) => void;
  onMouseenter?: (params: TableV2RowEventParams) => void;
  onMouseleave?: (params: TableV2RowEventParams) => void;
}
