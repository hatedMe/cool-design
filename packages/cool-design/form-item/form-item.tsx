import { useId } from '../../hooks/use-id';
import { createSlotIds, reserveSlotIds, avoidIdCollision } from '../../../src/utils/slot-ids';
import { useNamespace } from '../../hooks/use-namespace';
import {
  computed,
  defineComponent,
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  shallowReactive,
  shallowRef,
  watch,
  type PropType
} from 'vue';
import Schema, { type RuleItem, type ValidateError, type ValidateResult } from 'async-validator';
import { formKey, fieldKey, getFieldPathIdentity, getFieldPathParts, getFieldValue, normalizeFieldPath, cloneFormValue, setFieldValue, type Field } from '../form/context';
import type { FormItemProp, FormRule, FormValidateState } from '../form/types';

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
    for: String,
    prop: [String, Array] as PropType<FormItemProp>,
    label: String,
    required: Boolean,
    labelPosition: String as PropType<'left' | 'right' | 'top'>,
    labelWidth: [String, Number],
    showMessage: { type: Boolean, default: true },
    rules: [Object, Array] as PropType<FormRule | FormRule[]>,
    error: String,
    validateStatus: String as PropType<FormValidateState>,
    inlineMessage: Boolean,
    size: String as PropType<'small' | 'default' | 'large'>
  },
  setup(props, { attrs, slots, expose }) {
    const ns = useNamespace('form-item');
    const form = inject(formKey);
    const id = useId();
    const controls = shallowReactive(new Map<symbol, string | undefined>());
    const reserved = shallowRef(createSlotIds());
    const labelId = () => props.label || slots.label ? avoidIdCollision(`${id.value}-label`, reserved.value) : undefined;
    const errorId = () => avoidIdCollision(`${id.value}-error`, reserved.value);
    const error = ref('');
    const validateState = ref<FormValidateState>(props.validateStatus ?? '');
    let internalValidationPending = false;
    watch(() => props.validateStatus, (status) => {
      internalValidationPending = false;
      validateState.value = status ?? '';
    });
    watch(() => props.error, (message) => {
      internalValidationPending = false;
      validateState.value = message ? 'error' : '';
    }, { immediate: !!props.error });
    const root = ref<HTMLElement>();
    let revision = 0;
    const displayError = computed(() => props.error ?? error.value);
    const pathParts = computed(() => getFieldPathParts(props.prop));
    const propKey = computed(() => pathParts.value.join('.'));
    const getValue = () => propKey.value ? getFieldValue(form?.model(), pathParts.value) : undefined;
    watch(
      getValue,
      () => {
        revision++;
        if (internalValidationPending) {
          internalValidationPending = false;
          validateState.value = displayError.value ? 'error' : props.validateStatus ?? '';
        }
      },
      { flush: 'sync', deep: true }
    );
    let initial: unknown;
    const clear = () => {
      revision++;
      internalValidationPending = false;
      error.value = '';
      validateState.value = '';
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
    const check: Field['check'] = async (trigger) => {
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
      internalValidationPending = rules.length > 0;
      if (internalValidationPending) validateState.value = 'validating';
      try {
        const schemaKey = key in Object.prototype ? 'value' : key;
        await new Schema({ [schemaKey]: rules.map(normalizeRule) }).validate(
          { [schemaKey]: value },
          { suppressWarning: true, firstFields: true }
        );
        if (current !== revision) return false;
        internalValidationPending = false;
        error.value = '';
        validateState.value = rules.length ? 'success' : '';
        form?.emitValidate?.(prop, true);
        return true;
      } catch (reason) {
        if (current !== revision) return false;
        internalValidationPending = false;
        const errors = (reason as { errors?: ValidateError[] })?.errors;
        error.value = errors?.[0]?.message || (reason instanceof Error ? reason.message : '校验失败');
        validateState.value = 'error';
        form?.emitValidate?.(prop, false, error.value);
        return errors?.length
          ? errors.map((entry) => ({ message: entry.message, field: key, fieldValue: entry.fieldValue }))
          : [{ message: error.value, field: key, fieldValue: value }];
      }
    };
    const validate: Field['validate'] = async (trigger) => (await check(trigger)) === true;
    provide(fieldKey, {
      setControl: (key, nativeId) => controls.set(key, nativeId),
      removeControl: (key) => controls.delete(key),
      availableId: candidate => avoidIdCollision(candidate, reserved.value),
      getLabelId: labelId,
      getErrorId: () => props.showMessage && displayError.value ? errorId() : undefined,
      invalid: () => !!displayError.value || validateState.value === 'error',
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
      root.value.scrollIntoView?.(form?.scrollIntoViewOptions() ?? { block: 'center' });
    };
    const field: Field = {
      get prop() { return propKey.value; },
      get validateState() { return validateState.value; },
      get validateMessage() { return displayError.value; },
      validate,
      check,
      clearValidate: clear,
      getInitialValue: () => initial,
      setInitialValue: (value) => { initial = cloneFormValue(value); },
      resetField: () => {
        if (form && propKey.value) setFieldValue(form.model(), pathParts.value, cloneFormValue(initial));
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
      () => getFieldPathIdentity(pathParts.value),
      (_identity, previousIdentity) => {
        if (previousIdentity) clear();
        if (propKey.value) {
          field.setInitialValue(getValue());
          form?.register(pathParts.value, field);
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
      get validateState() { return field.validateState; },
      get validateMessage() { return field.validateMessage; },
      validate,
      resetField: field.resetField,
      clearValidate: clear,
      setInitialValue: field.setInitialValue
    });
    return () => {
      const content = slots.default?.();
      const label = slots.label?.();
      const message = displayError.value && props.showMessage ? slots.error?.({ error: displayError.value }) : undefined;
      const ids = createSlotIds(attrs.id);
      reserveSlotIds(ids, content);
      reserveSlotIds(ids, label);
      reserveSlotIds(ids, message);
      for (const value of ids.explicit) {
        if (Array.isArray(value)) {
          ids.explicit.delete(value);
          for (const part of value) ids.explicit.add(part);
        }
      }
      const previous = reserved.value;
      if (ids.explicit.size !== previous.explicit.size || [...ids.explicit].some(value => !previous.explicit.has(value))
        || ids.encoded.size !== previous.encoded.size || [...ids.encoded].some(([key, value]) => previous.encoded.get(key) !== value)) {
        reserved.value = ids;
      }
      const labelFor = props.for ?? (controls.size === 1 ? controls.values().next().value : undefined);
      const group = !labelFor && !!labelId();
      const labelPosition = props.labelPosition ?? form?.labelPosition?.() ?? 'right';
      const labelWidth = props.labelWidth ?? form?.labelWidth?.();
      const hideAsterisk = !!form?.hideRequiredAsterisk?.();
      const asteriskPosition = form?.requireAsteriskPosition?.() ?? 'left';
      const asterisk = props.required && !hideAsterisk && (
        <span aria-hidden='true' class={ns.e('required')}>
          *
        </span>
      );
      const inlineMessage = props.inlineMessage || !!form?.inlineMessage?.();
      const statusIcon = !!form?.statusIcon?.();
      return (
        <div
          ref={root}
          role={group ? 'group' : undefined}
          aria-labelledby={group && !attrs['aria-label'] ? labelId() : undefined}
          class={[
            ns.b(),
            ns.m(`label-${labelPosition}`),
            { [ns.m('error')]: !!displayError.value || validateState.value === 'error' },
            validateState.value && `is-${validateState.value}`
          ]}
          style={{
            [ns.cssVarName('form-item-label-width')]: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth
          }}>
          {(props.label || slots.label) && (
            <label id={labelId()} class={ns.e('label')} for={labelFor}>
              {asteriskPosition === 'left' && asterisk}
              {label ?? props.label}
              {asteriskPosition === 'right' && asterisk}
              {form?.labelSuffix?.()}
            </label>
          )}
          <div class={ns.e('content')}>
            {content}
            {statusIcon && (displayError.value || validateState.value === 'error' || validateState.value === 'success') && (
              <span
                aria-hidden='true'
                class={[ns.e('status-icon'), displayError.value || validateState.value === 'error' ? 'is-error' : 'is-success']}>
                {displayError.value || validateState.value === 'error' ? '✗' : '✓'}
              </span>
            )}
            {displayError.value && props.showMessage && (
              <div class={[ns.e('error'), inlineMessage && 'is-inline-message']} id={errorId()} role='alert'>
                {message ?? displayError.value}
              </div>
            )}
          </div>
        </div>
      );
    };
  }
});
