export type TreeV2Key = string | number;
export type TreeV2Data = Record<string, unknown>;

export interface TreeV2PropsMapping {
  value?: string;
  label?: string;
  children?: string;
  disabled?: string;
  class?: string | ((data: TreeV2Data, node: TreeV2Node) => string);
}

export interface TreeV2Node {
  key: TreeV2Key;
  level: number;
  parent?: TreeV2Node;
  children?: TreeV2Node[];
  data: TreeV2Data;
  disabled?: boolean;
  label?: string;
  isLeaf?: boolean;
  expanded?: boolean;
  isEffectivelyChecked?: boolean;
}

export interface TreeV2CheckedInfo {
  checkedKeys: TreeV2Key[];
  checkedNodes: TreeV2Data[];
  halfCheckedKeys: TreeV2Key[];
  halfCheckedNodes: TreeV2Data[];
}

export type TreeV2FilterMethod = (query: string, node: TreeV2Data) => boolean;

export interface TreeV2InnerNode {
  key: TreeV2Key;
  label: string;
  disabled: boolean;
  isLeaf: boolean;
  level: number;
  parent: TreeV2InnerNode | null;
  children: TreeV2InnerNode[];
  data: TreeV2Data;
  expanded: boolean;
  checked: boolean;
  indeterminate: boolean;
  visible: boolean;
}
