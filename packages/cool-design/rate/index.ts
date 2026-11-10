import { withInstall } from '../../../src/utils/with-install';
import Component from './rate';
import './index.scss';

export const Rate = withInstall(Component);
export default Rate;
export type { RateColor, RateExposed, RateIcon, RateIconMap, RateProps, RateSize, RateThresholdMap, RateThresholdValue } from './types';
