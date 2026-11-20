import { withInstall } from '../../../src/utils/with-install';
import Component from './form';
export const Form = withInstall(Component);
export default Form;
export type { FormRule, FormInstance, FormFieldContext, FormItemInstance, FormValidateCallback, FormValidateState, FormItemProp, FormFieldPaths } from './types';
