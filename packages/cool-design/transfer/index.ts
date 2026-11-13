import { withInstall } from '../../../src/utils/with-install';
import Component from './transfer';
import './index.scss';

export const Transfer = withInstall(Component);
export default Transfer;
export type {
  TransferDirection,
  TransferExposed,
  TransferFilterMethod,
  TransferFormat,
  TransferItem,
  TransferKey,
  TransferProps,
  TransferPropsMap,
  TransferTargetOrder
} from './types';
