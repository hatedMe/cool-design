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
  multiple?: boolean;
  checkStrictly?: boolean;
  emitPath?: boolean;
  checkOnClickNode?: boolean;
  checkOnClickLeaf?: boolean;
  showPrefix?: boolean;
  hoverThreshold?: number;
  expandTrigger?: 'click' | 'hover';
  lazy?: boolean;
  lazyLoad?: CascaderLazyLoad;
}

export interface CascaderNode {
  value: CascaderNodeValue;
  label: string;
  disabled: boolean;
  leaf: boolean;
  /** 懒加载中标记 */
  loading?: boolean;
  /** 懒加载已完成标记 */
  loaded?: boolean;
  level: number;
  data: CascaderOption;
  parent: CascaderNode | null;
  children: CascaderNode[];
  path: CascaderNode[];
}

/** 懒加载回调收到的节点信息 */
export interface CascaderLazyNode {
  level: number;
  value: CascaderNodeValue;
  data: CascaderOption;
}

export type CascaderLazyLoad = (node: CascaderLazyNode, resolve: (children: CascaderOption[]) => void, reject: () => void) => void;

export type CascaderFilterMethod = (
  query: string,
  option: CascaderOption,
  path: CascaderOption[]
) => boolean;

export interface CascaderTag {
  node: CascaderNode | null;
  key: string;
  text: string;
  hitState: boolean;
  closable: boolean;
  value: CascaderItemValue;
}

export interface CascaderSuggestion extends CascaderNode {
  text: string;
  checked: boolean;
}
