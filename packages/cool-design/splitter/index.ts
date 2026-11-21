import { withInstall } from '../../../src/utils/with-install';
import Component from './splitter';
import Panel from './splitter-panel';
import './index.scss';
export type { SplitterLayout, SplitterPanelMeta, SplitterSize } from './context';
export const Splitter = withInstall(Component);
export interface SplitterPanelInstance {
  readonly splitterPanelRef: HTMLElement | null | undefined;
}
export const SplitterPanel = withInstall<typeof Panel, SplitterPanelInstance>(Panel);
export default Splitter;
