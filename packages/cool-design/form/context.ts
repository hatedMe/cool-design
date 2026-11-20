import { inject, toRaw, type InjectionKey } from 'vue';
import type { ValidateError } from 'async-validator';
import type { FormFieldContext, FormItemProp, FormRule } from './types';

export const getFieldPathParts = (path?: FormItemProp) =>
  Array.isArray(path)
    ? path
    : (path ?? '')
        .replace(/\[(\w+)\]/g, '.$1')
        .split('.')
        .filter(Boolean);

export const normalizeFieldPath = (path: FormItemProp) => getFieldPathParts(path).join('.');
export const getFieldValue = (model: unknown, path: string[]) =>
  path.reduce<unknown>(
    (value, part) => (value as Record<string, unknown> | undefined)?.[part],
    model
  );

export const setFieldValue = (model: Record<string, unknown>, parts: string[], value: unknown) => {
  if (parts.includes('__proto__')) return;
  let target = model;
  parts.slice(0, -1).forEach((part, index) => {
    if (!Object.prototype.hasOwnProperty.call(target, part) || !target[part] || typeof target[part] !== 'object') {
      target[part] = /^\d+$/.test(parts[index + 1]) ? [] : {};
    }
    target = target[part] as Record<string, unknown>;
  });
  target[parts[parts.length - 1]] = value;
};

export function cloneFormValue(value: unknown, seen = new WeakMap<object, unknown>()): unknown {
  if (value === null || typeof value !== 'object') return value;
  const raw = toRaw(value);
  if (seen.has(raw)) return seen.get(raw);
  if (raw instanceof Date) return new Date(raw);
  if (raw instanceof RegExp) return new RegExp(raw);
  if (raw instanceof Map) {
    const copy = new Map<unknown, unknown>();
    seen.set(raw, copy);
    raw.forEach((entry, key) => copy.set(key, cloneFormValue(entry, seen)));
    return copy;
  }
  if (raw instanceof Set) {
    const copy = new Set<unknown>();
    seen.set(raw, copy);
    raw.forEach((entry) => copy.add(cloneFormValue(entry, seen)));
    return copy;
  }
  if (raw instanceof ArrayBuffer) return raw.slice(0);
  if (ArrayBuffer.isView(raw)) {
    if (raw instanceof DataView) {
      const buffer = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
      return new DataView(buffer);
    }
    const View = raw.constructor as new (source: typeof raw) => typeof raw;
    return new View(raw);
  }
  const prototype = Object.getPrototypeOf(raw);
  if (!Array.isArray(raw) && Object.prototype.toString.call(raw) !== '[object Object]') {
    try {
      return typeof structuredClone === 'function' ? structuredClone(raw) : raw;
    } catch {
      return raw;
    }
  }
  const copy = Array.isArray(raw) ? new Array(raw.length) : Object.create(prototype);
  seen.set(raw, copy);
  for (const key of Reflect.ownKeys(raw)) {
    if (Object.prototype.propertyIsEnumerable.call(raw, key)) {
      Object.defineProperty(copy, key, {
        value: cloneFormValue(Reflect.get(raw, key), seen), enumerable: true, configurable: true, writable: true
      });
    }
  }
  return copy;
}

export interface Field extends FormFieldContext {
  check: (trigger?: 'blur' | 'change') => Promise<true | false | ValidateError[]>;
  getInitialValue: () => unknown;
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
  scrollIntoViewOptions: () => ScrollIntoViewOptions | boolean;
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
