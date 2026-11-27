import './index.scss';
import { withInstall } from '../../../src/utils/with-install';

import _Icon from './icon';

export const Icon = withInstall(_Icon);
export default Icon;

export { iconNames } from './icons';
export type IconProp = string | import('vue').Component;
