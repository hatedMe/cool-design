import { withInstall } from '../../../src/utils/with-install';
import Component from './tour';
import './index.scss';
export type { TourPlacement, TourStep, TourTarget, TourType } from './types';
export const Tour = withInstall(Component);
export default Tour;
