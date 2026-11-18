import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  computed,
  watch,
  type PropType,
  type VNode
} from 'vue';
import { useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';

export interface SelectRemoteOption {
  value: string | number;
  label?: string;
  disabled?: boolean;
}

type SelectValue = unknown | unknown[];
type OptionRecord = {
  value: unknown;
  label: string;
  disabled: boolean;
  group?: string;
  vnode?: VNode;
};
type FilterMethod = (query: string, option: Pick<OptionRecord, 'value' | 'label' | 'disabled'>) => boolean;
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
    modelValue: [String, Number, Array, Object] as PropType<SelectValue>,
    valueKey: { type: String, default: 'value' },
    clearable: Boolean,
    disabled: Boolean,
    placeholder: { type: String, default: '请选择' },
    size: String as PropType<Size>,
    multiple: Boolean,
    multipleLimit: { type: Number, default: 0 },
    collapseTags: Boolean,
    collapseTagsTooltip: Boolean,
    maxCollapseTags: { type: Number, default: 1 },
    tagType: String as PropType<SelectTagType>,
    name: String,
    filterable: Boolean,
    filterMethod: Function as PropType<FilterMethod>,
    allowCreate: Boolean,
    defaultFirstOption: Boolean,
    reserveKeyword: { type: Boolean, default: true },
    automaticDropdown: Boolean,
    fitInputWidth: Boolean,
    noDataText: { type: String, default: '暂无数据' },
    noMatchText: { type: String, default: '无匹配数据' },
    loadingText: { type: String, default: '加载中…' },
    remote: Boolean,
    remoteMethod: Function as PropType<(query: string) => SelectRemoteOption[] | Promise<SelectRemoteOption[]>>,
    loading: Boolean,
    remoteLoading: Boolean,
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: [String, Number, Array, Object] as PropType<unknown>,
    validateEvent: { type: Boolean, default: true },
    virtualized: Boolean,
    itemHeight: { type: Number, default: 34 },
    height: { type: Number, default: 240 }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'clear', 'visible-change', 'remove-tag'],
  setup(props, { slots, attrs, emit, expose }) {
    const field = useField();
    const config = useConfig();
    const root = ref<HTMLElement>();
    const select = ref<HTMLSelectElement>();
    const input = ref<HTMLInputElement>();
    const query = ref('');
    const open = ref(false);
    const highlightedIndex = ref(-1);
    const remoteOptions = ref<SelectRemoteOption[]>([]);
    const remoteOptionCache = ref<SelectRemoteOption[]>([]);
    const createdOptions = ref<SelectRemoteOption[]>([]);
    const virtualOffset = ref(0);
    const dropdownMinWidth = ref<string>();
    let remoteRequestId = 0;

    const isDisabled = () => props.disabled || field?.disabled?.();
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
            isGroup(item)
              ? flatten(
                  ((item.children as SlotContent | undefined)?.default?.() ?? []) as VNode[],
                  (item.props?.label as string | undefined) ?? undefined,
                  groupDisabled || Boolean(item.props?.disabled)
                )
              : [{ vnode: item, group, groupDisabled }]
          );
      return flatten((slots.default?.() ?? []) as VNode[]);
    };
    const optionRecords = computed<OptionRecord[]>(() => {
      const local: OptionRecord[] = slotOptions().map(({ vnode: item, group, groupDisabled }) => ({
        value: item.props?.value,
        label:
          (item.props?.label as string | undefined) ??
          (getVNodeText(item.children) || String(keyOf(item.props?.value) ?? '')),
        disabled: Boolean(item.props?.disabled) || Boolean(groupDisabled),
        group,
        vnode: item
      }));
      const remoteItems = [...remoteOptions.value, ...remoteOptionCache.value.filter((item) => selectedValues.value.some((value) => sameValue(value, item.value))), ...createdOptions.value];
      const remote: OptionRecord[] = remoteItems.filter((item, index, items) => items.findIndex((candidate) => sameValue(candidate.value, item.value)) === index).map((item) => ({
        value: item.value,
        label: item.label ?? String(item.value),
        disabled: Boolean(item.disabled)
      }));
      return props.remote ? remote : [...local, ...createdOptions.value.map((item) => ({ value: item.value, label: item.label ?? String(item.value), disabled: Boolean(item.disabled) }))];
    });
    const selectedValues = computed<Array<unknown>>(() => {
      if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue.flat() : [];
      return props.modelValue === undefined || Array.isArray(props.modelValue) ? [] : [props.modelValue];
    });
    const selectedRecords = computed(() => optionRecords.value.filter((item) => selectedValues.value.some((value) => sameValue(value, item.value))));
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
    const filteredRecords = computed(() => {
      if (props.remote || !props.filterable || !query.value) return optionRecords.value;
      return optionRecords.value.filter((item) =>
        props.filterMethod ? props.filterMethod(query.value, { value: item.value, label: item.label, disabled: item.disabled }) : item.label.includes(query.value)
      );
    });
    const loading = computed(() => props.loading || props.remoteLoading);

    const setOpen = (value: boolean) => {
      if (isDisabled() || open.value === value) return;
      open.value = value;
      emit('visible-change', value);
      if (value) {
        highlightedIndex.value = Math.max(0, filteredRecords.value.findIndex((item) => !item.disabled));
        nextTick(() => {
          if (props.fitInputWidth && root.value) {
            dropdownMinWidth.value = `${root.value.getBoundingClientRect().width}px`;
          }
          input.value?.focus();
        });
      }
    };
    const update = (value: SelectValue) => {
      const isEmptyCleared =
        !props.multiple && (props.emptyValues ?? []).some((item) => item === value);
      const next = isEmptyCleared ? props.valueOnClear : value;
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
      update(props.multiple ? [] : props.valueOnClear);
      emit('clear');
      const target = input.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
      target?.focus();
    };
    const removeTag = (value: unknown) => {
      if (!props.multiple || isDisabled()) return;
      update(selectedValues.value.filter((item) => !sameValue(item, value)));
      emit('remove-tag', value);
    };
    const loadRemote = async (value: string) => {
      query.value = value;
      virtualOffset.value = 0;
      setOpen(true);
      if (props.remote && props.remoteMethod) {
        const requestId = ++remoteRequestId;
        try {
          const options = await props.remoteMethod(value);
          if (requestId === remoteRequestId) {
            remoteOptions.value = options;
            remoteOptionCache.value = [...remoteOptionCache.value, ...options];
          }
        } catch {
          if (requestId === remoteRequestId) remoteOptions.value = [];
        }
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
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
      const collisions = optionRecords.value.filter((item) => String(keyOf(item.value)) === String(key));
      return collisions.length > 1 ? `${typeof key === 'number' ? 'n' : 's'}:${String(key)}` : String(key);
    };
    const nativeValue = (record: OptionRecord) => nativeValueOf(record.value);
    const resolveNativeValue = (value: string) => {
      const record = optionRecords.value.find((item) => nativeValue(item) === value);
      return record?.value ?? value;
    };
    const onOutside = (event: MouseEvent) => {
      if (root.value && !root.value.contains(event.target as Node)) setOpen(false);
    };
    watch(query, () => {
      highlightedIndex.value = filteredRecords.value.findIndex((item) => !item.disabled);
    });
    onMounted(() => document.addEventListener('mousedown', onOutside));
    onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
    expose({
      focus: () => {
        const target = input.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
        target?.focus();
        return target;
      },
      blur: () => {
        const target = input.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
        target?.blur();
        return target;
      }
    });

    return () => {
      const visibleRecords = props.virtualized
        ? filteredRecords.value.slice(virtualOffset.value, virtualOffset.value + Math.ceil(props.height / props.itemHeight) + 4)
        : filteredRecords.value;
      const displayRecords = props.collapseTags ? selectedRecords.value.slice(0, props.maxCollapseTags) : selectedRecords.value;
      const comboboxValue = props.filterable || props.remote ? query.value : selectedRecords.value[0]?.label ?? props.placeholder;
      const nativeOptionOf = (item: OptionRecord) =>
        h('option', { value: nativeValue(item), disabled: item.disabled, key: `opt-${String(keyOf(item.value))}` }, item.label);
      const nativeOptions = groupBy(optionRecords.value).map((group) =>
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
        <span ref={root} class={['i-select', `i-control--${props.size || config.value.size}`, { 'is-disabled': isDisabled(), 'is-open': open.value }]}>
          <div
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
            {loading.value && <span class='i-select__loading'>{props.loadingText}</span>}
            {props.multiple ? displayRecords.map((item) => (
              <span class={['i-select__tag', props.tagType && `i-select__tag--${props.tagType}`]} key={String(keyOf(item.value))}>
                {slots.tag ? slots.tag({ data: item }) : item.label}
                <button type='button' aria-label={`移除 ${item.label}`} onClick={(event) => { event.stopPropagation(); removeTag(item.value); }}>×</button>
              </span>
            )) : !props.filterable && !props.remote && comboboxValue}
            {props.multiple && props.collapseTags && selectedRecords.value.length > displayRecords.length && <span
              class='i-select__more'
              title={props.collapseTagsTooltip ? selectedRecords.value.map((item) => item.label).join('、') : undefined}>
              +{selectedRecords.value.length - displayRecords.length}
            </span>}
            {(props.filterable || props.remote) && <input ref={input} value={query.value} aria-label='筛选选项' placeholder={selectedRecords.value.length ? '' : props.placeholder} onInput={(event: Event) => loadRemote((event.target as HTMLInputElement).value)} onFocus={() => setOpen(true)} />}
            {props.clearable && selectedValues.value.length > 0 && <button type='button' aria-label='清空' onClick={(event) => { event.stopPropagation(); clear(); }}>×</button>}
            {slots.suffix?.()}
          </div>
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
              const values = [...(event.target as HTMLSelectElement).selectedOptions].map((option) => resolveNativeValue(option.value));
              const nextValue = props.multiple
                ? (props.multipleLimit > 0 ? values.slice(0, props.multipleLimit) : values)
                : values[0];
              update(nextValue);
              clearQuery();
            }}>{nativeOptions}</select>
          {open.value && <div class='i-select__dropdown' role='listbox' style={{ minWidth: dropdownMinWidth.value }} onScroll={(event: Event) => {
            if (props.virtualized) virtualOffset.value = Math.floor((event.target as HTMLElement).scrollTop / props.itemHeight);
          }} onMousedown={(event) => event.stopPropagation()}>
            {slots.header?.()}
            {loading.value && <div class='i-select__empty'>{slots.empty ? slots.empty() : props.loadingText}</div>}
            {!loading.value && !visibleRecords.length && <div class='i-select__empty'>{slots.empty ? slots.empty() : (query.value ? props.noMatchText : props.noDataText)}</div>}
            {!loading.value && props.virtualized && visibleRecords.map((item, index) => renderOption(item, index))}
            {!loading.value && !props.virtualized && groupBy(filteredRecords.value).map((group) => [
              group.label !== undefined && <div class='i-select__group' role='presentation'>{group.label}</div>,
              group.items.map((item) => renderOption(item, filteredRecords.value.indexOf(item)))
            ])}
            {slots.footer?.()}
          </div>}
        </span>
      );
    };
  }
});
