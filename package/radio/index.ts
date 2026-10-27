import { withInstall } from '../../src/utils/with-install';

import './index.scss';
import _Radio from './radio';
import _RadioGroup from './group';

export const Radio = withInstall(_Radio);
export const RadioGroup = withInstall(_RadioGroup);
export type { RadioValue } from './radio';
export default Radio;
