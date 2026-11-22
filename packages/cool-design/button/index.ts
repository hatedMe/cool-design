import { withInstall } from '../../../src/utils/with-install';

import _Button from './button';
import _ButtonGroup from './group';
import type { ButtonExposed } from './types';

export const Button = withInstall<typeof _Button, ButtonExposed>(_Button);
export const ButtonGroup = withInstall(_ButtonGroup);
export default Button;

export type ButtonInstance = InstanceType<typeof Button>;
export type { ButtonType, ButtonSize, ButtonNativeType, ButtonGroupDirection, IButtonProps, IconProp } from './button';
