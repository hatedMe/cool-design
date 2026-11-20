import { inject, type InjectionKey } from 'vue';
import type { FormItemProp, FormRule } from './types';

export const getFieldPathParts = (path?: FormItemProp) =>
  Array.isArray(path)
    ? path
    : (path ?? '')
        .replace(/\[(\w+)\]/g, '.$1')
        .split('.')
        .filter(Boolean);

export const normalizeFieldPath = (path: FormItemProp) => getFieldPathParts(path).join('.');
export interface Field {
  validate: (trigger?: 'blur' | 'change') => Promise<boolean>;
  reset: () => void;
  clear: () => void;
  focus: () => void;
  scrollTo?: (offset?: number) => void;
  error?: () => string;
}
export interface FormContext {
  model: () => Record<string, unknown>;
  rules: () => Record<string, FormRule[]>;
  register: (key: string, field: Field) => void;
  unregister: (field: Field) => void;
  disabled?: () => boolean;
  size?: () => 'small' | 'default' | 'large' | undefined;
  resetFields?: () => void;
  labelSuffix?: () => string | undefined;
  labelPosition?: () => 'left' | 'right' | 'top' | undefined;
  labelWidth?: () => string | number | undefined;
  emitValidate?: (prop: FormItemProp, isValid: boolean, message?: string) => void;
  hideRequiredAsterisk?: () => boolean;
  requireAsteriskPosition?: () => 'left' | 'right';
  inlineMessage?: () => boolean;
  statusIcon?: () => boolean;
}
export interface FieldContext {
  id: string;
  labelId?: string;
  getLabelId?: () => string | undefined;
  errorId: string;
  invalid: () => boolean;
  validate: (trigger: 'blur' | 'change') => void;
  disabled?: () => boolean;
  size?: () => 'small' | 'default' | 'large' | undefined;
}
export const formKey: InjectionKey<FormContext> = Symbol('form');
export const fieldKey: InjectionKey<FieldContext> = Symbol('field');
let fieldId = 0;
export const nextFieldId = () => `i-field-${++fieldId}`;
export const useField = () => inject(fieldKey, undefined);
