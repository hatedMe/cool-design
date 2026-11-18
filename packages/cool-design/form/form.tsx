import { defineComponent, nextTick, provide, watch, type PropType } from 'vue';
import type { Size } from '../config-provider/context';
import { formKey, type Field } from './context';
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
    const fields = new Map<string, Field>();
    const resetFields = () => {
      fields.forEach((field) => field.reset());
    };
    watch(
      () => props.rules,
      () => {
        if (props.validateOnRuleChange) fields.forEach((field) => field.validate());
      },
      { deep: true }
    );
    provide(formKey, {
      model: () => props.model!,
      rules: () => props.rules,
      register: (key, field) => fields.set(key, field),
      unregister: (key) => fields.delete(key),
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
        const version = modelVersion;
        const registered = [...fields.values()];
        const results = await Promise.all(registered.map((field) => field.validate()));
        const invalidFields: Record<string, string[]> = {};
        const propList = [...fields.keys()];
        results.forEach((result, index) => {
          if (result === false) {
            invalidFields[propList[index]] = [registered[index].error?.() ?? '校验失败'];
          }
        });
        const invalid = results.indexOf(false);
        if (invalid >= 0) {
          await nextTick();
          if (props.scrollToError) registered[invalid].scrollTo?.(props.scrollToErrorOffset);
          registered[invalid].focus();
        }
        if (invalid >= 0 || version !== modelVersion) return Promise.reject(invalidFields);
        return true;
      },
      async validateField(props?: string | string[]) {
        const keys = props ? (Array.isArray(props) ? props : [props]) : [...fields.keys()];
        const results = await Promise.all(keys.map((key) => fields.get(key)?.validate()));
        return results.every((result) => result !== false);
      },
      resetFields() {
        resetFields();
      },
      clearValidate() {
        fields.forEach((field) => field.clear());
      },
      scrollToField(props?: string | string[]) {
        const keys = props ? (Array.isArray(props) ? props : [props]) : [...fields.keys()];
        keys
          .map((key) => fields.get(key))
          .find((field) => field)
          ?.scrollTo?.();
      },
      get fields() {
        return [...fields.entries()].map(([prop, field]) => ({
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
