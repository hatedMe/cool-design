import { withInstall } from '../../../src/utils/with-install';

import _Button from './button';
import _ButtonGroup from './group';

export const Button = withInstall(_Button);
export const ButtonGroup = withInstall(_ButtonGroup);
export default Button;

export type { ButtonType, ButtonSize, ButtonNativeType, ButtonGroupDirection, IButtonProps, IconProp } from './button';
