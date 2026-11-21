import type { ComputedRef, ExtractPropTypes, VNode } from 'vue';
import type Tooltip from '../tooltip/tooltip';
import type { Placement } from '../../../src/utils/use-floating';
import type { TableInstance } from './index';
import type { tableProps } from './table';

export type TableSize = 'large' | 'default' | 'small';
export type TableColumnType = 'default' | 'selection' | 'index' | 'expand';
export type TableSortOrder = 'ascending' | 'descending' | null;
export type TableRowExpandable<T extends object = object> = {
  canExpand(row: T, index: number): boolean;
}['canExpand'];

export interface TableHeaderRenderParams<T extends object = Record<string, unknown>> {
  column: TableColumn<T>;
  $index: number;
  store: {
    states: {
      columns: ComputedRef<TableColumn[]>;
      data: ComputedRef<object[]>;
    };
  };
  _self: TableInstance & { readonly $props: Readonly<ExtractPropTypes<typeof tableProps>> };
}

export interface TableFilterItem {
  text: string;
  value: unknown;
}

export interface TableColumn<T extends object = Record<string, unknown>> {
  type?: TableColumnType;
  index?: number | ((index: number) => number | string);
  columnKey?: string;
  key?: string;
  /** 兼容别名，等价于 key */
  prop?: string;
  /** 旧别名，等价于 prop */
  property?: string;
  title?: string;
  /** 兼容别名，等价于 title */
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
  filterPlacement?: Placement;
  filterClassName?: string;
  filterIcon?: (params: { column: TableColumn }) => unknown;
  renderHeader?: (params: TableHeaderRenderParams<T>) => VNode;
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

/** sort-change 事件载荷 */
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
export type TableTooltipFormatter = (params: TableTooltipParams) => string | VNode;

export interface TableCellEditParams {
  row: object;
  column: TableColumn;
  index: number;
  value: unknown;
  oldValue: unknown;
}

type TooltipProps = InstanceType<typeof Tooltip>['$props'];
type OverflowTooltipProp =
  'placement' | 'offset' | 'popperClass' | 'effect' | 'disabled' | 'trigger' | 'showAfter' |
  'hideAfter' | 'enterable' | 'showArrow' | 'fallbackPlacements' | 'teleported' | 'appendTo' | 'popperStyle' | 'zIndex' |
  'strategy' | 'popperOptions' | 'gpuAcceleration' | 'arrowOffset' | 'transition' | 'triggerKeys' | 'persistent';
export type TableOverflowTooltipOptions = { -readonly [K in OverflowTooltipProp]?: TooltipProps[K] };

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
