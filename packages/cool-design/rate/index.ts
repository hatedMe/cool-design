import type { RateExposed } from './types';
import { withInstall } from '../../../src/utils/with-install';
import Component from './rate';
import './index.scss';

export type RateInstance = RateExposed;
export const Rate = withInstall<typeof Component, RateInstance>(Component);
export default Rate;
export type { RateColor, RateExposed, RateIcon, RateIconMap, RateProps, RateSize, RateThresholdMap, RateThresholdValue } from './types';
