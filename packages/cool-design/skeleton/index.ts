import { withInstall } from '../../../src/utils/with-install';
import Component from './skeleton';
import Item from './skeleton-item';

export const Skeleton = withInstall(Component);
export const SkeletonItem = withInstall(Item);
export default Skeleton;
export type { SkeletonItemVariant } from './skeleton-item';
