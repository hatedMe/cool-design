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

export interface TreeV2Exposed {
  filter: (query: string) => void;
  setData: (data: TreeV2Data[]) => void;
  getExpandedKeys: () => TreeV2Key[];
  isChecked: (key: TreeV2Key) => boolean;
  isIndeterminate: (key: TreeV2Key) => boolean;
  toggleCheckbox: (key: TreeV2Key, checked?: boolean) => void;
  getCheckedNodes: (leafOnly?: boolean) => TreeV2Data[];
  getCheckedKeys: (leafOnly?: boolean) => TreeV2Key[];
  getHalfCheckedNodes: () => TreeV2Data[];
  getHalfCheckedKeys: () => TreeV2Key[];
  setCheckedKeys: (keys: TreeV2Key[]) => void;
  setChecked: (key: TreeV2Key, checked: boolean, deep?: boolean) => void;
  setExpandedKeys: (keys: TreeV2Key[]) => void;
  getCurrentKey: () => TreeV2Key | undefined;
  getCurrentNode: () => TreeV2Data | null;
  setCurrentKey: (key: TreeV2Key) => void;
  getNode: (target: TreeV2Key | TreeV2Data) => TreeV2Node | null;
  expandNode: (node: TreeV2Node) => void;
  collapseNode: (node: TreeV2Node) => void;
  scrollTo: (offset: number) => void;
  scrollToNode: (key: TreeV2Key) => void;
}

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
