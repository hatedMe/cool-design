import { defineComponent, nextTick, provide, watch, type PropType } from 'vue';
import type { Size } from '../config-provider/context';
import { cloneFormValue, formKey, getFieldPathParts, getFieldValue, normalizeFieldPath, setFieldValue, type Field } from './context';
import type { ValidateError, ValidateFieldsError } from 'async-validator';
import type { FormFieldPaths, FormInstance, FormItemProp, FormRule, FormValidateCallback } from './types';
export default defineComponent({
  name: 'i-form',
  props: {
    model: { type: Object as PropType<Record<string, unknown>>, required: true },
    rules: { type: Object as PropType<Record<string, FormRule[]>>, default: () => ({}) },
    inline: Boolean,
    labelPosition: { type: String as PropType<'left' | 'right' | 'top'>, default: 'right' },
    labelWidth: [String, Number],
    labelSuffix: String,
    disabled: Boolean,
    size: String as PropType<Size>,
    showMessage: { type: Boolean, default: true },
    hideRequiredAsterisk: Boolean,
    requireAsteriskPosition: { type: String as PropType<'left' | 'right'>, default: 'left' },
    inlineMessage: Boolean,
    statusIcon: Boolean,
    scrollToError: Boolean,
    scrollToErrorOffset: { type: Number, default: undefined },
    scrollIntoViewOptions: { type: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>, default: true },
    validateOnRuleChange: { type: Boolean, default: true }
  },
  emits: ['submit', 'validate'],
  setup(props, { slots, expose, emit }) {
    let modelVersion = 0;
    watch(
      () => props.model,
      () => {
        modelVersion++;
      },
      { flush: 'sync', deep: true }
    );
    const fields = new Map<Field, string>();
    let registrationVersion = 0;
    const initialValues = new Map<string, unknown>();
    const getKeys = (paths?: FormFieldPaths) =>
      (Array.isArray(paths) ? paths : paths ? [paths] : []).map(normalizeFieldPath);
    const selectFields = (paths?: FormFieldPaths) => {
      const keys = getKeys(paths);
      return [...fields].filter(([, key]) => !keys.length || keys.includes(key));
    };
    const getField = (path: FormItemProp) => {
      const key = normalizeFieldPath(path);
      return [...fields].find(([, registeredPath]) => registeredPath === key)?.[0];
    };
    const resetFields = (paths?: FormFieldPaths) => {
      const keys = getKeys(paths);
      for (const [field] of selectFields(paths)) field.resetField();
      const active = new Set(fields.values());
      for (const [key, value] of initialValues) {
        if (!active.has(key) && (!keys.length || keys.includes(key))) {
          setFieldValue(props.model, getFieldPathParts(key), cloneFormValue(value));
        }
      }
    };
    watch(
      () => props.rules,
      () => {
        if (props.validateOnRuleChange) for (const field of fields.keys()) field.validate();
      },
      { deep: true }
    );
    provide(formKey, {
      model: () => props.model!,
      rules: () => props.rules,
      register: (key, field) => {
        const previous = fields.get(field);
        if (previous === key) return;
        if (previous !== undefined) {
          initialValues.delete(previous);
          initialValues.delete(key);
        }
        if (initialValues.has(key)) field.setInitialValue(initialValues.get(key));
        else initialValues.set(key, cloneFormValue(field.getInitialValue()));
        fields.set(field, key);
        registrationVersion++;
      },
      unregister: (field) => {
        const key = fields.get(field);
        if (key === undefined) return;
        initialValues.set(key, cloneFormValue(field.getInitialValue()));
        fields.delete(field);
        registrationVersion++;
      },
      disabled: () => props.disabled,
      size: () => props.size,
      resetFields,
      labelSuffix: () => props.labelSuffix,
      labelPosition: () => props.labelPosition,
      labelWidth: () => props.labelWidth,
      emitValidate: (prop, isValid, message) => emit('validate', prop, isValid, message),
      hideRequiredAsterisk: () => props.hideRequiredAsterisk,
      requireAsteriskPosition: () => props.requireAsteriskPosition,
      inlineMessage: () => props.inlineMessage,
      statusIcon: () => props.statusIcon,
      scrollIntoViewOptions: () => props.scrollIntoViewOptions
    });
    const validateField = async (paths?: FormFieldPaths, callback?: FormValidateCallback) => {
      const currentModel = modelVersion;
      const currentRegistration = registrationVersion;
      const registered = selectFields(paths);
      const results = await Promise.all(registered.map(([field]) => field.check()));
      await nextTick();
      const stale = currentModel !== modelVersion || currentRegistration !== registrationVersion;
      const invalid = results.findIndex((result) => result !== true);
      if (!stale && invalid === -1) {
        await callback?.(true);
        return true;
      }
      let invalidFields: ValidateFieldsError = {};
      if (!stale) {
        const errors = new Map<string, ValidateError[]>();
        results.forEach((result, index) => {
          if (!Array.isArray(result)) return;
          const key = registered[index][1];
          errors.set(key, [...(errors.get(key) ?? []), ...result]);
        });
        invalidFields = Object.fromEntries(errors);
        if (errors.size) {
          const [field] = registered[results.findIndex(Array.isArray)];
          if (props.scrollToError) field.scrollTo?.(props.scrollToErrorOffset);
          field.focus();
        }
      }
      if (callback) {
        await callback(false, invalidFields);
        return false;
      }
      return Promise.reject(invalidFields);
    };
    const instance: FormInstance = {
      validate: (callback) => validateField(undefined, callback),
      validateField,
      resetFields,
      clearValidate(paths) {
        for (const [field] of selectFields(paths)) field.clearValidate();
      },
      scrollToField(paths) {
        if (paths === undefined) {
          fields.keys().next().value?.scrollTo?.();
          return;
        }
        const directPath = Array.isArray(paths) && paths.length && paths.every((part) => typeof part === 'string')
          ? getField(paths.join('.'))
          : undefined;
        const field = directPath ?? getKeys(paths).map(getField).find(Boolean);
        field?.scrollTo?.();
      },
      getField,
      setInitialValues(model) {
        for (const key of initialValues.keys()) {
          initialValues.set(key, cloneFormValue(getFieldValue(model, getFieldPathParts(key))));
        }
        for (const [field, key] of fields) {
          const value = getFieldValue(model, getFieldPathParts(key));
          initialValues.set(key, cloneFormValue(value));
          field.setInitialValue(value);
        }
      },
      get fields() {
        return [...fields.keys()];
      }
    };
    expose(instance);

    return () => (
      <form
        class={['i-form', props.inline && 'is-inline', `i-form--label-${props.labelPosition}`]}
        style={{
          '--i-form-label-width': typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
        }}
        novalidate
        onSubmit={(event: Event) => {
          event.preventDefault();
          emit('submit', event);
        }}>
        {slots.default?.()}
      </form>
    );
  }
});
