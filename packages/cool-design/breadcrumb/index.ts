import './index.scss';
import { withInstall } from '../../../src/utils/with-install';
import Component from './breadcrumb';
import Item from './breadcrumb-item';

export const Breadcrumb = withInstall(Component);
export const BreadcrumbItem = withInstall(Item);
export default Breadcrumb;
export type { BreadcrumbItem as BreadcrumbItemOption } from './breadcrumb';
export type { BreadcrumbTo } from './breadcrumb-item';
