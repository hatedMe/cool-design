import { computed, defineComponent, inject, nextTick, onBeforeUnmount, ref, watch, type CSSProperties, type PropType, type Component } from 'vue';
import { formKey, useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import Icon from '../icon';
import { useComposition } from '../../hooks/use-composition';
import Input, { type InputInstance } from '../input';
import Tooltip, { type TooltipInstance } from '../tooltip';
import type { Placement, FloatingOptions } from '../../../src/utils/use-floating';
export interface AutocompleteSuggestion {
  value?: string | number;
  [key: string]: unknown;
}
export type AutocompleteFetchSuggestions = AutocompleteSuggestion[] | ((
  query: string, callback: (items: AutocompleteSuggestion[]) => void
) => AutocompleteSuggestion[] | void | Promise<AutocompleteSuggestion[] | void>);
export type AutocompleteIcon = string | Component;
export default defineComponent({
  name: 'i-autocomplete',
  props: {
    modelValue: { type: [String, Number], default: '' },
    ariaLabel: String,
    valueKey: { type: String, default: 'value' },
    teleported: { type: Boolean, default: true },
    appendTo: [String, Object] as PropType<string | HTMLElement>,
    showArrow: { type: Boolean, default: true },
    placement: { type: String as PropType<Placement>, default: 'bottom-start' },
    popperClass: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    popperStyle: [String, Object, Array] as PropType<string | CSSProperties | CSSProperties[]>,
    popperOptions: Object as PropType<FloatingOptions>,
    fitInputWidth: Boolean,
    loopNavigation: { type: Boolean, default: true },
    suggestions: { type: Array as PropType<(string | AutocompleteSuggestion)[]>, default: () => [] },
    fetchSuggestions: [Array, Function] as PropType<AutocompleteFetchSuggestions>,
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
    prefixIcon: [String, Object, Function] as PropType<AutocompleteIcon>,
    suffixIcon: [String, Object, Function] as PropType<AutocompleteIcon>,
    validateEvent: { type: Boolean, default: true },
    debounce: { type: Number, default: 300 }
  },
  emits: ['update:modelValue', 'input', 'change', 'select', 'clear', 'focus', 'blur'],
  setup(props, { emit, slots, expose }) {
    const field = useField();
    const form = inject(formKey, undefined);
    const config = useConfig();
    const input = ref<InputInstance>();
    const anchor = ref<HTMLElement>();
    const popperRef = ref<TooltipInstance>();
    const panel = ref<HTMLElement>();
    const { isComposing, handleCompositionStart, handleCompositionEnd } = useComposition();
    const focused = ref(false);
    const loading = ref(false);
    const items = ref<AutocompleteSuggestion[]>([]);
    const highlightedIndex = ref(-1);
    const normalize = (item: string | AutocompleteSuggestion) => (typeof item === 'string' ? { value: item } : item);
    const isDisabled = () => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.());
    // 请求序号：只采纳最后一次发起的远程结果，过期响应直接丢弃。
    let requestId = 0;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const applySuggestions = (result: AutocompleteSuggestion[]) => {
      items.value = result;
      highlightedIndex.value = props.highlightFirstItem && result.length ? 0 : -1;
    };
    const loadSuggestions = async (value: string, id: number) => {
      const fetcher = props.fetchSuggestions;
      if (typeof fetcher !== 'function') {
        applySuggestions(fetcher ?? props.suggestions.map(normalize).filter((item) =>
          !value || String(item[props.valueKey] ?? '').toLowerCase().includes(value.toLowerCase())));
        return;
      }
      loading.value = true;
      let settled = false;
      const finish = (result: AutocompleteSuggestion[]) => {
        if (settled || id !== requestId) return;
        settled = true;
        loading.value = false;
        applySuggestions(result);
      };
      try {
        const result = await fetcher(value, finish);
        if (Array.isArray(result)) finish(result);
      } catch {
        finish([]);
      }
    };
    const invalidate = () => {
      requestId++;
      if (debounceTimer !== undefined) clearTimeout(debounceTimer);
      debounceTimer = undefined;
      loading.value = false;
    };
    const fetchSuggestionsFor = (value: string, immediate: boolean) => {
      invalidate();
      const id = requestId;
      if (immediate || typeof props.fetchSuggestions !== 'function' || props.debounce <= 0) return loadSuggestions(value, id);
      else debounceTimer = setTimeout(() => {
        debounceTimer = undefined;
        void loadSuggestions(value, id);
      }, props.debounce);
    };
    const getData = async (value: string) => {
      if (!isDisabled()) await fetchSuggestionsFor(value, true);
    };
    const query = (value: string, immediate = false) => {
      if (isDisabled()) return;
      focused.value = true;
      emit('update:modelValue', value);
      emit('input', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
      if (!value && !props.triggerOnFocus) close();
      else void fetchSuggestionsFor(value, immediate);
    };
    const close = () => {
      invalidate();
      focused.value = false;
      applySuggestions([]);
    };
    onBeforeUnmount(close);
    watch(isDisabled, (disabled) => { if (disabled) close(); });
    const visible = computed(() => !isDisabled() && focused.value && (items.value.length > 0 || loading.value));
    const handleSelect = async (item: AutocompleteSuggestion) => {
      if (isDisabled()) return;
      const value = item[props.valueKey];
      emit('input', value);
      emit('update:modelValue', value);
      emit('select', item);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
      close();
    };
    const highlight = (index: number) => {
      const length = items.value.length;
      if (!visible.value || loading.value || !length) return;
      highlightedIndex.value = props.loopNavigation
        ? (index < 0 ? length - 1 : index >= length ? 0 : index)
        : Math.max(-1, Math.min(length - 1, index));
      nextTick(() => panel.value?.querySelector('.is-highlighted')?.scrollIntoView?.({ block: 'nearest' }));
    };
    const handleKeyEnter = async () => {
      if (isDisabled() || isComposing.value) return;
      const item = items.value[highlightedIndex.value];
      if (item && visible.value && !loading.value) await handleSelect(item);
      else if (props.selectWhenUnmatched && props.modelValue) emit('select', { value: props.modelValue });
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (isDisabled() || isComposing.value || event.isComposing) return;
      if (event.key === 'Escape' || event.key === 'Tab') { close(); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!items.value.length) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        highlight(highlightedIndex.value + step);
      } else if (event.key === 'Enter') {
        if (visible.value && highlightedIndex.value >= 0) event.preventDefault();
        handleKeyEnter();
      }
    };
    expose({
      focus: () => input.value?.focus(),
      blur: () => input.value?.blur(),
      select: () => input.value?.select(),
      handleSelect, handleKeyEnter, getData, highlight, close, highlightedIndex,
      activated: focused, loading, suggestions: items, inputRef: input, popperRef
    });
    return () => (
      <span class={['i-autocomplete', `i-control--${props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size}`]}>
        {slots.prepend?.()}
        <span class='i-autocomplete__control' ref={anchor}>
          {slots.prefix?.()}
          {props.prefixIcon && <Icon class='i-autocomplete__icon i-autocomplete__icon--prefix' icon={props.prefixIcon} aria-hidden='true' />}
          <Input
            ref={input}
            modelValue={props.modelValue}
            placeholder={props.placeholder}
            size={props.size}
            disabled={isDisabled()}
            {...{ 'aria-label': props.ariaLabel, name: props.name }}
            maxlength={props.maxlength}
            minlength={props.minlength}
            validateEvent={false}
            onCompositionstart={handleCompositionStart}
            onCompositionend={handleCompositionEnd}
            onInput={(value: string) => {
              if (!isComposing.value) query(value);
            }}
            onFocus={(event: FocusEvent) => {
              focused.value = true;
              emit('focus', event);
              if (props.triggerOnFocus) fetchSuggestionsFor(String(props.modelValue), true);
            }}
            onBlur={(event: FocusEvent) => {
              if (!panel.value?.contains(event.relatedTarget as Node)) close();
              emit('blur', event);
              if (props.validateEvent) nextTick(() => field?.validate('blur'));
            }}
            onChange={(value: string) => { if (!isComposing.value) emit('change', value); }}
            onKeydown={onKeydown}
          />
          {props.clearable && props.modelValue && !isDisabled() && (
            <button
              type='button'
              class='i-autocomplete__clear'
              aria-label='清空'
              onMousedown={(event: MouseEvent) => event.preventDefault()}
              onClick={() => {
                query('', true);
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
        {(() => {
          const width = anchor.value?.getBoundingClientRect().width;
          const dropdown = <ul ref={panel} class='i-autocomplete__list' role='listbox'
            style={width ? { [props.fitInputWidth ? 'width' : 'minWidth']: `${width}px` } : undefined}>
            {slots.header && <li role='presentation'>{slots.header()}</li>}
            {loading.value && !props.hideLoading && (
              <li class='i-autocomplete__loading' role='presentation'>
                {slots.loading?.() ?? '加载中…'}
              </li>
            )}
            {(!loading.value || props.hideLoading) && items.value.map((item, index) => (
              <li
                key={index}
                role='option'
                aria-selected={index === highlightedIndex.value}
                class={['i-autocomplete__item', { 'is-highlighted': index === highlightedIndex.value }]}
                onMousedown={(event: MouseEvent) => event.preventDefault()}
                onClick={() => handleSelect(item)}>
                {slots.default?.({ item }) ?? String(item[props.valueKey] ?? '')}
              </li>
            ))}
            {slots.footer && <li role='presentation'>{slots.footer()}</li>}
          </ul>;
          return <Tooltip ref={popperRef} virtualTriggering trigger={[]} hideAfter={0} virtualRef={anchor.value} visible={visible.value}
            teleported={props.teleported} appendTo={props.appendTo} showArrow={props.showArrow}
            effect='light' placement={props.popperOptions?.placement ?? props.placement}
            offset={props.popperOptions?.offset} popperClass={['i-autocomplete__popper', props.popperClass]} popperStyle={props.popperStyle}
            onUpdate:visible={(value: boolean) => { if (!value) close(); }}>
            {{ content: () => dropdown }}
          </Tooltip>;
        })()}
      </span>
    );
  }
});
