import type { RuleItem, ValidateOption, ValidateResult, Value, Values } from 'async-validator';

export type FormItemProp = string | string[];

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
export interface FormFieldContext {
  prop: string;
  validate: (trigger?: 'blur' | 'change') => Promise<boolean>;
  resetField: () => void;
  clearValidate: () => void;
  scrollTo?: (offset?: number) => void;
  focus: () => void;
  error?: () => string;
}
export interface FormInstance {
  validate(): Promise<boolean>;
  validateField(props?: string | string[]): Promise<boolean>;
  resetFields(): void;
  clearValidate(): void;
  scrollToField(props?: string | string[]): void;
  fields: FormFieldContext[];
}
export interface FormItemInstance {
  validate: (trigger?: 'blur' | 'change') => Promise<boolean>;
  resetField: () => void;
  clearValidate: () => void;
}
