import { useNamespace } from '../../hooks/use-namespace';
import { computed, defineComponent, inject, nextTick, ref, watch, type PropType, type VNode } from 'vue';
import { formKey, useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';

export type InputOtpType = 'outlined' | 'filled' | 'underlined';
export type InputOtpSeparator = string | VNode | ((index: number) => string | VNode);

export default defineComponent({
  name: 'i-input-otp',
  props: {
    modelValue: [String, Number] as PropType<string | number>,
    length: { type: Number, default: 6 },
    validator: { type: Function as PropType<(value: string) => boolean>, default: () => true },
    inputmode: String as PropType<'text' | 'search' | 'none' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal'>,
    type: { type: String as PropType<InputOtpType>, default: 'outlined' },
    size: String as PropType<Size>,
    mask: Boolean,
    disabled: Boolean,
    separator: [String, Object, Function] as PropType<InputOtpSeparator>,
    validateEvent: { type: Boolean, default: true },
    readonly: Boolean,
    id: String,
    ariaLabel: String
  },
  emits: ['update:modelValue', 'change', 'finish', 'focus', 'blur'],
  setup(props, { emit, slots, expose }) {
    const ns = useNamespace('input-otp');
    const controlNs = useNamespace('control');
    const field = useField();
    const form = inject(formKey, undefined);
    const config = useConfig();
    const inputs = ref<HTMLInputElement[]>([]);
    const innerValue = ref(Array.from(String(props.modelValue ?? '')).slice(0, props.length).join(''));
    let changedSinceFocus = false;
    const root = ref<HTMLElement>();
    let composing = false;
    let compositionCommitted = false;

    watch(
      () => props.modelValue,
      (value) => {
        innerValue.value = Array.from(String(value ?? '')).slice(0, props.length).join('');
      }
    );

    const chars = computed(() => {
      const codePoints = Array.from(innerValue.value);
      return Array.from({ length: props.length }, (_, index) => codePoints[index] ?? '');
    });
    const isDisabled = () => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.());

    const commit = (value: string, nextIndex?: number) => {
      if (isDisabled() || props.readonly) return;
      if (nextIndex !== undefined) nextTick(() => inputs.value[nextIndex]?.focus());
      if (value === innerValue.value) return;
      innerValue.value = value;
      changedSinceFocus = true;
      emit('update:modelValue', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
      if (Array.from(value).length === props.length && !value.includes(' ')) emit('finish', value);
    };

    const setChar = (index: number, char: string) => {
      const list = chars.value.slice();
      list[index] = char;
      return list
        .map((item) => item || ' ')
        .join('')
        .replace(/\s+$/, '');
    };

    const displayChar = (char: string) => (char === ' ' ? '' : char);

    const onInput = (index: number, event: Event) => {
      const element = event.target as HTMLInputElement;
      if (composing || (event as InputEvent).isComposing) return;
      if (event.type === 'input' && compositionCommitted) {
        compositionCommitted = false;
        element.value = displayChar(chars.value[index] ?? '');
        return;
      }
      if (isDisabled() || props.readonly) {
        element.value = displayChar(chars.value[index] ?? '');
        return;
      }
      const data = (event as InputEvent | CompositionEvent).data ?? element.value;
      element.value = displayChar(chars.value[index] ?? '');
      if (data) insertText(index, data);
    };

    const onKeydown = (index: number, event: KeyboardEvent) => {
      if (isDisabled() || props.readonly || composing || event.isComposing) return;
      if (event.key === 'Backspace') {
        event.preventDefault();
        if (displayChar(chars.value[index])) {
          commit(setChar(index, ''));
        } else if (index > 0) {
          commit(setChar(index - 1, ''), index - 1);
        }
      } else if (event.key === 'Delete') {
        event.preventDefault();
        commit(setChar(index, ''));
      } else if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        inputs.value[index - 1]?.focus();
      } else if (event.key === 'ArrowRight' && index < props.length - 1) {
        event.preventDefault();
        inputs.value[index + 1]?.focus();
      }
    };

    const insertText = (index: number, text: string) => {
      const accepted = Array.from(text)
        .filter((char) => props.validator(char))
        .slice(0, props.length - index);
      if (!accepted.length) return;
      const list = chars.value.slice();
      accepted.forEach((char, offset) => {
        list[index + offset] = char;
      });
      commit(
        list
          .map((item) => item || ' ')
          .join('')
          .replace(/\s+$/, ''),
        Math.min(index + accepted.length, props.length - 1)
      );
    };

    const onPaste = (index: number, event: ClipboardEvent) => {
      event.preventDefault();
      if (!isDisabled() && !props.readonly) insertText(index, event.clipboardData?.getData('text') ?? '');
    };

    const onFocus = (event: FocusEvent) => {
      if (!root.value?.contains(event.relatedTarget as Node)) emit('focus', event);
    };
    const onBlur = (event: FocusEvent) => {
      if (root.value?.contains(event.relatedTarget as Node)) return;
      emit('blur', event);
      if (changedSinceFocus) {
        changedSinceFocus = false;
        emit('change', innerValue.value);
      }
      if (props.validateEvent) nextTick(() => field?.validate('blur'));
    };

    expose({
      inputRefs: computed(() => inputs.value.filter(Boolean)),
      focus: () => {
        const target = inputs.value.find((_element, index) => !displayChar(chars.value[index])) ?? inputs.value[0];
        target?.focus();
      },
      blur: () => inputs.value.forEach((element) => element.blur())
    });

    return () => (
      <div
        ref={root}
        class={[
          ns.b(),
          ns.m(props.type),
          controlNs.m(props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size),
          { 'is-disabled': isDisabled() }
        ]}
        id={props.id ?? field?.id}
        aria-label={props.ariaLabel}
        aria-invalid={field?.invalid() ? 'true' : undefined}
        aria-describedby={field?.invalid() ? field.errorId : undefined}>
        {chars.value.map((char, index) => [
          index > 0 && (
            <span class={ns.e('separator')} key={`separator-${index}`} aria-hidden='true'>
              {slots.separator?.() ??
                (typeof props.separator === 'function'
                  ? props.separator(index - 1)
                  : (props.separator ?? null))}
            </span>
          ),
          <input
            key={index}
            ref={(element) => {
              if (element) inputs.value[index] = element as HTMLInputElement;
              else delete inputs.value[index];
            }}
            class={ns.e('field')}
            type={props.mask ? 'password' : 'text'}
            value={displayChar(char)}

            inputmode={props.inputmode}
            disabled={isDisabled()}
            readonly={props.readonly}
            aria-label={`第 ${index + 1} 位`}
            onCompositionstart={() => { composing = true; }}
            onCompositionend={(event: CompositionEvent) => {
              composing = false;
              onInput(index, event);
              compositionCommitted = true;
              queueMicrotask(() => { compositionCommitted = false; });
            }}
            onInput={(event: Event) => onInput(index, event)}
            onKeydown={(event: KeyboardEvent) => onKeydown(index, event)}
            onPaste={(event: ClipboardEvent) => onPaste(index, event)}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        ])}
      </div>
    );
  }
});
