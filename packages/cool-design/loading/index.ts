import { withInstall } from '../../../src/utils/with-install';
import Component from './loading';
import { service } from './service';
export const Loading = Object.assign(withInstall(Component), { service });
export default Loading;
export type { LoadingInstance, LoadingServiceOptions } from './service';
