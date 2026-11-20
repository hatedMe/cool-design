import {
  defineComponent,
  Comment,
  Fragment,
  h,
  nextTick,
  onBeforeUnmount,
  type Component,
  ref,
  computed,
  watch,
  type CSSProperties,
  type PropType,
  type VNode
} from 'vue';
import Icon from '../icon';
import { Teleport } from 'vue';
import { inject } from 'vue';
import { formKey, useField } from '../form/context';
import { useConfig, useLocale, type Size } from '../config-provider/context';
import { useFloating, type FloatingOptions, type Placement } from '../../../src/utils/use-floating';

export interface SelectRemoteOption {
  value: string | number | boolean;
  label?: string;
  disabled?: boolean;
}

export interface SelectPropsMapping {
  value?: string;
  label?: string;
  disabled?: string;
  options?: string;
}

type SelectValue = string | number | boolean | object | null;
type OptionRecord = {
  value: unknown;
  label: string;
  disabled: boolean;
  group?: string;
  vnode?: VNode;
};
type OptionFilter = (query: string, option: Pick<OptionRecord, 'value' | 'label' | 'disabled'>) => boolean;
type SlotContent = { default?: () => unknown };
export type SelectTagType = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const getVNodeText = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(getVNodeText).join('');
  if (value && typeof value === 'object' && 'default' in value) {
    const slot = value as SlotContent;
    return slot.default ? getVNodeText(slot.default()) : '';
  }
  if (value && typeof value === 'object' && 'children' in value) {
    return getVNodeText((value as VNode).children);
  }
  return '';
};

export default defineComponent({
  name: 'i-select',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Boolean, Array, Object] as PropType<SelectValue>, default: undefined },
    options: Array as PropType<Record<string, unknown>[]>,
    props: Object as PropType<SelectPropsMapping>,
    valueKey: { type: String, default: 'value' },
    clearable: Boolean,
    disabled: Boolean,
    placeholder: String,
    size: String as PropType<Size>,
    multiple: Boolean,
    multipleLimit: { type: Number, default: 0 },
    collapseTags: Boolean,
    collapseTagsTooltip: Boolean,
    maxCollapseTags: { type: Number, default: 1 },
    tagEffect: { type: String as PropType<'light' | 'dark' | 'plain'>, default: 'light' },
    suffixIcon: [String, Object, Function] as PropType<string | Component>,
    clearIcon: { type: [String, Object, Function] as PropType<string | Component>, default: 'icon-close' },
    autocomplete: { type: String, default: 'off' },
    debounce: { type: Number, default: 300 },
    remoteShowSuffix: Boolean,
    tagType: String as PropType<SelectTagType>,
    name: String,
    filterable: Boolean,
    filterMethod: Function as PropType<(query: string, option: Pick<OptionRecord, 'value' | 'label' | 'disabled'>) => void | boolean>,
    optionFilter: Function as PropType<OptionFilter>,
    allowCreate: Boolean,
    defaultFirstOption: Boolean,
    reserveKeyword: { type: Boolean, default: true },
    automaticDropdown: Boolean,
    fitInputWidth: Boolean,
    noDataText: String,
    noMatchText: String,
    loadingText: String,
    remote: Boolean,
    remoteMethod: Function as PropType<(query: string) => void | SelectRemoteOption[] | Promise<void | SelectRemoteOption[]>>,
    loading: Boolean,
    remoteLoading: Boolean,
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: { type: [String, Number, Boolean, Function, Array, Object] as PropType<SelectValue | (() => unknown)>, default: undefined },
    validateEvent: { type: Boolean, default: true },
    virtualized: Boolean,
    itemHeight: { type: Number, default: 34 },
    height: { type: Number, default: 240 },
    teleported: { type: Boolean, default: true },
    persistent: { type: Boolean, default: true },
    appendTo: [String, Object] as PropType<string | HTMLElement>,
    placement: { type: String as PropType<Placement>, default: 'bottom-start' },
    fallbackPlacements: { type: Array as PropType<Placement[]>, default: () => ['top-start', 'bottom', 'top'] },
    popperOptions: { type: Object as PropType<FloatingOptions>, default: undefined },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    popperStyle: { type: [String, Array, Object] as PropType<string | CSSProperties | CSSProperties[]>, default: undefined },
    effect: { type: String as PropType<'light' | 'dark'>, default: 'light' }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear', 'visible-change', 'remove-tag', 'popup-scroll', 'end-reached'],
  setup(props, { slots, attrs, emit, expose }) {
    const field = useField();
    const form = inject(formKey, undefined);
    const config = useConfig();
    const { t } = useLocale();
    const placeholder = computed(() => props.placeholder ?? t('el.select.placeholder', '请选择'));
    const noDataText = computed(() => props.noDataText ?? t('el.select.noData', '暂无数据'));
    const noMatchText = computed(() => props.noMatchText ?? t('el.select.noMatch', '无匹配数据'));
    const loadingText = computed(() => props.loadingText ?? t('el.select.loading', '加载中…'));
    const clearedValue = () => {
      const value = props.valueOnClear !== undefined ? props.valueOnClear : config.value.valueOnClear;
      return typeof value === 'function' ? value() : value;
    };
    const root = ref<HTMLElement>();
    const select = ref<HTMLSelectElement>();
    const input = ref<HTMLInputElement>();
    const query = ref('');
    const open = ref(false);
    const highlightedIndex = ref(-1);
    const remoteOptions = ref<SelectRemoteOption[]>([]);
    const createdOptions = ref<SelectRemoteOption[]>([]);
    const virtualOffset = ref(0);
    const dropdown = ref<HTMLElement>();
    const dropdownMinWidth = ref<string>();
    const shown = ref(false);
    let remoteRequestId = 0;
    let remoteTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelRemote = () => {
      remoteRequestId++;
      if (remoteTimer !== undefined) clearTimeout(remoteTimer);
      remoteTimer = undefined;
    };
    onBeforeUnmount(cancelRemote);
    const scrollPosition = { top: 0, left: 0 };
    const onPopupScroll = (event: Event) => {
      const element = event.currentTarget as HTMLElement;
      const { scrollTop, scrollLeft } = element;
      emit('popup-scroll', { scrollTop, scrollLeft });
      if (scrollTop > scrollPosition.top && scrollTop + element.clientHeight >= element.scrollHeight - 1) emit('end-reached', 'bottom');
      if (scrollTop < scrollPosition.top && scrollTop <= 0) emit('end-reached', 'top');
      if (scrollLeft > scrollPosition.left && scrollLeft + element.clientWidth >= element.scrollWidth - 1) emit('end-reached', 'right');
      if (scrollLeft < scrollPosition.left && scrollLeft <= 0) emit('end-reached', 'left');
      scrollPosition.top = scrollTop;
      scrollPosition.left = scrollLeft;
      if (props.virtualized) virtualOffset.value = Math.floor(scrollTop / props.itemHeight);
    };
    const position = useFloating({
      open,
      reference: root,
      floating: dropdown,
      placement: () => props.popperOptions?.placement ?? props.placement,
      fallbackPlacements: () => props.fallbackPlacements,
      offset: () => props.popperOptions?.offset ?? 4,
      appendTo: () => props.appendTo,
      close: () => setOpen(false)
    });

    const isDisabled = () => props.disabled || (field?.disabled?.() ?? form?.disabled?.());
    const keyOf = (value: unknown): unknown =>
      value !== null && typeof value === 'object' ? (value as Record<string, unknown>)[props.valueKey] : value;
    const sameValue = (left: unknown, right: unknown) => keyOf(left) === keyOf(right);
    const isGroup = (vnode: VNode) => (vnode.type as { name?: string } | null)?.name === 'i-select-option-group';
    const slotOptions = (): Array<{ vnode: VNode; group?: string; groupDisabled?: boolean }> => {
      const flatten = (
        nodes: VNode[],
        group?: string,
        groupDisabled = false
      ): Array<{ vnode: VNode; group?: string; groupDisabled?: boolean }> =>
        nodes
          .filter((item) => item.type !== Comment)
          .flatMap((item) =>
            item.type === Fragment
              ? flatten((item.children ?? []) as VNode[], group, groupDisabled)
              : isGroup(item)
              ? flatten(
                  ((item.children as SlotContent | undefined)?.default?.() ?? []) as VNode[],
                  (item.props?.label as string | undefined) ?? undefined,
                  groupDisabled || Boolean(item.props?.disabled)
                )
              : [{ vnode: item, group, groupDisabled }]
          );
      return flatten((slots.default?.() ?? []) as VNode[]);
    };
    const dataOptions = (items: Record<string, unknown>[], group?: string, groupDisabled = false): OptionRecord[] => {
      const mapping = { value: 'value', label: 'label', disabled: 'disabled', options: 'options', ...props.props };
      return items.flatMap((item) => {
        const children = item[mapping.options];
        const disabled = groupDisabled || Boolean(item[mapping.disabled]);
        if (Array.isArray(children)) return dataOptions(children, String(item[mapping.label] ?? ''), disabled);
        return [{ value: item[mapping.value], label: String(item[mapping.label] ?? item[mapping.value] ?? ''), disabled, group }];
      });
    };
    const localRecords = computed<OptionRecord[]>(() => props.options ? dataOptions(props.options) : slotOptions().map(({ vnode: item, group, groupDisabled }) => ({
        value: item.props?.value,
        label: String(item.props?.label ?? (getVNodeText(item.children) || String(keyOf(item.props?.value) ?? ''))),
        disabled: Boolean(item.props?.disabled) || Boolean(groupDisabled),
        group,
        vnode: item
      })));
    const optionRecords = computed<OptionRecord[]>(() => {
      const local = localRecords.value;
      const remoteItems = [...remoteOptions.value, ...createdOptions.value];
      const remote: OptionRecord[] = remoteItems.filter((item, index, items) => items.findIndex((candidate) => sameValue(candidate.value, item.value)) === index).map((item) => ({
        value: item.value,
        label: item.label ?? String(item.value),
        disabled: Boolean(item.disabled)
      }));
      const records = props.remote ? [...local, ...remote] : [...local, ...createdOptions.value.map((item) => ({ value: item.value, label: item.label ?? String(item.value), disabled: Boolean(item.disabled) }))];
      return records.filter((item, index) => records.findIndex((candidate) => sameValue(candidate.value, item.value)) === index);
    });
    const selectedValues = computed<Array<unknown>>(() => {
      if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue.flat() : [];
      return props.modelValue === undefined || Array.isArray(props.modelValue) ? [] : [props.modelValue];
    });
    let selectedCache: OptionRecord[] = [];
    const selectedRecords = computed(() => selectedValues.value.flatMap((value) => {
      const item = optionRecords.value.find((record) => sameValue(record.value, value))
        ?? selectedCache.find((record) => sameValue(record.value, value));
      return item ? [item] : [];
    }));
    const formRecords = computed(() => [...optionRecords.value, ...selectedRecords.value.filter((item) =>
      !optionRecords.value.some((record) => sameValue(record.value, item.value)))]);
    const groupBy = (records: OptionRecord[]) => {
      const groups: Array<{ label?: string; items: OptionRecord[] }> = [];
      records.forEach((item) => {
        const last = groups[groups.length - 1];
        if (item.group === undefined) groups.push({ items: [item] });
        else if (last && last.label === item.group) last.items.push(item);
        else groups.push({ label: item.group, items: [item] });
      });
      return groups;
    };
    const filterOption = computed(() => props.optionFilter ?? (props.filterMethod && props.filterMethod.length > 1 ? props.filterMethod : undefined));
    const filterQuery = computed(() => props.filterMethod && props.filterMethod.length <= 1 ? props.filterMethod as (query: string) => void : undefined);
    const filteredRecords = computed(() => {
      if (filterQuery.value || (props.remote && !filterOption.value) || !props.filterable || !query.value) return optionRecords.value;
      return optionRecords.value.filter((item) =>
        filterOption.value ? filterOption.value(query.value, { value: item.value, label: item.label, disabled: item.disabled }) : item.label.includes(query.value)
      );
    });
    const loading = computed(() => props.loading || props.remoteLoading);

    const setOpen = (value: boolean) => {
      if (open.value === value || (value && isDisabled())) return;
      open.value = value;
      if (value) shown.value = true;
      else {
        cancelRemote();
        if (props.remote) query.value = '';
        if (!props.persistent) Object.assign(scrollPosition, { top: 0, left: 0 });
      }
      emit('visible-change', value);
      if (value) {
        // 打开时优先高亮选中项，未选中时高亮首个可用项
        const selectedIndex = filteredRecords.value.findIndex((item) =>
          selectedValues.value.some((value2) => sameValue(value2, item.value))
        );
        const firstUsable = filteredRecords.value.findIndex((item) => !item.disabled);
        highlightedIndex.value = selectedIndex >= 0 ? selectedIndex : Math.max(0, firstUsable);
        nextTick(() => {
          if (props.fitInputWidth && root.value) {
            dropdownMinWidth.value = `${root.value.getBoundingClientRect().width}px`;
          }
          input.value?.focus();
        });
      }
    };
    const update = (value: unknown, normalizeEmpty = true) => {
      const isEmptyCleared =
        !props.multiple && (props.emptyValues ?? config.value.emptyValues ?? []).some((item) => item === value);
      const next = normalizeEmpty && isEmptyCleared ? clearedValue() : value;
      emit('update:modelValue', next);
      emit('change', next);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };
    const shouldReserveKeyword = () => props.multiple && props.filterable && props.reserveKeyword;
    const clearQuery = (force = false) => {
      if (force || !shouldReserveKeyword()) query.value = '';
    };
    const choose = (record: OptionRecord) => {
      if (record.disabled || isDisabled()) return;
      if (props.multiple) {
        const current = [...selectedValues.value];
        const index = current.findIndex((value) => sameValue(value, record.value));
        if (index >= 0) {
          current.splice(index, 1);
          emit('remove-tag', record.value);
        } else if (!props.multipleLimit || current.length < props.multipleLimit) current.push(record.value);
        else return;
        update(current);
      } else {
        update(record.value);
        setOpen(false);
      }
      clearQuery();
    };
    const clear = () => {
      if (isDisabled()) return;
      update(props.multiple ? [] : clearedValue(), false);
      emit('clear');
      const target = input.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
      target?.focus();
    };
    const removeTag = (value: unknown) => {
      if (!props.multiple || isDisabled()) return;
      update(selectedValues.value.filter((item) => !sameValue(item, value)));
      emit('remove-tag', value);
    };
    const loadRemote = (value: string) => {
      if (query.value === value && open.value) return;
      query.value = value;
      virtualOffset.value = 0;
      setOpen(true);
      cancelRemote();
      if (props.filterable && filterQuery.value) { filterQuery.value(value); return; }
      const fetch = props.remoteMethod;
      if (!props.filterable || !props.remote || filterOption.value || !fetch) return;
      const requestId = remoteRequestId;
      const run = async () => {
        remoteTimer = undefined;
        try {
          const options = await fetch(value);
          if (requestId === remoteRequestId && Array.isArray(options)) {
            remoteOptions.value = options;

          }
        } catch {
          if (requestId === remoteRequestId) remoteOptions.value = [];
        }
      };
      if (props.debounce > 0) remoteTimer = setTimeout(run, props.debounce);
      else void run();
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (isDisabled() || event.isComposing) return;
      if (event.key === 'Escape') return setOpen(false);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const wasOpen = open.value;
        setOpen(true);
        if (!wasOpen) {
          highlightedIndex.value = filteredRecords.value.findIndex((item) => !item.disabled);
          return;
        }
        const step = event.key === 'ArrowDown' ? 1 : -1;
        let index = highlightedIndex.value + step;
        const length = filteredRecords.value.length;
        for (let count = 0; count < length; count++, index = (index + step + length) % length) {
          if (!filteredRecords.value[index]?.disabled) {
            highlightedIndex.value = index;
            break;
          }
        }
      } else if (event.key === 'Enter') {
        const record = filteredRecords.value[highlightedIndex.value];
        if (record && (props.defaultFirstOption || open.value)) {
          choose(record);
        }
        else if (props.allowCreate && query.value && !filteredRecords.value.length) {
          if (props.multiple && props.multipleLimit > 0 && selectedValues.value.length >= props.multipleLimit) return;
          const created = { value: query.value, label: query.value, disabled: false };
          createdOptions.value.push(created);
          update(props.multiple ? [...selectedValues.value, created.value] : created.value);
          clearQuery();
        }
      } else if (event.key === 'Backspace' && props.multiple && !query.value) {
        const last = selectedValues.value.at(-1);
        if (last !== undefined) removeTag(last);
      }
    };
    const nativeValueOf = (value: unknown) => {
      const key = keyOf(value);
      const collisions = formRecords.value.filter((item) => String(keyOf(item.value)) === String(key));
      return collisions.length > 1 ? `${typeof key === 'number' ? 'n' : typeof key === 'boolean' ? 'b' : 's'}:${String(key)}` : String(key);
    };
    const nativeValue = (record: OptionRecord) => nativeValueOf(record.value);
    const resolveNativeValue = (value: string) => {
      const record = formRecords.value.find((item) => nativeValue(item) === value);
      return record?.value ?? value;
    };
    watch(query, () => {
      highlightedIndex.value = filteredRecords.value.findIndex((item) => !item.disabled);
    });
    watch(highlightedIndex, () => {
      nextTick(() => {
        dropdown.value?.querySelector('.i-select__option.is-highlighted')?.scrollIntoView?.({ block: 'nearest' });
      });
    });
    const selectedLabel = computed(() => {
      const labels = selectedValues.value.map((value) => selectedRecords.value.find((item) => sameValue(item.value, value))?.label ?? String(keyOf(value) ?? ''));
      return props.multiple ? labels : labels[0] ?? '';
    });
    expose({
      selectedLabel,
      focus: () => {
        const target = input.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
        target?.focus();
        return target;
      },
      togglePopperVisible: (visible?: boolean) => setOpen(visible ?? !open.value),
      blur: () => {
        const target = input.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
        target?.blur();
        return target;
      }
    });

    return () => {
      selectedCache = selectedRecords.value;
      const visibleRecords = props.virtualized
        ? filteredRecords.value.slice(virtualOffset.value, virtualOffset.value + Math.ceil(props.height / props.itemHeight) + 4)
        : filteredRecords.value;
      const displayRecords = props.collapseTags ? selectedRecords.value.slice(0, props.maxCollapseTags) : selectedRecords.value;
      const comboboxValue = props.filterable || props.remote ? query.value : selectedRecords.value[0]?.label ?? placeholder.value;
      const nativeOptionOf = (item: OptionRecord) =>
        h('option', { value: nativeValue(item), disabled: item.disabled, key: `opt-${String(keyOf(item.value))}` }, item.label);
      const nativeOptions = groupBy(formRecords.value).map((group) =>
        group.label === undefined
          ? group.items.map(nativeOptionOf)
          : h('optgroup', { label: group.label, key: `group-${group.label}` }, group.items.map(nativeOptionOf))
      );
      const renderOption = (item: OptionRecord, index: number) => {
        const isSelected = selectedValues.value.some((value) => sameValue(value, item.value));
        return (
          <div
            role='option'
            data-value={String(keyOf(item.value))}
            aria-selected={isSelected}
            aria-disabled={item.disabled || undefined}
            id={`i-select-option-${index + virtualOffset.value}`}
            class={[
              'i-select__option',
              {
                'is-selected': isSelected,
                'is-highlighted': index + virtualOffset.value === highlightedIndex.value,
                'is-disabled': item.disabled
              }
            ]}
            onClick={() => choose(item)}>
            {item.label}
          </div>
        );
      };
      return (
        <span ref={root} class={['i-select', `i-control--${props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size}`, { 'is-disabled': isDisabled(), 'is-open': open.value }]}>
          {slots.control ? slots.control({ open: open.value, toggle: () => setOpen(!open.value) }) : <div
            {...attrs}
            id={(attrs.id as string) || field?.id}
            role='combobox'
            tabindex={isDisabled() ? -1 : 0}
            aria-expanded={open.value}
            aria-haspopup='listbox'
            aria-disabled={isDisabled() || undefined}
            aria-activedescendant={highlightedIndex.value >= 0 ? `i-select-option-${highlightedIndex.value}` : undefined}
            onClick={() => setOpen(!open.value)}
            onFocus={(event: FocusEvent) => {
              emit('focus', event);
              if (props.automaticDropdown && !props.filterable && !props.remote) setOpen(true);
            }}
            onBlur={(event: FocusEvent) => emit('blur', event)}
            onKeydown={onKeydown}>
            {slots.prefix?.()}
            {loading.value && <span class='i-select__loading'>{loadingText.value}</span>}
            {props.multiple ? displayRecords.map((item) => (
              <span class={['i-select__tag', props.tagType && `i-select__tag--${props.tagType}`, `i-select__tag--${props.tagEffect}`]} key={String(keyOf(item.value))}>
                {slots.tag ? slots.tag({ data: item }) : item.label}
                <button type='button' aria-label={`移除 ${item.label}`} onClick={(event) => { event.stopPropagation(); removeTag(item.value); }}>×</button>
              </span>
            )) : !props.filterable && !props.remote && comboboxValue}
            {props.multiple && props.collapseTags && selectedRecords.value.length > displayRecords.length && <span
              class={['i-select__more', 'i-select__tag', props.tagType && `i-select__tag--${props.tagType}`, `i-select__tag--${props.tagEffect}`]}
              title={props.collapseTagsTooltip ? selectedRecords.value.map((item) => item.label).join('、') : undefined}>
              +{selectedRecords.value.length - displayRecords.length}
            </span>}
            {(props.filterable || props.remote) && <input ref={input} value={query.value} autocomplete={props.autocomplete} aria-label='筛选选项' disabled={isDisabled()} placeholder={!props.multiple && selectedRecords.value[0] ? selectedRecords.value[0].label : selectedRecords.value.length ? '' : placeholder.value} onClick={(event: MouseEvent) => { event.stopPropagation(); setOpen(true); }} onInput={(event: Event) => {
              if (!isDisabled() && !(event as InputEvent).isComposing) loadRemote((event.target as HTMLInputElement).value);
            }} onCompositionend={(event: CompositionEvent) => { if (!isDisabled()) loadRemote((event.target as HTMLInputElement).value); }} onFocus={() => setOpen(true)} />}
            {props.clearable && selectedValues.value.length > 0 && <button type='button' aria-label='清空' onClick={(event) => { event.stopPropagation(); clear(); }}><Icon icon={props.clearIcon} aria-hidden='true' /></button>}
            {slots.suffix?.() ?? ((!props.remote || !props.filterable || props.remoteShowSuffix) && (props.suffixIcon ? <Icon icon={props.suffixIcon} aria-hidden='true' /> : <span class='i-select__suffix-caret' aria-hidden='true' />))}
          </div>}
          <select
            ref={select}
            class='i-select__native'
            name={props.name}
            value={
              props.multiple
                ? selectedValues.value.map(nativeValueOf)
                : selectedValues.value.length
                  ? nativeValueOf(selectedValues.value[0])
                  : ''
            }
            multiple={props.multiple}
            disabled={isDisabled()}
            onFocus={(event: FocusEvent) => emit('focus', event)}
            onBlur={(event: FocusEvent) => { emit('blur', event); setOpen(false); }}
            onChange={(event: Event) => {
              if (isDisabled()) return;
              const values = [...(event.target as HTMLSelectElement).selectedOptions].map((option) => resolveNativeValue(option.value));
              const nextValue = props.multiple
                ? (props.multipleLimit > 0 ? values.slice(0, props.multipleLimit) : values)
                : values[0];
              update(nextValue);
              clearQuery();
            }}>{nativeOptions}</select>
          {(() => {
            const kept = props.persistent && (shown.value || slots.dropdown) && !open.value;
            if (!open.value && !kept) return null;
            const panel = (
              <div
                ref={dropdown}
                class={['i-select__dropdown', `i-select__dropdown--${props.effect}`, props.popperClass]}
                role='listbox'
                aria-hidden={kept ? 'true' : undefined}
                data-placement={position.placement.value}
                style={[position.style.value, dropdownMinWidth.value ? { minWidth: dropdownMinWidth.value } : undefined, props.popperStyle, kept ? { display: 'none' } : undefined]}
                onScroll={onPopupScroll}
                onMousedown={(event) => event.stopPropagation()}>
                {slots.header?.()}
                {slots.dropdown ? slots.dropdown() : <>
                {loading.value && <div class='i-select__empty'>{slots.empty ? slots.empty() : loadingText.value}</div>}
                {!loading.value && !visibleRecords.length && <div class='i-select__empty'>{slots.empty ? slots.empty() : (query.value ? noMatchText.value : noDataText.value)}</div>}
                {!loading.value && props.virtualized && visibleRecords.map((item, index) => renderOption(item, index))}
                {!loading.value && !props.virtualized && groupBy(filteredRecords.value).map((group) => [
                  group.label !== undefined && <div class='i-select__group' role='presentation'>{group.label}</div>,
                  group.items.map((item) => renderOption(item, filteredRecords.value.indexOf(item)))
                ])}
                </>}
                {slots.footer?.()}
              </div>
            );
            return props.teleported ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
          })()}
        </span>
      );
    };
  }
});
