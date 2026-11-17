import { withInstall } from '../../../src/utils/with-install';
import Component from './splitter';
import Panel from './splitter-panel';
import './index.scss';
export type { SplitterLayout, SplitterPanelMeta, SplitterSize } from './context';
export const Splitter = withInstall(Component);
export const SplitterPanel = withInstall(Panel);
export default Splitter;
