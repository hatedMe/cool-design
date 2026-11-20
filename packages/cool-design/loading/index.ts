import { withInstall } from '../../../src/utils/with-install';
import type { App, AppContext } from 'vue';
import { LoadingDirective } from '../directives';
import Component from './loading';
import { service } from './service';
export const Loading = Object.assign(withInstall(Component), { service });
export const ElLoading: typeof service & { service: typeof service; directive: typeof LoadingDirective; install(app: App): void } = Object.assign(service, {
  service,
  directive: LoadingDirective,
  install(app: App) {
    const context = app._context;
    app.config.globalProperties.$loading = (options?: Parameters<typeof service>[0], appContext: AppContext | null = context) =>
      service(options, appContext);
    if (!app.directive('loading')) app.directive('loading', LoadingDirective);
  }
});
export { LoadingDirective as ElLoadingDirective, LoadingDirective as vLoading, service as ElLoadingService };
export default Loading;
export type { LoadingInstance, LoadingServiceOptions } from './service';
