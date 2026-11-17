import { computed, defineComponent, nextTick, ref, type PropType, type Component } from 'vue';
import { useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import Icon from '../icon';
export interface AutocompleteSuggestion {
  value: string;
  [key: string]: unknown;
}
export type AutocompleteIcon = string | Component;
export default defineComponent({
  name: 'i-autocomplete',
  props: {
    modelValue: { type: String, default: '' },
    suggestions: { type: Array as PropType<(string | AutocompleteSuggestion)[]>, default: () => [] },
    fetchSuggestions: Function as PropType<(query: string, cb: (items: AutocompleteSuggestion[]) => void) => void>,
    placeholder: String,
    disabled: Boolean,
    clearable: Boolean,
    triggerOnFocus: { type: Boolean, default: true },
    selectWhenUnmatched: Boolean,
    highlightFirstItem: Boolean,
    hideLoading: Boolean,
    size: String as PropType<Size>,
    name: String,
    maxlength: [String, Number],
    minlength: [String, Number],
    prefixIcon: [String, Object] as PropType<AutocompleteIcon>,
    suffixIcon: [String, Object] as PropType<AutocompleteIcon>,
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'input', 'change', 'select', 'clear', 'focus', 'blur'],
  setup(props, { emit, slots, expose }) {
    const field = useField();
    const config = useConfig();
    const input = ref<HTMLInputElement>();
    const focused = ref(false);
    const loading = ref(false);
    const items = ref<AutocompleteSuggestion[]>([]);
    const highlightedIndex = ref(-1);
    const normalize = (item: string | AutocompleteSuggestion) => (typeof item === 'string' ? { value: item } : item);
    const isDisabled = () => props.disabled || !!field?.disabled?.();
    const query = (value: string) => {
      emit('update:modelValue', value);
      emit('input', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
      if (props.fetchSuggestions) {
        loading.value = true;
        props.fetchSuggestions(value, (result) => {
          loading.value = false;
          items.value = result;
          highlightedIndex.value = props.highlightFirstItem && result.length ? 0 : -1;
        });
      } else {
        items.value = props.suggestions
          .map(normalize)
          .filter((item) => !value || item.value.toLowerCase().includes(value.toLowerCase()));
        highlightedIndex.value = props.highlightFirstItem && items.value.length ? 0 : -1;
      }
    };
    const visible = computed(() => focused.value && items.value.length > 0);
    const handleSelect = (item: AutocompleteSuggestion) => {
      emit('update:modelValue', item.value);
      emit('select', item);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
      focused.value = false;
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!items.value.length) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const length = items.value.length;
        highlightedIndex.value = (highlightedIndex.value + step + length) % length;
      } else if (event.key === 'Enter') {
        const item = items.value[highlightedIndex.value];
        if (item) {
          event.preventDefault();
          handleSelect(item);
        } else if (props.selectWhenUnmatched && props.modelValue) {
          emit('select', { value: props.modelValue });
        }
      }
    };
    expose({
      focus: () => input.value?.focus(),
      blur: () => input.value?.blur(),
      select: () => input.value?.select(),
      handleSelect
    });
    return () => (
      <span class={['i-autocomplete', `i-control--${props.size ?? field?.size?.() ?? config.value.size}`]}>
        {slots.prepend?.()}
        <span class='i-autocomplete__control'>
          {slots.prefix?.()}
          {props.prefixIcon && <Icon class='i-autocomplete__icon i-autocomplete__icon--prefix' icon={props.prefixIcon} aria-hidden='true' />}
          <input
            ref={input}
            value={props.modelValue}
            placeholder={props.placeholder}
            disabled={isDisabled()}
            name={props.name}
            maxlength={props.maxlength}
            minlength={props.minlength}
            aria-invalid={field?.invalid() ? 'true' : undefined}
            aria-describedby={field?.invalid() ? field.errorId : undefined}
            onInput={(e: Event) => query((e.target as HTMLInputElement).value)}
            onFocus={(e: FocusEvent) => {
              focused.value = true;
              emit('focus', e);
              if (props.triggerOnFocus) query(props.modelValue);
            }}
            onBlur={(e: FocusEvent) => {
              setTimeout(() => (focused.value = false), 120);
              emit('blur', e);
              if (props.validateEvent) nextTick(() => field?.validate('blur'));
            }}
            onChange={() => emit('change', props.modelValue)}
            onKeydown={onKeydown}
          />
          {props.clearable && props.modelValue && !isDisabled() && (
            <button
              type='button'
              class='i-autocomplete__clear'
              aria-label='清空'
              onClick={() => {
                query('');
                emit('clear');
                input.value?.focus();
              }}>
              ×
            </button>
          )}
          {props.suffixIcon && <Icon class='i-autocomplete__icon i-autocomplete__icon--suffix' icon={props.suffixIcon} aria-hidden='true' />}
          {slots.suffix?.()}
        </span>
        {slots.append?.()}
        {(visible.value || (loading.value && !props.hideLoading && focused.value)) && (
          <ul class='i-autocomplete__list' role='listbox'>
            {loading.value && !props.hideLoading && (
              <li class='i-autocomplete__loading' role='presentation'>
                加载中…
              </li>
            )}
            {items.value.map((item, index) => (
              <li
                key={item.value}
                role='option'
                aria-selected={index === highlightedIndex.value}
                class={['i-autocomplete__item', { 'is-highlighted': index === highlightedIndex.value }]}
                onMousedown={(e: MouseEvent) => {
                  e.preventDefault();
                  handleSelect(item);
                }}>
                {slots.default?.({ item }) ?? item.value}
              </li>
            ))}
          </ul>
        )}
      </span>
    );
  }
});
