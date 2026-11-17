import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  type PropType
} from 'vue';
import { useFloating, type Placement } from '../../../src/utils/use-floating';
import { useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';

export interface MentionOption {
  value?: string;
  label?: string;
  disabled?: boolean;
  [key: string]: unknown;
}
export interface MentionOptionProps {
  value?: string;
  label?: string;
  disabled?: string;
}
export type MentionFilterOption = boolean | ((pattern: string, option: MentionOption) => boolean);

export default defineComponent({
  name: 'i-mention',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array as PropType<MentionOption[]>, default: () => [] },
    props: Object as PropType<MentionOptionProps>,
    prefix: { type: [String, Array] as PropType<string | string[]>, default: '@' },
    split: { type: String, default: ' ' },
    filterOption: { type: [Boolean, Function] as PropType<MentionFilterOption>, default: true },
    placement: { type: String as PropType<Placement>, default: 'bottom' },
    showArrow: Boolean,
    offset: { type: Number, default: 0 },
    whole: Boolean,
    checkIsWhole: Function as PropType<(pattern: string, prefix: string) => boolean>,
    loading: Boolean,
    popperClass: [String, Array, Object],
    popperStyle: [String, Object],
    type: { type: String as PropType<'text' | 'textarea'>, default: 'text' },
    rows: { type: Number, default: 3 },
    placeholder: String,
    disabled: Boolean,
    clearable: Boolean,
    size: String as PropType<Size>,
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'input', 'search', 'select', 'whole-remove', 'focus', 'blur', 'clear'],
  setup(props, { emit, slots, expose }) {
    const field = useField();
    const config = useConfig();
    const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>();
    const floating = ref<HTMLElement>();
    const open = ref(false);
    const pattern = ref('');
    const activePrefix = ref('@');
    const highlighted = ref(-1);
    const isDisabled = () => props.disabled || !!field?.disabled?.();

    const labelKey = computed(() => props.props?.label || 'label');
    const valueKey = computed(() => props.props?.value || 'value');
    const disabledKey = computed(() => props.props?.disabled || 'disabled');
    const prefixes = computed(() => (Array.isArray(props.prefix) ? props.prefix : [props.prefix]));

    const filtered = computed<MentionOption[]>(() => {
      const list = props.options;
      if (props.filterOption === false) return list;
      const filter = typeof props.filterOption === 'function' ? props.filterOption : null;
      return list.filter((option) => {
        const label = String(option[labelKey.value] ?? option[valueKey.value] ?? '');
        return filter ? filter(pattern.value, option) : label.toLowerCase().includes(pattern.value.toLowerCase());
      });
    });

    const position = useFloating({
      open,
      reference: inputRef,
      floating,
      placement: () => props.placement,
      close: () => setOpen(false),
      closeOnOutside: () => true,
      options: () => ({ offset: props.offset })
    });

    const setOpen = (value: boolean) => {
      if (open.value === value) return;
      open.value = value;
      if (value) highlighted.value = -1;
    };

    const detectToken = (value: string, caret: number) => {
      const before = value.slice(0, caret);
      for (const prefix of prefixes.value) {
        const matched = before.match(new RegExp(`(?:^|\\s)(${escapeRegExp(prefix)})([^\\s${prefixsToString()}]*)$`));
        if (matched) return { prefix, pattern: matched[2] };
      }
      return null;
    };
    const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixsToString = () => prefixes.value.map(escapeRegExp).join('');

    const syncToken = () => {
      const element = inputRef.value;
      if (!element) return null;
      const caret = element.selectionStart ?? element.value.length;
      return detectToken(element.value, caret);
    };

    const handleInput = (event: Event) => {
      const element = event.target as HTMLInputElement | HTMLTextAreaElement;
      const value = element.value;
      emit('input', value);
      emit('update:modelValue', value);
      const token = detectToken(value, element.selectionStart ?? value.length);
      if (token) {
        pattern.value = token.pattern;
        activePrefix.value = token.prefix;
        setOpen(true);
        emit('search', token.pattern, token.prefix);
      } else {
        setOpen(false);
      }
    };

    const commitValue = (value: string) => {
      emit('update:modelValue', value);
      emit('change', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };

    const selectOption = (option: MentionOption) => {
      if (option[disabledKey.value]) return;
      const element = inputRef.value;
      const value = String(option[valueKey.value] ?? '');
      if (element) {
        const token = syncToken();
        const caret = element.selectionStart ?? element.value.length;
        const text = element.value;
        if (token) {
          const beforeToken = text.slice(0, caret - token.pattern.length - token.prefix.length);
          const after = text.slice(caret);
          const next = `${beforeToken}${token.prefix}${value}${props.split}${after}`;
          commitValue(next);
          nextTick(() => {
            const caretPos = beforeToken.length + token.prefix.length + value.length + props.split.length;
            element.setSelectionRange(caretPos, caretPos);
          });
        } else {
          commitValue(text);
        }
      }
      emit('select', option);
      setOpen(false);
    };
    const onChange = (event: Event) => {
      emit('change', (event.target as HTMLInputElement | HTMLTextAreaElement).value);
    };

    const onKeydown = (event: KeyboardEvent) => {
      const element = inputRef.value;
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (open.value && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        const list = filtered.value;
        if (!list.length) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        highlighted.value = (highlighted.value + step + list.length) % list.length;
        return;
      }
      if (open.value && (event.key === 'Enter' || event.key === 'Tab')) {
        const option = filtered.value[highlighted.value];
        if (option) {
          event.preventDefault();
          selectOption(option);
        }
        return;
      }
      if (event.key === 'Backspace' && (props.whole || props.checkIsWhole) && element) {
        const caret = element.selectionStart ?? element.value.length;
        const token = detectToken(element.value, caret);
        if (token) {
          const isWhole = props.checkIsWhole ? props.checkIsWhole(token.pattern, token.prefix) : true;
          if (isWhole) {
            event.preventDefault();
            const text = element.value;
            const next = text.slice(0, caret - token.pattern.length - token.prefix.length) + text.slice(caret);
            commitValue(next);
            emit('whole-remove', token.pattern);
            nextTick(() => {
              const position = caret - token.pattern.length - token.prefix.length;
              element.setSelectionRange(position, position);
            });
          }
        }
      }
    };

    const clear = () => {
      if (isDisabled()) return;
      commitValue('');
      emit('clear');
    };

    expose({
      input: inputRef,
      dropdownVisible: computed(() => open.value)
    });

    return () => {
      const list = filtered.value;
      const shared: Record<string, unknown> = {
        ref: inputRef,
        class: 'i-mention__input',
        type: props.type === 'textarea' ? undefined : 'text',
        value: props.modelValue,
        placeholder: props.placeholder,
        disabled: isDisabled(),
        rows: props.type === 'textarea' ? props.rows : undefined,
        onInput: handleInput,
        onChange,
        onKeydown,
        onFocus: (event: FocusEvent) => {
          emit('focus', event);
        },
        onBlur: (event: FocusEvent) => {
          emit('blur', event);
          if (props.validateEvent) nextTick(() => field?.validate('blur'));
        }
      };
      return (
        <div
          class={[
            'i-mention',
            `i-control--${props.size ?? field?.size?.() ?? config.value.size}`,
            { 'is-disabled': isDisabled() }
          ]}>
          {h(props.type === 'textarea' ? 'textarea' : 'input', shared)}
          {props.clearable && props.modelValue && !isDisabled() && (
            <button type='button' class='i-mention__clear' aria-label='清空' onClick={clear}>
              ×
            </button>
          )}
          {open.value && (
            <div
              ref={floating}
              class={['i-mention__dropdown', props.popperClass]}
              style={[position.style.value, props.popperStyle]}
              role='listbox'>
              {slots.header?.()}
              {props.loading && (
                <div class='i-mention__loading'>{slots.loading?.() ?? '加载中…'}</div>
              )}
              {!props.loading && !list.length && <div class='i-mention__empty'>暂无数据</div>}
              {!props.loading &&
                list.map((option, index) => (
                  <div
                    key={String(option[valueKey.value])}
                    role='option'
                    aria-selected={index === highlighted.value}
                    aria-disabled={Boolean(option[disabledKey.value]) || undefined}
                    class={[
                      'i-mention__option',
                      {
                        'is-highlighted': index === highlighted.value,
                        'is-disabled': Boolean(option[disabledKey.value])
                      }
                    ]}
                    onMousedown={(event: MouseEvent) => {
                      event.preventDefault();
                      selectOption(option);
                    }}>
                    {slots.label?.({ item: option }) ?? String(option[labelKey.value] ?? option[valueKey.value] ?? '')}
                  </div>
                ))}
              {slots.footer?.()}
            </div>
          )}
        </div>
      );
    };
  }
});
