export interface SelectV2Option {
  label?: string;
  value?: unknown;
  disabled?: boolean;
  options?: SelectV2Option[];
  [key: string]: unknown;
}

export interface SelectV2PropsMapping {
  label?: string;
  value?: string;
  disabled?: string;
  options?: string;
}

export type SelectV2Value = unknown;
