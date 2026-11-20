import {
  computed,
  defineComponent,
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  watch,
  type PropType
} from 'vue';
import Schema, { type RuleItem, type ValidateResult } from 'async-validator';
import { formKey, fieldKey, getFieldPathParts, nextFieldId, normalizeFieldPath, type Field } from '../form/context';
import type { FormItemProp, FormRule } from '../form/types';

function normalizeRule(rule: FormRule): RuleItem {
  const { validator, asyncValidator } = rule;
  const validate = asyncValidator ?? validator;
  const legacy = !asyncValidator && !!validator && validator.length < 2;
  return {
    ...rule,
    whitespace: rule.whitespace ?? (rule.required ? true : undefined),
    type: rule.type as RuleItem['type'],
    asyncValidator: undefined,
    validator: validate
      ? (schemaRule, value, callback, source, options) => {
          void new Promise<void>((resolve, reject) => {
            const fail = (reason: unknown) => {
              if (reason instanceof Error || (!legacy && (typeof reason === 'string' || Array.isArray(reason)))) {
                reject(reason);
              } else {
                reject(new Error('校验失败'));
              }
            };
            const finish = (error?: string | Error) => (error === undefined ? resolve() : reject(error));
            try {
              const result: ValidateResult = legacy
                ? Reflect.apply(validate, rule, [value])
                : Reflect.apply(validate, schemaRule, [schemaRule, value, finish, source, options]);
              if (result && typeof result === 'object' && 'then' in result) {
                void Promise.resolve(result).then(resolve, fail);
              } else if (legacy || result === true) {
                resolve();
              } else if (result === false) {
                reject(new Error(`${schemaRule.fullField || schemaRule.field} fails`));
              } else if (result !== undefined) {
                reject(result);
              }
            } catch (reason) {
              fail(reason);
            }
          }).then(() => callback(), callback);
        }
      : undefined
  };
}

export default defineComponent({
  name: 'i-form-item',
  props: {
    prop: [String, Array] as PropType<FormItemProp>,
    label: String,
    required: Boolean,
    labelPosition: String as PropType<'left' | 'right' | 'top'>,
    labelWidth: [String, Number],
    showMessage: { type: Boolean, default: true },
    rules: [Object, Array] as PropType<FormRule | FormRule[]>,
    error: String,
    inlineMessage: Boolean,
    size: String as PropType<'small' | 'default' | 'large'>
  },
  setup(props, { slots, expose }) {
    const form = inject(formKey);
    const id = nextFieldId();
    const labelId = computed(() => (props.label || slots.label ? `${id}-label` : undefined));
    const errorId = `${id}-error`;
    const error = ref('');
    const passed = ref(false);
    const root = ref<HTMLElement>();
    let revision = 0;
    const displayError = computed(() => props.error ?? error.value);
    const pathParts = computed(() => getFieldPathParts(props.prop));
    const propKey = computed(() => pathParts.value.join('.'));
    const getValue = () =>
      propKey.value
        ? pathParts.value.reduce<unknown>(
            (value, part) => (value as Record<string, unknown> | undefined)?.[part],
            form?.model()
          )
        : undefined;
    const setValue = (value: unknown) => {
      if (!propKey.value || !form) return;
      const parts = pathParts.value;
      let target = form.model() as Record<string, unknown>;
      parts.slice(0, -1).forEach((part) => {
        if (!target[part] || typeof target[part] !== 'object') target[part] = {};
        target = target[part] as Record<string, unknown>;
      });
      target[parts[parts.length - 1]] = value;
    };
    watch(
      getValue,
      () => {
        revision++;
      },
      { flush: 'sync', deep: true }
    );
    let initial: unknown;
    const clear = () => {
      revision++;
      error.value = '';
      passed.value = false;
    };
    const rulesOf = (key: string): FormRule[] => {
      if (props.rules) return Array.isArray(props.rules) ? props.rules : [props.rules];
      const formRules = form?.rules();
      if (!formRules) return [];
      const exactKey = typeof props.prop === 'string' ? props.prop : key;
      const ruleKey =
        [exactKey, key].find((candidate) => Object.prototype.hasOwnProperty.call(formRules, candidate)) ??
        Object.keys(formRules).find((candidate) => normalizeFieldPath(candidate) === key);
      return (ruleKey && formRules[ruleKey]) || [];
    };
    const validate = async (trigger?: 'blur' | 'change') => {
      const prop = props.prop;
      const key = propKey.value;
      if (!prop || !key) return true;
      const value = getValue();
      const rules = rulesOf(key).filter(
        (rule) =>
          !trigger ||
          !rule.trigger ||
          (Array.isArray(rule.trigger) ? rule.trigger.includes(trigger) : rule.trigger === trigger)
      );
      if (trigger && !rules.length) return !error.value;
      const current = ++revision;
      try {
        const schemaKey = key in Object.prototype ? 'value' : key;
        await new Schema({ [schemaKey]: rules.map(normalizeRule) }).validate(
          { [schemaKey]: value },
          { suppressWarning: true, firstFields: true }
        );
        if (current !== revision) return false;
        error.value = '';
        passed.value = rules.length > 0;
        form?.emitValidate?.(prop, true);
        return true;
      } catch (reason) {
        if (current !== revision) return false;
        const first = (reason as { errors?: Array<{ message?: string }> })?.errors?.[0];
        error.value = first?.message || (reason instanceof Error ? reason.message : '校验失败');
        passed.value = false;
        form?.emitValidate?.(prop, false, error.value);
        return false;
      }
    };
    provide(fieldKey, {
      id,
      labelId: undefined,
      getLabelId: () => labelId.value,
      errorId,
      invalid: () => !!displayError.value,
      disabled: () => !!form?.disabled?.(),
      size: () => props.size ?? form?.size?.(),
      validate: (trigger) => {
        nextTick(() => validate(trigger));
      }
    });
    const scrollTo = (offset?: number) => {
      if (!root.value) return;
      if (offset !== undefined) {
        window.scrollTo?.({ top: root.value.getBoundingClientRect().top + window.scrollY - offset });
        return;
      }
      root.value.scrollIntoView?.({ block: 'center' });
    };
    const field: Field = {
      validate,
      clear,
      reset: () => {
        setValue(initial);
        clear();
      },
      focus: () =>
        root.value
          ?.querySelector<HTMLElement>(
            'input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)'
          )
          ?.focus(),
      scrollTo,
      error: () => error.value
    };
    watch(
      propKey,
      (key, previousKey) => {
        if (previousKey) clear();
        if (key) {
          const value = getValue();
          initial = value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
          form?.register(key, field);
        } else {
          form?.unregister(field);
        }
      },
      { immediate: true }
    );
    onBeforeUnmount(() => {
      clear();
      form?.unregister(field);
    });
    expose({
      validate,
      resetField: field.reset,
      clearValidate: clear
    });
    return () => {
      const labelPosition = props.labelPosition ?? form?.labelPosition?.() ?? 'right';
      const labelWidth = props.labelWidth ?? form?.labelWidth?.();
      const hideAsterisk = !!form?.hideRequiredAsterisk?.();
      const asteriskPosition = form?.requireAsteriskPosition?.() ?? 'left';
      const asterisk = props.required && !hideAsterisk && (
        <span aria-hidden='true' class='i-form-item__required'>
          *
        </span>
      );
      const inlineMessage = props.inlineMessage || !!form?.inlineMessage?.();
      const statusIcon = !!form?.statusIcon?.();
      return (
        <div
          ref={root}
          class={[
            'i-form-item',
            `i-form-item--label-${labelPosition}`,
            { 'i-form-item--error': !!displayError.value }
          ]}
          style={{
            '--i-form-item-label-width': typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth
          }}>
          {(props.label || slots.label) && (
            <label id={labelId.value} class='i-form-item__label' for={id}>
              {asteriskPosition === 'left' && asterisk}
              {slots.label?.() ?? props.label}
              {asteriskPosition === 'right' && asterisk}
              {form?.labelSuffix?.()}
            </label>
          )}
          <div class='i-form-item__content'>
            {slots.default?.()}
            {statusIcon && (displayError.value || passed.value) && (
              <span
                aria-hidden='true'
                class={['i-form-item__status-icon', displayError.value ? 'is-error' : 'is-success']}>
                {displayError.value ? '✗' : '✓'}
              </span>
            )}
            {displayError.value && props.showMessage && (
              <div class={['i-form-item__error', inlineMessage && 'is-inline-message']} id={errorId} role='alert'>
                {slots.error?.({ error: displayError.value }) ?? displayError.value}
              </div>
            )}
          </div>
        </div>
      );
    };
  }
});
