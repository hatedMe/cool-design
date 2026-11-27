import type { TransferExposed } from './types';
import { withInstall } from '../../../src/utils/with-install';
import Component from './transfer';
import './index.scss';

export type TransferInstance = TransferExposed;
export const Transfer = withInstall<typeof Component, TransferInstance>(Component);
export default Transfer;
export type {
  TransferDirection,
  TransferExposed,
  TransferFilterMethod,
  TransferFormat,
  TransferItem,
  TransferPanelInstance,
  TransferKey,
  TransferProps,
  TransferPropsMap,
  TransferRenderContent,
  TransferTargetOrder
} from './types';
