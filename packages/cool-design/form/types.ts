export interface FormRule {
  required?: boolean;
  message?: string;
  trigger?: 'blur' | 'change';
  type?: string;
  min?: number;
  max?: number;
  len?: number;
  pattern?: RegExp;
  whitespace?: boolean;
  transform?: (value: unknown) => unknown;
  validator?: (value: unknown) => void | Promise<void>;
}
export interface FormFieldContext {
  prop: string;
  validate: (trigger?: 'blur' | 'change') => Promise<boolean>;
  resetField: () => void;
  clearValidate: () => void;
  scrollTo?: () => void;
  focus: () => void;
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
