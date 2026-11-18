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
import Schema, { type Rules } from 'async-validator';
import { formKey, fieldKey, nextFieldId } from '../form/context';
import type { FormRule } from '../form/types';
export default defineComponent({
  name: 'i-form-item',
  props: {
    prop: String,
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
    const pathParts = (path: string) =>
      path
        .replace(/\[(\w+)\]/g, '.$1')
        .split('.')
        .filter(Boolean);
    const getValue = () => {
      if (!props.prop) return undefined;
      return pathParts(props.prop).reduce<unknown>(
        (value, part) => (value as Record<string, unknown> | undefined)?.[part],
        form?.model()
      );
    };
    const setValue = (value: unknown) => {
      if (!props.prop) return;
      const parts = pathParts(props.prop);
      const last = parts.pop();
      if (!last || !form) return;
      let target = form.model() as Record<string, unknown>;
      parts.forEach((part) => {
        if (!target[part] || typeof target[part] !== 'object') target[part] = {};
        target = target[part] as Record<string, unknown>;
      });
      target[last] = value;
    };
    watch(
      getValue,
      () => {
        revision++;
      },
      { flush: 'sync', deep: true }
    );
    const initialValue = getValue();
    const initial =
      initialValue && typeof initialValue === 'object' ? JSON.parse(JSON.stringify(initialValue)) : initialValue;
    const clear = () => {
      revision++;
      error.value = '';
      passed.value = false;
    };
    const rulesOf = (): FormRule[] => {
      if (props.rules) return Array.isArray(props.rules) ? props.rules : [props.rules];
      return props.prop ? form?.rules()[props.prop] || [] : [];
    };
    const validate = async (trigger?: 'blur' | 'change') => {
      if (!props.prop) return true;
      const value = getValue();
      const rules = rulesOf().filter((rule) => !trigger || !rule.trigger || rule.trigger === trigger);
      if (trigger && !rules.length) return !error.value;
      const current = ++revision;
      try {
        const descriptor: Rules = {
          value: rules.map((rule) => ({
            ...rule,
            whitespace: rule.whitespace ?? (rule.required ? true : undefined),
            validator: rule.validator
              ? (_rule: unknown, ruleValue: unknown, callback: (error?: string | Error) => void) =>
                  Promise.resolve(rule.validator?.(ruleValue))
                    .then(() => callback())
                    .catch((reason) => callback(reason instanceof Error ? reason : '校验失败'))
              : undefined
          })) as Rules['value']
        };
        await new Schema(descriptor).validate({ value }, { suppressWarning: true });
        if (current !== revision) return false;
        error.value = '';
        passed.value = rules.length > 0;
        form?.emitValidate?.(props.prop, true);
        return true;
      } catch (reason) {
        if (current !== revision) return false;
        const first = (reason as { errors?: Array<{ message?: string }> })?.errors?.[0];
        error.value = first?.message || (reason instanceof Error ? reason.message : '校验失败');
        passed.value = false;
        form?.emitValidate?.(props.prop, false, error.value);
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
    if (props.prop) {
      const key = props.prop;
      form?.register(key, {
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
      });
      onBeforeUnmount(() => {
        clear();
        form?.unregister(key);
      });
    } else {
      onBeforeUnmount(clear);
    }
    expose({
      validate,
      resetField: () => {
        setValue(initial);
        clear();
      },
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
