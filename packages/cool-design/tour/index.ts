import { withInstall } from '../../../src/utils/with-install';
import Component from './tour';
import './index.scss';
export type { TourPlacement, TourStep, TourTarget, TourType } from './types';
export interface TourInstance {
  go(index: number): void;
  prev(): void;
  next(): void;
}
export const Tour = withInstall<typeof Component, TourInstance>(Component);
export default Tour;
