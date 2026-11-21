import './index.scss';
import { withInstall } from '../../../src/utils/with-install';
import Component from './timeline';
import ItemComponent from './timeline-item';

export const Timeline = withInstall(Component);
export const TimelineItem = withInstall(ItemComponent);
export default Timeline;
export type { TimelineItem as TimelineItemData, TimelineMode } from './timeline';
export type { TimelineItemPlacement, TimelineItemSize, TimelineItemType } from './timeline-item';
