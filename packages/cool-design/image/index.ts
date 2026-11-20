import './index.scss';
import { withInstall } from '../../../src/utils/with-install';
import Component from './image';
import ViewerComponent from './image-viewer';

export interface ImageInstance {
  showPreview(): void;
}
export const Image = withInstall<typeof Component, ImageInstance>(Component);
export interface ImageViewerInstance {
  readonly index: number;
  readonly activeIndex: number;
  prev(): void;
  next(): void;
  setActiveItem(value: number): void;
  zoomIn(): void;
  zoomOut(): void;
  reset(): void;
  rotate(clockwise?: boolean): void;
  close(): void;
}
export const ImageViewer = withInstall<typeof ViewerComponent, ImageViewerInstance>(ViewerComponent);
export default Image;
export type { ImageFit, ImageLoading, ImageReferrerPolicy } from './image';
export type { ImageViewerToolbarActions } from './image-viewer';
