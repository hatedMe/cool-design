import { computed, defineComponent, h, inject, nextTick, onBeforeUnmount, ref, watch, type Component, type CSSProperties, type PropType } from 'vue';
import { Teleport } from 'vue';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { useComposition } from '../../hooks/use-composition';
import { formKey, useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import Tooltip from '../tooltip';
import { useFloating, type FloatingOptions, type Placement } from '../../../src/utils/use-floating';
import type { SelectV2TagTooltipOptions, SelectV2FilterMethod, SelectV2OptionFilterMethod, SelectV2RemoteMethod, SelectV2Option, SelectV2PropsMapping, SelectV2Value } from './types';

type FlatRow =
  | { type: 'group'; label: string }
  | { type: 'option'; option: SelectV2Option };

export default defineComponent({
  name: 'i-select-v2',
  props: {
    modelValue: [String, Number, Boolean, Array, Object] as PropType<SelectV2Value>,
    options: { type: Array as PropType<SelectV2Option[]>, default: () => [] },
    props: Object as PropType<SelectV2PropsMapping>,
    valueKey: { type: String, default: 'value' },
    filterable: Boolean,
    filterMethod: Function as PropType<SelectV2FilterMethod>,
    optionFilterMethod: Function as PropType<SelectV2OptionFilterMethod>,
    remote: Boolean,
    remoteMethod: Function as PropType<SelectV2RemoteMethod>,
    debounce: { type: Number, default: 300 },
    allowCreate: Boolean,
    defaultFirstOption: Boolean,
    reserveKeyword: { type: Boolean, default: true },
    multiple: Boolean,
    multipleLimit: { type: Number, default: 0 },
    collapseTags: Boolean,
    collapseTagsTooltip: Boolean,
    maxCollapseTags: { type: Number, default: 1 },
    tagType: { type: String, default: 'info' },
    clearable: Boolean,
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: { type: [String, Number, Boolean, Function], default: undefined },
    disabled: Boolean,
    loading: Boolean,
    placeholder: { type: String, default: '请选择' },
    noDataText: { type: String, default: '暂无数据' },
    noMatchText: { type: String, default: '无匹配数据' },
    size: String as PropType<Size>,
    height: { type: Number, default: 240 },
    itemHeight: { type: Number, default: 34 },
    automaticDropdown: Boolean,
    name: String,
    validateEvent: { type: Boolean, default: true },
    teleported: { type: Boolean, default: true },
    persistent: { type: Boolean, default: true },
    appendTo: [String, Object] as PropType<string | HTMLElement>,
    loadingText: String,
    suffixIcon: [String, Object, Function] as PropType<string | Component>,
    clearIcon: [String, Object, Function] as PropType<string | Component>,
    remoteShowSuffix: Boolean,
    tagTooltip: Object as PropType<SelectV2TagTooltipOptions>,
    showArrow: { type: Boolean, default: true },
    offset: { type: Number, default: 12 },
    tagEffect: { type: String as PropType<'light' | 'dark' | 'plain'>, default: 'light' },
    placement: { type: String as PropType<Placement>, default: 'bottom-start' },
    fallbackPlacements: { type: Array as PropType<Placement[]>, default: () => ['bottom-start', 'top-start', 'right', 'left'] },
    popperOptions: { type: Object as PropType<FloatingOptions>, default: undefined },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    popperStyle: { type: [String, Array, Object] as PropType<string | CSSProperties | CSSProperties[]>, default: undefined },
    effect: { type: String as PropType<'light' | 'dark'>, default: 'light' }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur', 'clear', 'visible-change', 'remove-tag', 'end-reached'],
  setup(props, { emit, slots, expose }) {
    const field = useField();
    const form = inject(formKey, undefined);
    const config = useConfig();
    const { getValueOnClear, isEmptyValue } = useEmptyValues({
      emptyValues: computed(() => props.emptyValues),
      valueOnClear: computed(() => props.valueOnClear)
    });
    const root = ref<HTMLElement>();
    const input = ref<HTMLInputElement>();
    const listRef = ref<HTMLElement>();
    const dropdown = ref<HTMLElement>();
    const open = ref(false);
    const shownOnce = ref(false);
    const { isComposing, handleCompositionStart, handleCompositionEnd } = useComposition();
    const query = ref('');
    const remoteOptions = ref<SelectV2Option[]>();
    const cachedOptions = ref<SelectV2Option[]>([]);
    let searchTimer: ReturnType<typeof setTimeout> | undefined;
    let searchId = 0;
    const cancelSearch = () => {
      searchId++;
      if (searchTimer !== undefined) clearTimeout(searchTimer);
      searchTimer = undefined;
    };
    onBeforeUnmount(cancelSearch);
    const optionFilter = computed(() => props.optionFilterMethod ??
      (props.filterMethod && props.filterMethod.length >= 2 ? props.filterMethod as SelectV2OptionFilterMethod : undefined));
    const queryFilter = computed(() => props.filterMethod && props.filterMethod.length < 2
      ? props.filterMethod as (value: string) => void : undefined);
    const highlighted = ref(0);
    const scrollTop = ref(0);
    const position = useFloating({
      open,
      reference: root,
      floating: dropdown,
      placement: () => props.popperOptions?.placement ?? props.placement,
      fallbackPlacements: () => props.fallbackPlacements,
      offset: () => props.popperOptions?.offset ?? props.offset,
      appendTo: () => props.appendTo,
      close: () => setOpen(false)
    });

    const labelKey = computed(() => props.props?.label || 'label');
    const valueKey = computed(() => props.props?.value || 'value');
    const disabledKey = computed(() => props.props?.disabled || 'disabled');
    const optionsKey = computed(() => props.props?.options || 'options');

    const keyOf = (value: SelectV2Value): unknown =>
      value !== null && typeof value === 'object'
        ? (value as Record<string, unknown>)[props.valueKey]
        : value;
    const sameValue = (left: SelectV2Value, right: SelectV2Value) => keyOf(left) === keyOf(right);
    const isDisabled = () => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.());

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
      walk(props.remote ? remoteOptions.value ?? props.options : props.options, true);
      return result;
    });

    const filteredRows = computed<FlatRow[]>(() => {
      if (!props.filterable || !query.value || queryFilter.value || props.remote) return rows.value;
      const filter = optionFilter.value;
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

    const creatable = computed<SelectV2Option | undefined>(() => {
      if (!props.allowCreate || !props.filterable || !query.value) return;
      if ([...rows.value, ...cachedOptions.value.map((option) => ({ type: 'option', option }) as const)].some(
        (row) => row.type === 'option' && (optionLabel(row.option) === query.value || sameValue(row.option[valueKey.value], query.value))
      )) return;
      return { [valueKey.value]: query.value, [labelKey.value]: query.value };
    });
    const visibleRows = computed<FlatRow[]>(() => creatable.value
      ? [{ type: 'option', option: creatable.value }, ...filteredRows.value]
      : filteredRows.value);

    const flatOptions = computed(() =>
      rows.value.filter((row): row is { type: 'option'; option: SelectV2Option } => row.type === 'option')
    );

    const selectedValues = computed<SelectV2Value[]>(() => {
      if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue : [];
      return isEmptyValue(props.modelValue) || Array.isArray(props.modelValue)
        ? []
        : [props.modelValue];
    });
    watch([selectedValues, flatOptions], ([values, options]) => {
      cachedOptions.value = values.flatMap((value) => {
        const option = options.find((row) => sameValue(row.option[valueKey.value], value))?.option ??
          cachedOptions.value.find((item) => sameValue(item[valueKey.value], value));
        return option ? [option] : [];
      });
    }, { immediate: true });
    const selectedOptions = computed(() =>
      selectedValues.value.map(
        (value) => flatOptions.value.find((row) => sameValue(row.option[valueKey.value], value))?.option ??
          cachedOptions.value.find((option) => sameValue(option[valueKey.value], value))
      )
    );

    const windowRows = computed(() => {
      const height = dropdown.value?.clientHeight || props.height;
      const top = scrollTop.value - (listRef.value?.offsetTop ?? 0);
      const count = Math.ceil(height / props.itemHeight) + 4;
      const start = Math.max(0, Math.floor(top / props.itemHeight) - 2);
      return { start, items: visibleRows.value.slice(start, start + count) };
    });

    const setOpen = (value: boolean) => {
      if (open.value === value || (value && isDisabled())) return;
      open.value = value;
      if (value) shownOnce.value = true;
      emit('visible-change', value);
      if (value) {
        query.value = '';
        remoteOptions.value = undefined;
        scrollTop.value = 0;
        // 打开时优先高亮选中项，未选中时高亮首个可用项
        const selectedIndex = visibleRows.value.findIndex(
          (row) => row.type === 'option' && selectedValues.value.some((item) => sameValue(item, row.option[valueKey.value]))
        );
        highlighted.value = selectedIndex >= 0
          ? selectedIndex
          : Math.max(
              0,
              visibleRows.value.findIndex((row) => row.type === 'option' && !row.option[disabledKey.value])
            );
        nextTick(() => {
          syncScrollToHighlighted();
          input.value?.focus();
        });
      } else cancelSearch();
    };

    watch(isDisabled, (disabled) => { if (disabled) setOpen(false); });

    const scrollTo = (index: number) => {
      const view = dropdown.value;
      if (!view || !visibleRows.value.length || !Number.isFinite(index) || index < 0) return;
      const contentTop = listRef.value?.offsetTop ?? (parseFloat(getComputedStyle(view).paddingTop) || 0);
      const target = Math.min(Math.floor(index), visibleRows.value.length - 1) * props.itemHeight + contentTop;
      if (target < view.scrollTop) view.scrollTop = target;
      else if (target + props.itemHeight > view.scrollTop + view.clientHeight)
        view.scrollTop = target + props.itemHeight - view.clientHeight;
      scrollTop.value = view.scrollTop;
    };
    const syncScrollToHighlighted = () => scrollTo(highlighted.value);
    watch(highlighted, () => {
      nextTick(syncScrollToHighlighted);
    });

    const resetHighlight = () => {
      highlighted.value = props.defaultFirstOption
        ? visibleRows.value.findIndex((row) => row.type === 'option' && !row.option[disabledKey.value])
        : -1;
      scrollTop.value = 0;
    };
    watch(visibleRows, () => {
      if (open.value && query.value && props.defaultFirstOption) resetHighlight();
    });
    const changeQuery = (value: string) => {
      if (value === query.value || isDisabled()) return;
      query.value = value;
      cancelSearch();
      resetHighlight();
      if (queryFilter.value) {
        queryFilter.value(value);
        return;
      }
      if (!props.remote || !props.filterable || !props.remoteMethod) return;
      const id = searchId;
      const search = async () => {
        searchTimer = undefined;
        try {
          const options = await props.remoteMethod?.(value);
          if (id === searchId && Array.isArray(options)) {
            remoteOptions.value = options;
            resetHighlight();
          }
        } catch {
          if (id === searchId) remoteOptions.value = undefined;
        }
      };
      if (props.debounce > 0) searchTimer = setTimeout(search, props.debounce);
      else void search();
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
      const created = option === creatable.value;
      if (props.multiple) {
        const current = [...selectedValues.value];
        const index = current.findIndex((item) => sameValue(item, value));
        if (index >= 0) {
          current.splice(index, 1);
          emit('remove-tag', value);
        } else if (!props.multipleLimit || current.length < props.multipleLimit) current.push(value);
        else return;
        if (created || props.remote) cachedOptions.value.push(option);
        update(current);
        if (created || !props.reserveKeyword) changeQuery('');
      } else {
        if (created || props.remote) cachedOptions.value.push(option);
        update(value);
        setOpen(false);
      }
    };

    const clear = () => {
      if (isDisabled()) return;
      update(props.multiple ? [] : getValueOnClear());
      emit('clear');
      input.value?.focus();
    };
    const removeTag = (value: SelectV2Value) => {
      if (!props.multiple || isDisabled()) return;
      update(selectedValues.value.filter((item) => !sameValue(item, value)));
      emit('remove-tag', value);
    };

    const optionIndex = (option: SelectV2Option) => flatOptions.value.findIndex((row) => sameValue(row.option[valueKey.value], option[valueKey.value]));
    const selectedLabels = computed(() => selectedValues.value.map((value, index) => {
      const option = selectedOptions.value[index];
      return option ? optionLabel(option) : String(value ?? '');
    }));
    const selectedLabel = computed(() => props.multiple ? selectedLabels.value : (selectedLabels.value[0] ?? ''));
    const renderIcon = (icon: string | Component | undefined, fallback: string) =>
      typeof icon === 'string' ? <i class={icon} aria-hidden='true' /> : icon ? h(icon, { 'aria-hidden': true }) : fallback;
    const deleteTag = (event: MouseEvent, option: SelectV2Option) => {
      event.stopPropagation();
      removeTag(option[valueKey.value]);
    };
    let lastScrollTop = 0;
    const onScroll = (event: Event) => {
      const list = event.currentTarget as HTMLElement;
      const top = list.scrollTop;
      scrollTop.value = top;
      if (top !== lastScrollTop) {
        if (top <= 0 && top < lastScrollTop) emit('end-reached', 'top');
        else if (top > lastScrollTop && top + list.clientHeight + 1 >= list.scrollHeight) emit('end-reached', 'bottom');
      }
      lastScrollTop = top;
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (isDisabled()) return;
      if (isComposing.value || event.isComposing) return;
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

    expose({
      focus: () => input.value?.focus(),
      blur: () => input.value?.blur(),
      selectedLabel,
      scrollTo
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
            `i-control--${props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size}`,
            { 'is-open': open.value, 'is-disabled': isDisabled() }
          ]}>
          <div
            role='combobox'
            aria-disabled={isDisabled() || undefined}
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
            {props.multiple && slots.tag
              ? slots.tag({ data: selectedOptions.value.map((option, index) => option ?? { [valueKey.value]: selectedValues.value[index], [labelKey.value]: selectedLabels.value[index] }), deleteTag, selectDisabled: isDisabled() })
              : shown.map((option, index) =>
              option ? (
                <span class={['i-select-v2__tag', props.multiple && [`is-${props.tagType}`, `is-${props.tagEffect}`]]} key={index}>
                  {slots.label?.({ index: optionIndex(option), label: optionLabel(option), value: option[valueKey.value] }) ?? optionLabel(option)}
                  {props.multiple && !isDisabled() && (
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
                  {slots.label?.({ index: -1, label: selectedLabels.value[index], value: selectedValues.value[index] }) ?? selectedLabels.value[index]}
                </span>
              )
            )}
            {rest > 0 && !slots.tag && (
              props.collapseTagsTooltip ? (
                <Tooltip
                  disabled={open.value}
                  teleported={props.tagTooltip?.teleported ?? props.teleported}
                  appendTo={props.tagTooltip?.appendTo ?? props.appendTo}
                  effect={props.tagTooltip?.effect ?? props.effect}
                  popperClass={props.tagTooltip?.popperClass ?? props.popperClass}
                  popperStyle={props.tagTooltip?.popperStyle ?? props.popperStyle}
                  placement={props.tagTooltip?.placement ?? props.tagTooltip?.popperOptions?.placement}
                  offset={props.tagTooltip?.offset ?? props.tagTooltip?.popperOptions?.offset}
                  fallbackPlacements={props.tagTooltip?.fallbackPlacements}
                  showAfter={props.tagTooltip?.showAfter}
                  hideAfter={props.tagTooltip?.hideAfter}
                  autoClose={props.tagTooltip?.autoClose}>
                  {{
                    default: () => <span class='i-select-v2__more'>+{rest}</span>,
                    content: () => selectedLabels.value.slice(shown.length).map((label, offset) => {
                      const index = shown.length + offset;
                      return <span key={index}>{slots.label?.({ index: selectedOptions.value[index] ? optionIndex(selectedOptions.value[index]!) : -1, label, value: selectedValues.value[index] }) ?? label}</span>;
                    })
                  }}
                </Tooltip>
              ) : <span class='i-select-v2__more'>+{rest}</span>
            )}
            <input
              ref={input}
              class='i-select-v2__input'
              value={query.value}
              placeholder={selectedOptions.value.length ? '' : props.placeholder}
              readonly={!props.filterable}
              disabled={isDisabled()}
              aria-label='筛选选项'
              onCompositionstart={handleCompositionStart}
              onCompositionend={(event: CompositionEvent) => {
                handleCompositionEnd();
                changeQuery((event.target as HTMLInputElement).value);
              }}
              onInput={(event: Event) => {
                if (isComposing.value || (event as InputEvent).isComposing) return;
                if (isDisabled()) return;
                changeQuery((event.target as HTMLInputElement).value);
              }}
            />
            {props.clearable && selectedValues.value.length > 0 && (
              <button
                type='button'
                aria-label='清空'
                disabled={isDisabled()}
                onClick={(event: MouseEvent) => {
                  event.stopPropagation();
                  clear();
                }}>
                {renderIcon(props.clearIcon, '×')}
              </button>
            )}
            {!props.clearable || !selectedValues.value.length ? (!props.remote || !props.filterable || props.remoteShowSuffix) && (
              <span class='i-select-v2__suffix' aria-hidden='true'>{renderIcon(props.suffixIcon, '⌄')}</span>
            ) : null}
          </div>
          {props.name && (
            <input
              type='hidden'
              name={props.name}
              value={props.multiple ? JSON.stringify(selectedValues.value.map((item) => keyOf(item))) : String(keyOf(selectedValues.value[0]) ?? '')}
            />
          )}
          {(() => {
            const kept = props.persistent && shownOnce.value && !open.value;
            if (!open.value && !kept) return null;
            const panel = (
              <div
                ref={dropdown}
                class={['i-select-v2__dropdown', `i-select-v2__dropdown--${props.effect}`, props.popperClass]}
                role='listbox'
                aria-hidden={kept ? 'true' : undefined}
                data-placement={position.placement.value}
                style={[position.style.value, { maxHeight: `${props.height}px` }, props.popperStyle, kept ? { display: 'none' } : undefined]}
                onScroll={onScroll}>
                {props.showArrow && <span class='i-select-v2__arrow' style={position.arrowStyle.value} aria-hidden='true' />}
                {slots.header && <div onClick={(event: MouseEvent) => event.stopPropagation()}>{slots.header()}</div>}
                {props.loading && <div class='i-select-v2__empty'>{slots.loading?.() ?? slots.empty?.() ?? (props.loadingText || '加载中…')}</div>}
                {!props.loading && !visibleRows.value.length && (
                  <div class='i-select-v2__empty'>{slots.empty?.() ?? (query.value && rows.value.length ? props.noMatchText : props.noDataText)}</div>
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
                            {slots.default?.({ item: option, index: rowIndex }) ?? optionLabel(option)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {slots.footer && <div onClick={(event: MouseEvent) => event.stopPropagation()}>{slots.footer()}</div>}
              </div>
            );
            return props.teleported ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
          })()}
        </span>
      );
    };
  }
});
