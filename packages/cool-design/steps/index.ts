import './index.scss';
import { withInstall } from '../../../src/utils/with-install';
import Component from './steps';
import Item from './step';

export const Steps = withInstall(Component);
export const Step = withInstall(Item);
export default Steps;
export type { StepItem as StepItemOption, StepStatus, StepsDirection } from './steps';
