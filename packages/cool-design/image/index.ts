import { withInstall } from '../../../src/utils/with-install';
import Component from './image';
import ViewerComponent from './image-viewer';

export const Image = withInstall(Component);
export const ImageViewer = withInstall(ViewerComponent);
export default Image;
export type { ImageFit, ImageLoading, ImageReferrerPolicy } from './image';
export type { ImageViewerToolbarActions } from './image-viewer';
