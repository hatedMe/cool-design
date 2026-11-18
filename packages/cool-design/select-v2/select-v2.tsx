import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, type PropType } from 'vue';
import { useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import type { SelectV2Option, SelectV2PropsMapping, SelectV2Value } from './types';

type FlatRow =
  | { type: 'group'; label: string }
  | { type: 'option'; option: SelectV2Option };

export default defineComponent({
  name: 'i-select-v2',
  props: {
    modelValue: [String, Number, Array, Object] as PropType<SelectV2Value>,
    options: { type: Array as PropType<SelectV2Option[]>, default: () => [] },
    props: Object as PropType<SelectV2PropsMapping>,
    valueKey: { type: String, default: 'value' },
    filterable: Boolean,
    filterMethod: Function as PropType<(query: string, option: SelectV2Option) => boolean>,
    multiple: Boolean,
    multipleLimit: { type: Number, default: 0 },
    collapseTags: Boolean,
    collapseTagsTooltip: Boolean,
    maxCollapseTags: { type: Number, default: 1 },
    tagType: String,
    clearable: Boolean,
    disabled: Boolean,
    loading: Boolean,
    placeholder: { type: String, default: '请选择' },
    noDataText: { type: String, default: '暂无数据' },
    noMatchText: { type: String, default: '无匹配数据' },
    size: String as PropType<Size>,
    height: { type: Number, default: 240 },
    itemHeight: { type: Number, default: 34 },
    automaticDropdown: Boolean,
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur', 'clear', 'visible-change', 'remove-tag'],
  setup(props, { emit, slots, expose }) {
    const field = useField();
    const config = useConfig();
    const root = ref<HTMLElement>();
    const input = ref<HTMLInputElement>();
    const listRef = ref<HTMLElement>();
    const open = ref(false);
    const query = ref('');
    const highlighted = ref(0);
    const scrollTop = ref(0);

    const labelKey = computed(() => props.props?.label || 'label');
    const valueKey = computed(() => props.props?.value || 'value');
    const disabledKey = computed(() => props.props?.disabled || 'disabled');
    const optionsKey = computed(() => props.props?.options || 'options');

    const keyOf = (value: SelectV2Value): unknown =>
      value !== null && typeof value === 'object'
        ? (value as Record<string, unknown>)[props.valueKey]
        : value;
    const sameValue = (left: SelectV2Value, right: SelectV2Value) => keyOf(left) === keyOf(right);
    const isDisabled = () => props.disabled || !!field?.disabled?.();

    const optionLabel = (option: SelectV2Option) =>
      String(option[labelKey.value] ?? option[valueKey.value] ?? '');

    const rows = computed<FlatRow[]>(() => {
      const result: FlatRow[] = [];
      const walk = (list: SelectV2Option[], grouped: boolean) => {
        list.forEach((option) => {
          const children = option[optionsKey.value] as SelectV2Option[] | undefined;
          if (grouped && Array.isArray(children)) {
            result.push({ type: 'group', label: optionLabel(option) });
            walk(children, true);
          } else {
            result.push({ type: 'option', option });
          }
        });
      };
      walk(props.options, true);
      return result;
    });

    const visibleRows = computed<FlatRow[]>(() => {
      if (!props.filterable || !query.value) return rows.value;
      const filter = props.filterMethod;
      const matches = (option: SelectV2Option) =>
        filter
          ? filter(query.value, option)
          : optionLabel(option).toLowerCase().includes(query.value.toLowerCase());
      // 过滤保留仍有命中子项的分组头，无命中的分组整组隐藏。
      const result: FlatRow[] = [];
      let index = 0;
      while (index < rows.value.length) {
        const row = rows.value[index];
        if (row.type === 'group') {
          let end = index + 1;
          while (end < rows.value.length && rows.value[end].type !== 'group') end++;
          const hits: FlatRow[] = [];
          for (let child = index + 1; child < end; child++) {
            const childRow = rows.value[child];
            if (childRow.type === 'option' && matches(childRow.option)) hits.push(childRow);
          }
          if (hits.length) result.push(row, ...hits);
          index = end;
        } else {
          if (row.type === 'option' && matches(row.option)) result.push(row);
          index++;
        }
      }
      return result;
    });

    const flatOptions = computed(() =>
      rows.value.filter((row): row is { type: 'option'; option: SelectV2Option } => row.type === 'option')
    );

    const selectedValues = computed<SelectV2Value[]>(() => {
      if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue : [];
      return props.modelValue === undefined || props.modelValue === null || Array.isArray(props.modelValue)
        ? []
        : [props.modelValue];
    });
    const selectedOptions = computed(() =>
      selectedValues.value.map(
        (value) => flatOptions.value.find((row) => sameValue(row.option[valueKey.value], value))?.option
      )
    );

    const windowRows = computed(() => {
      const count = Math.ceil(props.height / props.itemHeight) + 4;
      const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - 2);
      return { start, items: visibleRows.value.slice(start, start + count) };
    });

    const setOpen = (value: boolean) => {
      if (isDisabled() || open.value === value) return;
      open.value = value;
      emit('visible-change', value);
      if (value) {
        query.value = '';
        scrollTop.value = 0;
        highlighted.value = Math.max(
          0,
          visibleRows.value.findIndex((row) => row.type === 'option' && !row.option[disabledKey.value])
        );
        nextTick(() => input.value?.focus());
      }
    };

    const update = (value: SelectV2Value) => {
      emit('update:modelValue', value);
      emit('change', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };

    const choose = (row: FlatRow) => {
      if (row.type !== 'option' || isDisabled()) return;
      const option = row.option;
      if (option[disabledKey.value]) return;
      const value = option[valueKey.value];
      if (props.multiple) {
        const current = [...selectedValues.value];
        const index = current.findIndex((item) => sameValue(item, value));
        if (index >= 0) {
          current.splice(index, 1);
          emit('remove-tag', value);
        } else if (!props.multipleLimit || current.length < props.multipleLimit) current.push(value);
        else return;
        update(current);
      } else {
        update(value);
        setOpen(false);
      }
    };

    const clear = () => {
      if (isDisabled()) return;
      update(props.multiple ? [] : undefined);
      emit('clear');
      input.value?.focus();
    };
    const removeTag = (value: SelectV2Value) => {
      if (!props.multiple || isDisabled()) return;
      update(selectedValues.value.filter((item) => !sameValue(item, value)));
      emit('remove-tag', value);
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return setOpen(false);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open.value) return setOpen(true);
        const list = visibleRows.value;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        for (let count = 0; count < list.length; count++) {
          highlighted.value = (highlighted.value + step + list.length) % list.length;
          const row = list[highlighted.value];
          if (row && row.type === 'option' && !row.option[disabledKey.value]) break;
        }
      } else if (event.key === 'Enter') {
        const row = visibleRows.value[highlighted.value];
        if (row && open.value) {
          event.preventDefault();
          choose(row);
        }
      } else if (event.key === 'Backspace' && props.multiple && !query.value && selectedValues.value.length) {
        removeTag(selectedValues.value[selectedValues.value.length - 1]);
      }
    };

    const onOutside = (event: MouseEvent) => {
      if (open.value && root.value && !root.value.contains(event.target as Node)) setOpen(false);
    };
    onMounted(() => document.addEventListener('mousedown', onOutside));
    onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));

    expose({
      focus: () => input.value?.focus(),
      blur: () => input.value?.blur()
    });

    return () => {
      const shown = props.collapseTags
        ? selectedOptions.value.slice(0, Math.max(0, props.maxCollapseTags))
        : selectedOptions.value;
      const rest = selectedOptions.value.length - shown.length;
      return (
        <span
          ref={root}
          class={[
            'i-select-v2',
            `i-control--${props.size ?? field?.size?.() ?? config.value.size}`,
            { 'is-open': open.value, 'is-disabled': isDisabled() }
          ]}>
          <div
            role='combobox'
            tabindex={isDisabled() ? -1 : 0}
            aria-expanded={open.value}
            aria-haspopup='listbox'
            class='i-select-v2__control'
            onClick={() => setOpen(!open.value)}
            onFocus={(event: FocusEvent) => {
              emit('focus', event);
              if (props.automaticDropdown) setOpen(true);
            }}
            onBlur={(event: FocusEvent) => {
              emit('blur', event);
              if (props.validateEvent) nextTick(() => field?.validate('blur'));
            }}
            onKeydown={onKeydown}>
            {shown.map((option, index) =>
              option ? (
                <span class={['i-select-v2__tag', props.tagType && `is-${props.tagType}`]} key={index}>
                  {slots.tag?.({ data: option }) ?? optionLabel(option)}
                  {!isDisabled() && (
                    <button
                      type='button'
                      aria-label={`移除 ${optionLabel(option)}`}
                      onClick={(event: MouseEvent) => {
                        event.stopPropagation();
                        removeTag(option[valueKey.value]);
                      }}>
                      ×
                    </button>
                  )}
                </span>
              ) : (
                <span class='i-select-v2__tag' key={index}>
                  {String(selectedValues.value[index])}
                </span>
              )
            )}
            {rest > 0 && (
              <span
                class='i-select-v2__more'
                title={props.collapseTagsTooltip ? selectedOptions.value.map((option) => (option ? optionLabel(option) : '')).join('、') : undefined}>
                +{rest}
              </span>
            )}
            <input
              ref={input}
              class='i-select-v2__input'
              value={query.value}
              placeholder={selectedOptions.value.length ? '' : props.placeholder}
              readonly={!props.filterable}
              aria-label='筛选选项'
              onInput={(event: Event) => {
                query.value = (event.target as HTMLInputElement).value;
                highlighted.value = 0;
                scrollTop.value = 0;
              }}
            />
            {props.clearable && selectedValues.value.length > 0 && (
              <button
                type='button'
                aria-label='清空'
                onClick={(event: MouseEvent) => {
                  event.stopPropagation();
                  clear();
                }}>
                ×
              </button>
            )}
          </div>
          {open.value && (
            <div
              class='i-select-v2__dropdown'
              role='listbox'
              style={{ maxHeight: `${props.height}px` }}
              onScroll={(event: Event) => {
                scrollTop.value = (event.target as HTMLElement).scrollTop;
              }}>
              {slots.header?.()}
              {props.loading && <div class='i-select-v2__empty'>{slots.empty?.() ?? '加载中…'}</div>}
              {!props.loading && !visibleRows.value.length && (
                <div class='i-select-v2__empty'>{slots.empty?.() ?? (query.value ? props.noMatchText : props.noDataText)}</div>
              )}
              {!props.loading && visibleRows.value.length > 0 && (
                <div
                  ref={listRef}
                  class='i-select-v2__list'
                  style={{ height: `${visibleRows.value.length * props.itemHeight}px`, position: 'relative' }}>
                  <div style={{ transform: `translateY(${windowRows.value.start * props.itemHeight}px)` }}>
                    {windowRows.value.items.map((row, index) => {
                      const rowIndex = windowRows.value.start + index;
                      if (row.type === 'group') {
                        return (
                          <div class='i-select-v2__group' key={`group-${rowIndex}`} style={{ height: `${props.itemHeight}px` }}>
                            {row.label}
                          </div>
                        );
                      }
                      const option = row.option;
                      const selected = selectedValues.value.some((value) => sameValue(value, option[valueKey.value]));
                      return (
                        <div
                          key={rowIndex}
                          role='option'
                          aria-selected={selected}
                          aria-disabled={Boolean(option[disabledKey.value]) || undefined}
                          style={{ height: `${props.itemHeight}px` }}
                          class={[
                            'i-select-v2__option',
                            {
                              'is-selected': selected,
                              'is-highlighted': rowIndex === highlighted.value,
                              'is-disabled': Boolean(option[disabledKey.value])
                            }
                          ]}
                          onClick={() => choose(row)}>
                          {slots.label?.({ option }) ?? optionLabel(option)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {slots.footer?.()}
            </div>
          )}
        </span>
      );
    };
  }
});
