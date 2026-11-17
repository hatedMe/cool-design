import { withInstall } from '../../../src/utils/with-install';
import Component from './segmented';
import './index.scss';
export type { SegmentedOption, SegmentedRawOption, SegmentedValue } from './segmented';
export const Segmented = withInstall(Component);
export default Segmented;
