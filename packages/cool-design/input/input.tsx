import { computed, defineComponent, h, inject, markRaw, nextTick, onMounted, ref, toRaw, watch, type Component, type PropType } from 'vue';
import { formKey, useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import { useComposition } from '../../hooks/index.ts';
export default defineComponent({
  name: 'i-input',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number], default: '' },
    modelModifiers: { type: Object as PropType<{ trim?: boolean; number?: boolean; lazy?: boolean }>, default: () => ({}) },
    clearable: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    placeholder: String,
    size: String as PropType<Size>,
    type: { type: String as PropType<'text' | 'password' | 'textarea' | 'search'>, default: 'text' },
    rows: { type: Number, default: 2 },
    maxlength: [String, Number],
    minlength: [String, Number],
    showWordLimit: Boolean,
    wordLimitPosition: { type: String as PropType<'inside' | 'outside'>, default: 'inside' },
    showPassword: Boolean,
    loading: Boolean,
    loadingIcon: [String, Object] as PropType<string | Component>,
    prefixIcon: [String, Object] as PropType<string | Component>,
    suffixIcon: [String, Object] as PropType<string | Component>,
    clearIcon: [String, Object] as PropType<string | Component>,
    formatter: Function as PropType<(value: string) => string>,
    countGraphemes: Function as PropType<(value: string) => number>,
    inputStyle: [String, Object] as PropType<string | Record<string, string>>,
    parser: Function as PropType<(value: string) => string>,
    autosize: [Boolean, Object] as PropType<boolean | { minRows?: number; maxRows?: number }>,
    resize: String as PropType<'none' | 'both' | 'horizontal' | 'vertical'>,
    validateEvent: { type: Boolean, default: true }
  },
  emits: [
    'update:modelValue',
    'change',
    'blur',
    'focus',
    'input',
    'clear',
    'keydown',
    'mouseenter',
    'mouseleave',
    'compositionstart',
    'compositionupdate',
    'compositionend'
  ],
  setup(props, { attrs, emit, expose, slots }) {
    const field = useField();
    const form = inject(formKey, undefined);
    const disabled = computed(() => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.()));
    const config = useConfig();
    const input = ref<HTMLInputElement | HTMLTextAreaElement>();
    const passwordVisible = ref(false);
    const { isComposing, handleCompositionStart, handleCompositionEnd } = useComposition();
    const textareaHeight = ref<string>();
    const textareaStyle = computed(() => [props.inputStyle, {
      resize: props.resize, height: props.autosize ? textareaHeight.value : undefined
    }]);
    const lastChangedValue = ref(String(props.modelValue));
    const draft = ref<string>();
    watch(() => props.modelValue, (value) => { draft.value = undefined; if (props.modelModifiers.lazy) lastChangedValue.value = String(value); });
    const displayValue = computed(() => {
      if (draft.value !== undefined) return draft.value;
      const value = String(props.modelValue);
      return props.type !== 'textarea' && props.formatter ? props.formatter(value) : value;
    });
    const parseValue = (value: string) => (props.type !== 'textarea' && props.parser ? props.parser(value) : value);
    const graphemeLength = (value: string) => props.countGraphemes?.(value) ?? Array.from(value).length;
    // 数字 0 等合法值不应被当作“空”（清空按钮与 clear() 都依赖该判断）
    const hasValue = () =>
      props.modelValue !== undefined && props.modelValue !== null && String(props.modelValue) !== '';
    const resolvedMaxLength = () => {
      const value = props.maxlength;
      if (value === undefined || value === null || value === '') return undefined;
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : undefined;
    };
    const renderIcon = (icon: string | Component | undefined, fallback?: string) =>
      typeof icon === 'string' ? <i class={['i-input__icon', icon]} aria-hidden='true' /> : icon ? h(markRaw(toRaw(icon))) : fallback;
    const resizeTextarea = () => {
      if (props.type !== 'textarea' || !props.autosize || !input.value || !(input.value instanceof HTMLTextAreaElement))
        return;
      const textarea = input.value;
      textarea.style.height = 'auto';
      const minRows = typeof props.autosize === 'object' ? props.autosize.minRows : undefined;
      const maxRows = typeof props.autosize === 'object' ? props.autosize.maxRows : undefined;
      const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight) || 20;
      const minHeight = minRows ? minRows * lineHeight : 0;
      const maxHeight = maxRows ? maxRows * lineHeight : Number.POSITIVE_INFINITY;
      textareaHeight.value = `${Math.min(maxHeight, Math.max(minHeight, textarea.scrollHeight))}px`;
      textarea.style.height = textareaHeight.value;
    };
    onMounted(async () => {
      await nextTick();
      resizeTextarea();
    });
    watch(
      () => [props.modelValue, props.autosize, props.rows, props.type],
      async () => {
        await nextTick();
        resizeTextarea();
      }
    );
    const clear = () => {
      if (disabled.value || props.readonly || !hasValue()) return;
      draft.value = undefined;
      lastChangedValue.value = '';
      commit('');
      emit('input', '');
      emit('change', '');
      emit('clear');
      input.value?.focus();
    };
    expose({
      focus: () => input.value?.focus(),
      blur: () => input.value?.blur(),
      select: () => input.value?.select(),
      resize: resizeTextarea,
      resizeTextarea, textareaStyle, isComposing, passwordVisible,
      autosize: computed(() => props.autosize),
      input: computed(() => props.type === 'textarea' ? undefined : input.value as HTMLInputElement | undefined),
      textarea: computed(() => props.type === 'textarea' ? input.value as HTMLTextAreaElement | undefined : undefined),
      ref: input,
      clear
    });
    const resolveValue = (value: string) => {
      const parsed = parseValue(value);
      const normalized = props.modelModifiers.trim ? parsed.trim() : parsed;
      const number = props.modelModifiers.number ? Number.parseFloat(normalized) : NaN;
      return Number.isNaN(number) ? normalized : number;
    };
    const commit = (value: string | number) => {
      emit('update:modelValue', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };
    const update = (raw: string) => {
      const value = resolveValue(raw);
      if (!props.modelModifiers.lazy) commit(value);
      else draft.value = raw;
      emit('input', value);
    };
    const handleChange = (event: Event) => {
      if (disabled.value || props.readonly || isComposing.value || (event as KeyboardEvent).isComposing) return;
      if (props.modelModifiers.lazy && event.type !== 'change') return;
      const value = resolveValue((event.target as HTMLInputElement).value);
      if (props.modelModifiers.lazy) draft.value = undefined;
      if (String(value) !== lastChangedValue.value) {
        lastChangedValue.value = String(value);
        if (props.modelModifiers.lazy) commit(value);
        emit('change', value, event);
      }
    };
    return () => {
      const { class: outerClass, style: outerStyle, ...controlAttrs } = attrs;
      const isTextarea = props.type === 'textarea';
      const inputType =
        props.type === 'password' && !passwordVisible.value ? 'password' : props.type === 'search' ? 'search' : 'text';
      const control = isTextarea ? (
        <textarea
          {...controlAttrs}
          id={(attrs.id as string) || field?.id}
          ref={input}
          value={displayValue.value}
          style={textareaStyle.value}
          rows={props.rows}
          maxlength={props.maxlength}
          minlength={props.minlength}
          disabled={disabled.value}
          readonly={props.readonly}
          placeholder={props.placeholder}
          aria-invalid={field?.invalid() || undefined}
          aria-describedby={field?.invalid() ? field.errorId : undefined}
          onCompositionstart={(e: CompositionEvent) => {
            handleCompositionStart();
            emit('compositionstart', e);
          }}
          onCompositionupdate={(e: CompositionEvent) => emit('compositionupdate', e)}
          onCompositionend={(e: CompositionEvent) => {
            handleCompositionEnd();
            emit('compositionend', e);
            if (!disabled.value && !props.readonly) {
              update((e.target as HTMLTextAreaElement).value);
              nextTick(resizeTextarea);
            }
          }}
          onFocus={(e: FocusEvent) => emit('focus', e)}
          onInput={(e: Event) => {
            if (!isComposing.value && !disabled.value && !props.readonly) {
              update((e.target as HTMLTextAreaElement).value);
              nextTick(() => resizeTextarea());
            }
          }}
          onChange={(e: Event) => {
            if (!disabled.value && !props.readonly) handleChange(e);
          }}
          onBlur={(e: FocusEvent) => {
            if (props.validateEvent) field?.validate('blur');
            emit('blur', e);
          }}
        />
      ) : (
        <input
          {...controlAttrs}
          id={(attrs.id as string) || field?.id}
          ref={input}
          type={inputType}
          value={displayValue.value}
          style={props.inputStyle}
          maxlength={props.maxlength}
          minlength={props.minlength}
          disabled={disabled.value}
          readonly={props.readonly}
          placeholder={props.placeholder}
          aria-invalid={field?.invalid() || undefined}
          aria-describedby={field?.invalid() ? field.errorId : undefined}
          onCompositionstart={(e: CompositionEvent) => {
            handleCompositionStart();
            emit('compositionstart', e);
          }}
          onCompositionupdate={(e: CompositionEvent) => emit('compositionupdate', e)}
          onCompositionend={(e: CompositionEvent) => {
            handleCompositionEnd();
            emit('compositionend', e);
            if (!disabled.value && !props.readonly) update((e.target as HTMLInputElement).value);
          }}
          onInput={(e: Event) => {
            if (!isComposing.value && !disabled.value && !props.readonly) update((e.target as HTMLInputElement).value);
          }}
          onChange={(e: Event) => {
            if (!disabled.value && !props.readonly) handleChange(e);
          }}
          onFocus={(e: FocusEvent) => emit('focus', e)}
          onKeydown={(e: KeyboardEvent) => {
            emit('keydown', e);
            if (e.key === 'Enter') handleChange(e);
          }}
          onMouseenter={(e: MouseEvent) => emit('mouseenter', e)}
          onMouseleave={(e: MouseEvent) => emit('mouseleave', e)}
          onBlur={(e: FocusEvent) => {
            if (props.validateEvent) field?.validate('blur');
            emit('blur', e);
          }}
        />
      );
      const maxLength = resolvedMaxLength();
      const count = `${graphemeLength(String(props.modelValue))}/${maxLength}`;
      const passwordToggle = props.showPassword && props.type === 'password' && (
        <button
          type='button'
          aria-label={passwordVisible.value ? '隐藏密码' : '显示密码'}
          disabled={disabled.value}
          onClick={() => {
            if (!disabled.value) passwordVisible.value = !passwordVisible.value;
          }}>
          {slots['password-icon']?.({ visible: passwordVisible.value }) ?? (passwordVisible.value ? '隐藏' : '显示')}
        </button>
      );
      // 设置了 maxlength 才显示字数统计
      const countNode = props.showWordLimit && maxLength !== undefined && <span class='i-input__count'>{count}</span>;
      const loadingNode = props.loading && (
        <span class='i-input__loading' aria-hidden='true'>
          {props.loadingIcon ? renderIcon(props.loadingIcon) : <span class='i-input__loading-spinner' />}
        </span>
      );
      const wrapper = (
        <span class={['i-input', `i-control--${props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size}`, isTextarea && 'is-textarea']}>
          {slots.prefix?.() ?? renderIcon(props.prefixIcon)}
          {control}
          {props.wordLimitPosition === 'inside' && countNode}
          {loadingNode}
          {passwordToggle}
          {slots.suffix?.() ?? renderIcon(props.suffixIcon)}
          {props.clearable && !isTextarea && hasValue() && (
            <button
              type='button'
              aria-label='清空'
              disabled={disabled.value || props.readonly}
              onClick={clear}>
              {renderIcon(props.clearIcon, '×')}
            </button>
          )}
        </span>
      );
      return props.wordLimitPosition === 'outside' && countNode ? (
        <span class={['i-input__outside', outerClass]} style={outerStyle as string}>
          {slots.prepend?.() && <span class='i-input__prepend'>{slots.prepend()}</span>}
          {wrapper}
          {slots.append?.() && <span class='i-input__append'>{slots.append()}</span>}
          {countNode}
        </span>
      ) : (
        <span class={['i-input__outside', outerClass]} style={outerStyle as string}>
          {slots.prepend?.() && <span class='i-input__prepend'>{slots.prepend()}</span>}
          {wrapper}
          {slots.append?.() && <span class='i-input__append'>{slots.append()}</span>}
        </span>
      );
    };
  }
});
