import { withInstall } from '../../../src/utils/with-install';
import Component from './auto-resizer';
import './index.scss';

export const AutoResizer = withInstall(Component);
export default AutoResizer;
export type { AutoResizerSize } from './auto-resizer';
