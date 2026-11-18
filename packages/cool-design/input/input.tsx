import { computed, defineComponent, h, markRaw, nextTick, onMounted, ref, toRaw, watch, type Component, type PropType } from 'vue';
import { useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import { useComposition } from '../../hooks/index.ts';
export default defineComponent({
  name: 'i-input',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number], default: '' },
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
    const config = useConfig();
    const input = ref<HTMLInputElement | HTMLTextAreaElement>();
    const passwordVisible = ref(false);
    const { isComposing, handleCompositionStart, handleCompositionEnd } = useComposition();
    const currentValue = ref(String(props.modelValue));
    const lastChangedValue = ref(String(props.modelValue));
    const displayValue = computed(() => {
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
      textarea.style.height = `${Math.min(maxHeight, Math.max(minHeight, textarea.scrollHeight))}px`;
    };
    onMounted(async () => {
      await nextTick();
      resizeTextarea();
    });
    watch(
      () => [props.modelValue, props.autosize, props.rows],
      async () => {
        await nextTick();
        resizeTextarea();
      }
    );
    const clear = () => {
      if (props.disabled || props.readonly || !hasValue()) return;
      update('');
      emit('change', '');
      emit('clear');
      input.value?.focus();
    };
    expose({
      focus: () => input.value?.focus(),
      blur: () => input.value?.blur(),
      select: () => input.value?.select(),
      resize: resizeTextarea,
      clear
    });
    const update = (value: string) => {
      currentValue.value = value;
      emit('update:modelValue', value);
      emit('input', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };
    const handleChange = (value: string) => {
      if (value !== lastChangedValue.value) {
        lastChangedValue.value = value;
        emit('change', value);
      }
    };
    return () => {
      const isTextarea = props.type === 'textarea';
      const inputType =
        props.type === 'password' && !passwordVisible.value ? 'password' : props.type === 'search' ? 'search' : 'text';
      const control = isTextarea ? (
        <textarea
          {...attrs}
          id={(attrs.id as string) || field?.id}
          ref={input}
          value={displayValue.value}
          style={{ ...(typeof props.inputStyle === 'object' ? props.inputStyle : {}), ...(props.resize ? { resize: props.resize } : {}) }}
          rows={props.rows}
          maxlength={props.maxlength}
          minlength={props.minlength}
          disabled={props.disabled || field?.disabled?.()}
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
            if (!props.disabled && !props.readonly) update(parseValue((e.target as HTMLTextAreaElement).value));
          }}
          onFocus={(e: FocusEvent) => emit('focus', e)}
          onInput={(e: Event) => {
            if (!isComposing.value && !props.disabled && !props.readonly) {
              update(parseValue((e.target as HTMLTextAreaElement).value));
              nextTick(() => resizeTextarea());
            }
          }}
          onChange={(e: Event) => {
            if (!props.disabled && !props.readonly) handleChange((e.target as HTMLInputElement).value);
          }}
          onBlur={(e: FocusEvent) => {
            if (props.validateEvent) field?.validate('blur');
            emit('blur', e);
          }}
        />
      ) : (
        <input
          {...attrs}
          id={(attrs.id as string) || field?.id}
          ref={input}
          type={inputType}
          value={displayValue.value}
          style={props.inputStyle}
          maxlength={props.maxlength}
          minlength={props.minlength}
          disabled={props.disabled || field?.disabled?.()}
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
            if (!props.disabled && !props.readonly) update(parseValue((e.target as HTMLInputElement).value));
          }}
          onInput={(e: Event) => {
            if (!isComposing.value && !props.disabled && !props.readonly) update(parseValue((e.target as HTMLInputElement).value));
          }}
          onChange={(e: Event) => {
            if (!props.disabled && !props.readonly) handleChange((e.target as HTMLInputElement).value);
          }}
          onFocus={(e: FocusEvent) => emit('focus', e)}
          onKeydown={(e: KeyboardEvent) => {
            emit('keydown', e);
            if (e.key === 'Enter') handleChange((e.target as HTMLInputElement).value);
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
          onClick={() => (passwordVisible.value = !passwordVisible.value)}>
          {slots['password-icon']?.({ visible: passwordVisible.value }) ?? (passwordVisible.value ? '隐藏' : '显示')}
        </button>
      );
      // 设置了 maxlength 才显示字数统计
      const countNode = props.showWordLimit && maxLength !== undefined && <span class='i-input__count'>{count}</span>;
      const wrapper = (
        <span class={['i-input', `i-control--${props.size || config.value.size}`, isTextarea && 'is-textarea']}>
          {slots.prefix?.() ?? renderIcon(props.prefixIcon)}
          {control}
          {props.wordLimitPosition === 'inside' && countNode}
          {passwordToggle}
          {slots.suffix?.() ?? renderIcon(props.suffixIcon)}
          {props.clearable && !isTextarea && hasValue() && (
            <button
              type='button'
              aria-label='清空'
              disabled={props.disabled || props.readonly}
              onClick={clear}>
              {renderIcon(props.clearIcon, '×')}
            </button>
          )}
        </span>
      );
      return props.wordLimitPosition === 'outside' && countNode ? (
        <span class='i-input__outside'>
          {slots.prepend?.() && <span class='i-input__prepend'>{slots.prepend()}</span>}
          {wrapper}
          {slots.append?.() && <span class='i-input__append'>{slots.append()}</span>}
          {countNode}
        </span>
      ) : (
        <span class='i-input__outside'>
          {slots.prepend?.() && <span class='i-input__prepend'>{slots.prepend()}</span>}
          {wrapper}
          {slots.append?.() && <span class='i-input__append'>{slots.append()}</span>}
        </span>
      );
    };
  }
});
