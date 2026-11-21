import { withInstall } from '../../../src/utils/with-install';
import Component from './table-v2';
import type { TableV2ScrollOptions, TableV2ScrollStrategy, TableV2Slots } from './types';

export interface TableV2Instance {
  scrollTo(options?: TableV2ScrollOptions): void;
  scrollToLeft(scrollLeft: number): void;
  scrollToTop(scrollTop: number): void;
  scrollToRow(rowIndex: number, strategy?: TableV2ScrollStrategy): void;
}
export const TableV2 = withInstall<typeof Component, TableV2Instance & { $slots: TableV2Slots }>(Component);
export default TableV2;
export type {
  TableV2CellParams,
  TableV2CellProps,
  TableV2CellRendererParams,
  TableV2Column,
  TableV2DataGetterParams,
  TableV2ElementProps,
  TableV2HeaderCellParams,
  TableV2HeaderCellRendererParams,
  TableV2HeaderParams,
  TableV2HeaderSlotParams,
  TableV2Key,
  TableV2RowEventHandlers,
  TableV2RowEventParams,
  TableV2RowExpandParams,
  TableV2RowHeight,
  TableV2RowParams,
  TableV2RowsRenderedParams,
  TableV2ScrollOptions,
  TableV2ScrollStrategy,
  TableV2Slots,
  TableV2SortBy,
  TableV2SortOrder,
  TableV2SortState
} from './types';
