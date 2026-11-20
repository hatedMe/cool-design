import { withInstall } from '../../../src/utils/with-install';
import Component from './form-item';
import type { FormItemInstance } from '../form/types';
export type { FormItemInstance } from '../form/types';
export const FormItem = withInstall<typeof Component, FormItemInstance>(Component);
export default FormItem;
