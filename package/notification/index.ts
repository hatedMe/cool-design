import { withFunctionInstall } from '../../src/utils/install';

import notify from './notify';

export const Notify = withFunctionInstall(notify , '$notify');
export default Notify;
