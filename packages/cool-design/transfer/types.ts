export type TransferKey = string | number;

export interface TransferItem {
  key?: TransferKey;
  label?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

export interface TransferPropsMap {
  label?: string;
  key?: string;
  disabled?: string;
}

export interface TransferFormat {
  noChecked?: string;
  hasChecked?: string;
}

export type TransferDirection = 'left' | 'right';

export type TransferTargetOrder = 'original' | 'push' | 'unshift';

export type TransferFilterMethod = (query: string, item: TransferItem) => boolean;

export type TransferRenderContent = (item: TransferItem) => unknown;

export interface TransferProps {
  modelValue?: TransferKey[];
  data?: TransferItem[];
  titles?: string[];
  buttonTexts?: string[];
  filterable?: boolean;
  filterPlaceholder?: string;
  filterMethod?: TransferFilterMethod;
  targetOrder?: TransferTargetOrder;
  format?: TransferFormat;
  props?: TransferPropsMap;
  leftDefaultChecked?: TransferKey[];
  rightDefaultChecked?: TransferKey[];
  disabled?: boolean;
  noDataText?: string;
  noMatchText?: string;
  renderContent?: TransferRenderContent;
}

export interface TransferExposed {
  clearQuery: (which?: 'left' | 'right' | 0 | 1) => void;
}

