export type TableV2SortOrder = 'asc' | 'desc' | null;

export interface TableV2Column {
  key: string;
  dataKey: string;
  title?: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: boolean | 'left' | 'right';
}

export type TableV2RowHeight = number | ((params: { rowData: object; rowIndex: number }) => number);

export interface TableV2SortBy {
  key: string;
  order: 'asc' | 'desc';
}

export interface TableV2CellProps {
  class?: string;
  style?: Record<string, string>;
}

export interface TableV2RowEventParams {
  rowData: object;
  rowIndex: number;
  event: Event;
}

export interface TableV2RowEventHandlers {
  onClick?: (params: TableV2RowEventParams) => void;
  onDblclick?: (params: TableV2RowEventParams) => void;
  onContextmenu?: (params: TableV2RowEventParams) => void;
  onMouseenter?: (params: TableV2RowEventParams) => void;
  onMouseleave?: (params: TableV2RowEventParams) => void;
}
