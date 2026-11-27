import type { App } from 'vue';
import { withInstall } from '../../../src/utils/with-install';
import type { TooltipInstance } from '../tooltip';
import Component from './popconfirm';
export type { PopconfirmActions } from './popconfirm';

interface PopconfirmExposed {
  readonly popperRef: TooltipInstance['popperRef'] | undefined;
  show(): void;
  hide(): void;
}

type PopconfirmOptions = { [K in keyof typeof Component]: (typeof Component)[K] };
type InstalledPopconfirm = PopconfirmOptions & { install(app: App): void } & (
  new (...args: ConstructorParameters<typeof Component>) => InstanceType<typeof Component> & PopconfirmExposed
);
export const Popconfirm: InstalledPopconfirm = withInstall(Component) as InstalledPopconfirm;
export default Popconfirm;
export type PopconfirmInstance = InstanceType<typeof Popconfirm>;
export type PopconfirmProps = PopconfirmInstance['$props'];
