import { withInstall } from '../../../src/utils/with-install';
import Component from './table-v2';
export const TableV2 = withInstall(Component);
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
