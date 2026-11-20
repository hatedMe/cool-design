import { defineComponent, nextTick, provide, watch, type PropType } from 'vue';
import type { Size } from '../config-provider/context';
import { formKey, normalizeFieldPath, type Field } from './context';
import type { FormRule } from './types';
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
    const resetFields = () => {
      for (const field of fields.keys()) field.reset();
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
        if (fields.get(field) === key) return;
        fields.set(field, key);
        registrationVersion++;
      },
      unregister: (field) => {
        if (fields.delete(field)) registrationVersion++;
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
      statusIcon: () => props.statusIcon
    });
    expose({
      async validate(): Promise<boolean> {
        const currentModel = modelVersion;
        const currentRegistration = registrationVersion;
        const registered = [...fields];
        const results = await Promise.all(registered.map(([field]) => field.validate()));
        await nextTick();
        if (currentModel !== modelVersion || currentRegistration !== registrationVersion) {
          return Promise.reject({});
        }
        const invalidFields = new Map<string, string[]>();
        results.forEach((result, index) => {
          if (result === false) {
            const [field, key] = registered[index];
            const messages = invalidFields.get(key) ?? [];
            messages.push(field.error?.() ?? '校验失败');
            invalidFields.set(key, messages);
          }
        });
        const invalid = results.indexOf(false);
        if (invalid >= 0) {
          const [field] = registered[invalid];
          if (props.scrollToError) field.scrollTo?.(props.scrollToErrorOffset);
          field.focus();
          return Promise.reject(Object.fromEntries(invalidFields));
        }
        return true;
      },
      async validateField(props?: string | string[]) {
        const keys = props ? (Array.isArray(props) ? props : [props]).map(normalizeFieldPath) : undefined;
        const results = await Promise.all(
          [...fields].filter(([, key]) => !keys || keys.includes(key)).map(([field]) => field.validate())
        );
        return results.every((result) => result !== false);
      },
      resetFields() {
        resetFields();
      },
      clearValidate() {
        for (const field of fields.keys()) field.clear();
      },
      scrollToField(props?: string | string[]) {
        const keys = props ? (Array.isArray(props) ? props : [props]).map(normalizeFieldPath) : undefined;
        const registered = [...fields];
        const match = keys ? keys.map((key) => registered.find(([, path]) => path === key)).find(Boolean) : registered[0];
        match?.[0].scrollTo?.();
      },
      get fields() {
        return [...fields].map(([field, prop]) => ({
          prop,
          validate: field.validate,
          resetField: field.reset,
          clearValidate: field.clear,
          scrollTo: field.scrollTo,
          focus: field.focus,
          error: field.error
        }));
      }
    });
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
