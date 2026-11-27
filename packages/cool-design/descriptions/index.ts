import { withInstall } from '../../../src/utils/with-install';
import Component from './descriptions';
import Item from './descriptions-item';

export const Descriptions = withInstall(Component);
export const DescriptionsItem = withInstall(Item);
export default Descriptions;
export type { DescriptionItem } from './descriptions';
export type { DescriptionsDirection, DescriptionsSize } from './descriptions';
export type { DescriptionsItemAlign } from './descriptions-item';
