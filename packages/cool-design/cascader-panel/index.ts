import type { CascaderNode, CascaderOption } from '../cascader/types';
import { withInstall } from '../../../src/utils/with-install';
import Component from './cascader-panel';
import './index.scss';
export type {
  CascaderItemValue,
  CascaderModelValue,
  CascaderNode,
  CascaderNodeValue,
  CascaderOption,
  CascaderPropsMapping
} from '../cascader/types';
export interface CascaderPanelInstance {
  getCheckedNodes(leafOnly?: boolean): CascaderOption[];
  clearCheckedNodes(): void;
  getFlattedNodes(leafOnly?: boolean): CascaderNode[];
  scrollToExpandingNode(): void;
  loadLazyRootNodes(): void;
  handleKeyDown(event: KeyboardEvent): void;
}
export const CascaderPanel = withInstall<typeof Component, CascaderPanelInstance>(Component);
export default CascaderPanel;
