export type CascaderNodeValue = string | number;

export type CascaderNodePath = CascaderNodeValue[];

export type CascaderItemValue = CascaderNodeValue | CascaderNodePath;

export type CascaderModelValue = CascaderItemValue | CascaderItemValue[] | null;

export interface CascaderOption {
  [key: string]: unknown;
  value?: CascaderNodeValue;
  label?: string;
  children?: CascaderOption[];
  disabled?: boolean;
  leaf?: boolean;
}

export interface CascaderPropsMapping {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
  leaf?: string;
}

export interface CascaderNode {
  value: CascaderNodeValue;
  label: string;
  disabled: boolean;
  leaf: boolean;
  level: number;
  data: CascaderOption;
  parent: CascaderNode | null;
  children: CascaderNode[];
  path: CascaderNode[];
}

export type CascaderFilterMethod = (
  query: string,
  option: CascaderOption,
  path: CascaderOption[]
) => boolean;
