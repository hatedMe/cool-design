import { withInstall } from '../../../src/utils/with-install';
import Component from './countdown';
import './index.scss';
export type { CountdownValue } from './countdown';
export const Countdown = withInstall(Component);
export default Countdown;
