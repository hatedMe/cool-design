import { withInstall } from '../../../src/utils/with-install';
import { withFunctionInstall } from '../../../src/utils/install';
import Component from './loading';
import { service } from './service';
export const Loading = Object.assign(withInstall(Component), { service });
export const ElLoading = withFunctionInstall(service, '$loading');
export default Loading;
export type { LoadingInstance, LoadingServiceOptions } from './service';
