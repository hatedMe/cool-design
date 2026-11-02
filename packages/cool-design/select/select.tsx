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

type SelectValue = string | number | Array<string | number> | undefined;
type OptionRecord = { value: string | number; label: string; disabled: boolean; vnode?: VNode };
type FilterMethod = (query: string, option: Pick<OptionRecord, 'value' | 'label' | 'disabled'>) => boolean;
type SlotContent = { default?: () => unknown };

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
    modelValue: [String, Number, Array] as PropType<SelectValue>,
    clearable: Boolean,
    disabled: Boolean,
    placeholder: { type: String, default: '请选择' },
    size: String as PropType<Size>,
    multiple: Boolean,
    multipleLimit: { type: Number, default: 0 },
    collapseTags: Boolean,
    collapseTagsTooltip: Boolean,
    maxCollapseTags: { type: Number, default: 1 },
    name: String,
    filterable: Boolean,
    filterMethod: Function as PropType<FilterMethod>,
    allowCreate: Boolean,
    defaultFirstOption: Boolean,
    reserveKeyword: { type: Boolean, default: true },
    noDataText: { type: String, default: '暂无数据' },
    noMatchText: { type: String, default: '无匹配数据' },
    remote: Boolean,
    remoteMethod: Function as PropType<(query: string) => SelectRemoteOption[] | Promise<SelectRemoteOption[]>>,
    loading: Boolean,
    remoteLoading: Boolean,
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
    let remoteRequestId = 0;

    const isDisabled = () => props.disabled || field?.disabled?.();
    const slotOptions = () => (slots.default?.() ?? []).filter((item) => item.type !== Comment);
    const sameValue = (left: string | number, right: string | number) => left === right;
    const optionRecords = computed<OptionRecord[]>(() => {
      const local: OptionRecord[] = slotOptions().map((item) => ({
        value: item.props?.value as string | number,
        label: (item.props?.label as string | undefined) ?? (getVNodeText(item.children) || String(item.props?.value ?? '')),
        disabled: Boolean(item.props?.disabled),
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
    const selectedValues = computed<Array<string | number>>(() => {
      if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue.flat() : [];
      return props.modelValue === undefined || Array.isArray(props.modelValue) ? [] : [props.modelValue];
    });
    const selectedRecords = computed(() => optionRecords.value.filter((item) => selectedValues.value.some((value) => sameValue(value, item.value))));
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
        nextTick(() => input.value?.focus());
      }
    };
    const update = (value: SelectValue) => {
      emit('update:modelValue', value);
      emit('change', value);
      nextTick(() => field?.validate('change'));
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
      update(props.multiple ? [] : undefined);
      emit('clear');
      const target = input.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
      target?.focus();
    };
    const removeTag = (value: string | number) => {
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
    const nativeValue = (record: OptionRecord) => {
      const collisions = optionRecords.value.filter((item) => String(item.value) === String(record.value));
      return collisions.length > 1 ? `${typeof record.value === 'number' ? 'n' : 's'}:${record.value}` : String(record.value);
    };
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
      const nativeOptions = optionRecords.value.map((item) => h('option', { value: nativeValue(item), disabled: item.disabled, key: `${typeof item.value}:${String(item.value)}` }, item.label));
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
            onFocus={(event: FocusEvent) => emit('focus', event)}
            onBlur={(event: FocusEvent) => emit('blur', event)}
            onKeydown={onKeydown}>
            {slots.prefix?.()}
            {loading.value && <span class='i-select__loading'>加载中…</span>}
            {props.multiple ? displayRecords.map((item) => (
              <span class='i-select__tag' key={String(item.value)}>
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
            value={props.multiple ? selectedValues.value : selectedValues.value[0] ?? ''}
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
          {open.value && <div class='i-select__dropdown' role='listbox' onScroll={(event: Event) => {
            if (props.virtualized) virtualOffset.value = Math.floor((event.target as HTMLElement).scrollTop / props.itemHeight);
          }} onMousedown={(event) => event.stopPropagation()}>
            {slots.header?.()}
            {loading.value && <div class='i-select__empty'>{slots.empty ? slots.empty() : '加载中…'}</div>}
            {!loading.value && !visibleRecords.length && <div class='i-select__empty'>{slots.empty ? slots.empty() : (query.value ? props.noMatchText : props.noDataText)}</div>}
            {!loading.value && visibleRecords.map((item, index) => <div
              role='option'
              data-value={String(item.value)}
              aria-selected={selectedValues.value.some((value) => sameValue(value, item.value))}
              aria-disabled={item.disabled || undefined}
              id={`i-select-option-${index + virtualOffset.value}`}
              class={['i-select__option', { 'is-selected': selectedValues.value.some((value) => sameValue(value, item.value)), 'is-highlighted': index + virtualOffset.value === highlightedIndex.value, 'is-disabled': item.disabled }]}
              onClick={() => choose(item)}>
              {item.label}
            </div>)}
            {slots.footer?.()}
          </div>}
        </span>
      );
    };
  }
});
