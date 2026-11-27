import type { RuleItem, ValidateOption, ValidateResult, Value, Values, ValidateFieldsError } from 'async-validator';

export type FormItemProp = string | string[];
export type FormFieldPaths = FormItemProp | FormItemProp[];
export type FormValidateCallback = (isValid: boolean, invalidFields?: ValidateFieldsError) => void | Promise<void>;
export type FormValidateState = '' | 'error' | 'validating' | 'success';

export interface FormRule {
  required?: boolean;
  message?: string;
  trigger?: string | string[];
  type?: string;
  min?: number;
  max?: number;
  len?: number;
  pattern?: RegExp;
  whitespace?: boolean;
  transform?: (value: unknown) => unknown;
  // The first argument is the field value for legacy one-argument validators.
  validator?: (
    ruleOrValue: Value,
    value: Value,
    callback: (error?: string | Error) => void,
    source: Values,
    options: ValidateOption
  ) => ValidateResult;
  asyncValidator?: RuleItem['asyncValidator'];
}
export interface FormFieldContext extends FormItemInstance {
  readonly prop: string;
  scrollTo?: (offset?: number) => void;
  focus: () => void;
  error?: () => string;
}
export interface FormInstance {
  validate(callback?: FormValidateCallback): Promise<boolean>;
  validateField(props?: FormFieldPaths, callback?: FormValidateCallback): Promise<boolean>;
  resetFields(props?: FormFieldPaths): void;
  clearValidate(props?: FormFieldPaths): void;
  scrollToField(props?: FormFieldPaths): void;
  getField(prop: FormItemProp): FormFieldContext | undefined;
  setInitialValues(model: Record<string, unknown>): void;
  fields: FormFieldContext[];
}
export interface FormItemInstance {
  readonly validateState: FormValidateState;
  readonly validateMessage: string;
  setInitialValue: (value: unknown) => void;
  validate: (trigger?: 'blur' | 'change') => Promise<boolean>;
  resetField: () => void;
  clearValidate: () => void;
}
