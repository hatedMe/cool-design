import { withInstall } from '../../../src/utils/with-install';
import Component from './form';
import type { FormInstance } from './types';
export const Form = withInstall<typeof Component, FormInstance>(Component);
export default Form;
export type { FormRule, FormInstance, FormFieldContext, FormItemInstance, FormValidateCallback, FormValidateState, FormItemProp, FormFieldPaths } from './types';
