import { inject, type InjectionKey } from "vue";
import type { FormRule } from "./types";
export interface Field {
  validate: (trigger?: "blur" | "change") => Promise<boolean>;
  reset: () => void;
  clear: () => void;
  focus: () => void;
}
export interface FormContext {
  model: () => Record<string, unknown>;
  rules: () => Record<string, FormRule[]>;
  register: (key: string, field: Field) => void;
  unregister: (key: string) => void;
  disabled?: () => boolean;
  size?: () => "small" | "default" | "large" | undefined;
}
export interface FieldContext {
  id: string;
  errorId: string;
  invalid: () => boolean;
  validate: (trigger: "blur" | "change") => void;
  disabled?: () => boolean;
  size?: () => "small" | "default" | "large" | undefined;
}
export const formKey: InjectionKey<FormContext> = Symbol("form");
export const fieldKey: InjectionKey<FieldContext> = Symbol("field");
let fieldId = 0;
export const nextFieldId = () => `i-field-${++fieldId}`;
export const useField = () => inject(fieldKey, undefined);
