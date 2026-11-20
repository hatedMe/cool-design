import { withInstall } from '../../../src/utils/with-install';
import Component from './table-v2';
export interface TableV2Instance {
  scrollTo(options?: { top?: number, left?: number }): void;
  scrollToRow(rowIndex: number, align?: 'auto' | 'start' | 'center' | 'end'): void;
}
export const TableV2 = withInstall<typeof Component, TableV2Instance>(Component);
export default TableV2;
export type {
  TableV2CellProps,
  TableV2Column,
  TableV2RowEventHandlers,
  TableV2RowEventParams,
  TableV2RowHeight,
  TableV2SortBy,
  TableV2SortOrder
} from './types';
