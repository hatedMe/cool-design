export type TreeKey = string | number;

export interface TreeData {
  [key: string]: unknown;
}

export type TreeLabelFunction = (data: TreeData, node: TreeNode) => string;
export type TreeBooleanFunction = (data: TreeData, node: TreeNode) => boolean;

export interface TreePropsMapping {
  label?: string | TreeLabelFunction;
  children?: string;
  disabled?: string | TreeBooleanFunction;
  isLeaf?: string | TreeBooleanFunction;
  class?: string | ((data: TreeData, node: TreeNode) => string | Record<string, boolean>);
}

export interface TreeNode {
  uid: number;
  key: TreeKey | null;
  data: TreeData;
  parent: TreeNode | null;
  children: TreeNode[];
  level: number;
  label: string;
  disabled: boolean;
  isLeaf: boolean;
  loaded: boolean;
  loading: boolean;
  expanded: boolean;
  everExpanded: boolean;
  checked: boolean;
  indeterminate: boolean;
  visible: boolean;
  isCurrent: boolean;
}

export type TreeFilterMethod = (value: string, data: TreeData, node: TreeNode) => boolean;

export type TreeLoadFunction = (
  node: TreeNode,
  resolve: (children: TreeData[]) => void,
  reject?: () => void
) => unknown;

export type TreeDropType = 'prev' | 'inner' | 'next';

export type TreeAllowDrag = (node: TreeNode) => boolean;
export type TreeAllowDrop = (
  draggingNode: TreeNode,
  dropNode: TreeNode,
  type: TreeDropType
) => boolean;

export type TreeRenderContent = (
  h: unknown,
  context: { node: TreeNode; data: TreeData }
) => unknown;

export interface TreeCheckedInfo {
  checkedNodes: TreeData[];
  checkedKeys: TreeKey[];
  halfCheckedNodes: TreeData[];
  halfCheckedKeys: TreeKey[];
}

export type TreeNodeParam = TreeKey | TreeData | TreeNode;

export interface TreeExposed {
  filter: (value: string) => void;
  getNode: (param: TreeNodeParam) => TreeNode | null;
  getCheckedNodes: (leafOnly?: boolean, includeHalfChecked?: boolean) => TreeData[];
  getCheckedKeys: (leafOnly?: boolean) => TreeKey[];
  getHalfCheckedNodes: () => TreeData[];
  getHalfCheckedKeys: () => TreeKey[];
  setCheckedNodes: (nodes: TreeNodeParam[], leafOnly?: boolean) => void;
  setCheckedKeys: (keys: TreeKey[], leafOnly?: boolean) => void;
  setChecked: (param: TreeNodeParam, checked: boolean, deep?: boolean) => void;
  getCurrentKey: () => TreeKey | null;
  getCurrentNode: () => TreeData | null;
  setCurrentKey: (key: TreeKey | null, shouldAutoExpandParent?: boolean) => void;
  setCurrentNode: (node: TreeNodeParam | null, shouldAutoExpandParent?: boolean) => void;
  expandAll: (expand?: boolean) => void;
  expandNode: (param: TreeNodeParam) => void;
  collapseNode: (param: TreeNodeParam) => void;
  updateKeyChildren: (key: TreeKey, children: TreeData[]) => void;
  remove: (param: TreeNodeParam) => void;
  append: (data: TreeData | TreeData[], parent?: TreeNodeParam | null) => void;
  insertBefore: (data: TreeData, ref: TreeNodeParam) => void;
  insertAfter: (data: TreeData, ref: TreeNodeParam) => void;
}
