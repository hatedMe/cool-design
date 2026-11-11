import { computed, defineComponent, ref, watch, type PropType } from 'vue';
import type {
  TransferDirection,
  TransferFilterMethod,
  TransferFormat,
  TransferItem,
  TransferKey,
  TransferPropsMap,
  TransferRenderContent,
  TransferTargetOrder
} from './types';

export type {
  TransferDirection,
  TransferFilterMethod,
  TransferFormat,
  TransferItem,
  TransferKey,
  TransferProps,
  TransferPropsMap,
  TransferRenderContent,
  TransferTargetOrder
} from './types';

const DEFAULT_TITLES = ['列表 1', '列表 2'];

const keyOf = (item: TransferItem, map: TransferPropsMap) => item[map.key || 'key'] as TransferKey;
const labelOf = (item: TransferItem, map: TransferPropsMap) => String(item[map.label || 'label'] ?? item[map.key || 'key'] ?? '');
const disabledOf = (item: TransferItem, map: TransferPropsMap) => Boolean(item[map.disabled || 'disabled']);

export default defineComponent({
  name: 'i-transfer',
  props: {
    modelValue: { type: Array as PropType<TransferKey[]>, default: () => [] },
    data: { type: Array as PropType<TransferItem[]>, default: () => [] },
    titles: { type: Array as PropType<string[]>, default: () => [...DEFAULT_TITLES] },
    buttonTexts: { type: Array as PropType<string[]>, default: () => [] },
    filterable: Boolean,
    filterPlaceholder: { type: String, default: '请输入搜索内容' },
    filterMethod: Function as PropType<TransferFilterMethod>,
    targetOrder: { type: String as PropType<TransferTargetOrder>, default: 'original' },
    format: Object as PropType<TransferFormat>,
    props: { type: Object as PropType<TransferPropsMap>, default: () => ({}) },
    leftDefaultChecked: { type: Array as PropType<TransferKey[]>, default: () => [] },
    rightDefaultChecked: { type: Array as PropType<TransferKey[]>, default: () => [] },
    disabled: Boolean,
    noDataText: { type: String, default: '无数据' },
    noMatchText: { type: String, default: '无匹配数据' },
    renderContent: Function as PropType<TransferRenderContent>
  },
  emits: ['update:modelValue', 'change', 'left-check-change', 'right-check-change'],
  setup(props, { emit, slots, expose }) {
    const query = ref<[string, string]>(['', '']);
    const map = computed(() => props.props || {});
    const all = computed(() => props.data.filter((item) => keyOf(item, map.value) !== undefined));
    const keyItem = computed(() => {
      const entries = new Map<TransferKey, TransferItem>();
      all.value.forEach((item) => {
        const key = keyOf(item, map.value);
        if (!entries.has(key)) entries.set(key, item);
      });
      return entries;
    });
    const selected = computed(() => new Set(props.modelValue));
    const left = computed(() => all.value.filter((item) => !selected.value.has(keyOf(item, map.value))));
    const right = computed(() => {
      if (props.targetOrder === 'original') return all.value.filter((item) => selected.value.has(keyOf(item, map.value)));
      const seen = new Set<TransferKey>();
      const ordered: TransferItem[] = [];
      props.modelValue.forEach((key) => {
        if (seen.has(key)) return;
        seen.add(key);
        const item = keyItem.value.get(key);
        if (item) ordered.push(item);
      });
      return ordered;
    });
    const sideKeys = (side: number) => new Set((side ? right.value : left.value).map((item) => keyOf(item, map.value)));
    const checked = ref<[Set<TransferKey>, Set<TransferKey>]>([
      new Set(props.leftDefaultChecked.filter((key) => sideKeys(0).has(key))),
      new Set(props.rightDefaultChecked.filter((key) => sideKeys(1).has(key)))
    ]);
    const pruneChecked = () => {
      checked.value.forEach((set, side) => {
        const valid = sideKeys(side);
        [...set].forEach((key) => {
          if (!valid.has(key)) set.delete(key);
        });
      });
    };
    watch(() => [props.modelValue, props.data, props.props], pruneChecked, { deep: true });

    const titleOf = (side: number) => props.titles[side] ?? DEFAULT_TITLES[side] ?? '';
    const visible = (items: TransferItem[], side: number) => {
      const raw = query.value[side];
      if (!raw.trim()) return items;
      if (props.filterMethod) return items.filter((item) => props.filterMethod!(raw, item));
      const lower = raw.trim().toLowerCase();
      return items.filter((item) => labelOf(item, map.value).toLowerCase().includes(lower));
    };
    const selectable = (items: TransferItem[]) => items.filter((item) => !props.disabled && !disabledOf(item, map.value));
    const emitChecked = (side: number) => emit(side ? 'right-check-change' : 'left-check-change', [...checked.value[side]]);

    const toggle = (side: number, key: TransferKey, itemDisabled: boolean) => {
      if (props.disabled || itemDisabled) return;
      const set = checked.value[side];
      if (set.has(key)) set.delete(key);
      else set.add(key);
      emitChecked(side);
    };
    const toggleAll = (side: number, items: TransferItem[]) => {
      if (props.disabled) return;
      const keys = selectable(visible(items, side)).map((item) => keyOf(item, map.value));
      if (!keys.length) return;
      const set = checked.value[side];
      const shouldCheck = keys.some((key) => !set.has(key));
      keys.forEach((key) => {
        if (shouldCheck) set.add(key);
        else set.delete(key);
      });
      emitChecked(side);
    };

    const moveKeys = (side: number) => {
      const set = checked.value[side];
      const onSide = sideKeys(side);
      return all.value
        .filter((item) => {
          const key = keyOf(item, map.value);
          return set.has(key) && onSide.has(key) && !disabledOf(item, map.value);
        })
        .map((item) => keyOf(item, map.value));
    };
    const canMove = (side: number) => !props.disabled && moveKeys(side).length > 0;
    const move = (toRight: boolean) => {
      const side = toRight ? 0 : 1;
      const moved = moveKeys(side);
      if (!moved.length) return;
      const direction: TransferDirection = toRight ? 'right' : 'left';
      const current = [...props.modelValue];
      let next: TransferKey[];
      if (!toRight) {
        const movedSet = new Set(moved);
        next = current.filter((key) => !movedSet.has(key));
      } else if (props.targetOrder === 'push') {
        const currentSet = new Set(current);
        next = [...current, ...moved.filter((key) => !currentSet.has(key))];
      } else if (props.targetOrder === 'unshift') {
        const currentSet = new Set(current);
        next = [...moved.filter((key) => !currentSet.has(key)), ...current];
      } else {
        const wanted = new Set([...current, ...moved]);
        const ordered = all.value.map((item) => keyOf(item, map.value)).filter((key) => wanted.has(key));
        const validKeys = new Set(ordered);
        next = [...ordered, ...current.filter((key) => !validKeys.has(key))];
      }
      next = [...new Set(next)];
      checked.value[side].clear();
      emit('update:modelValue', next);
      emit('change', next, direction, moved);
      emitChecked(side);
    };

    const clearQuery = (which?: 'left' | 'right' | 0 | 1) => {
      if (which === undefined) query.value = ['', ''];
      else if (which === 'left' || which === 0) query.value[0] = '';
      else query.value[1] = '';
    };
    expose({ clearQuery });

    const formatCount = (count: number, total: number) => {
      const template = count > 0 ? props.format?.hasChecked ?? '${checked}/${total}' : props.format?.noChecked ?? '${total}';
      return template.replace(/\$\{checked\}|\{checked\}/g, String(count)).replace(/\$\{total\}|\{total\}/g, String(total));
    };

    const panel = (items: TransferItem[], side: number) => {
      const shown = visible(items, side);
      const available = selectable(shown);
      const availableKeys = available.map((item) => keyOf(item, map.value));
      const count = availableKeys.filter((key) => checked.value[side].has(key)).length;
      const allChecked = available.length > 0 && count === available.length;
      const halfChecked = count > 0 && count < available.length;
      const syncIndeterminate = (el: unknown) => {
        const input = el as HTMLInputElement | null;
        if (input) input.indeterminate = halfChecked;
      };
      const footerSlot = side ? slots['right-footer'] : slots['left-footer'];
      const emptySlot = side ? slots['right-empty'] : slots['left-empty'];
      return (
        <section class="i-transfer__panel" aria-label={titleOf(side)}>
          <header class="i-transfer__header">
            <input
              class="i-transfer__select-all"
              type="checkbox"
              aria-label="全选"
              disabled={props.disabled || available.length === 0}
              checked={allChecked}
              ref={syncIndeterminate}
              onChange={() => toggleAll(side, items)}
            />
            <span class="i-transfer__title">{titleOf(side)}</span>
            <span class="i-transfer__count">{formatCount(count, items.length)}</span>
          </header>
          {props.filterable && (
            <input
              class="i-transfer__filter"
              type="text"
              value={query.value[side]}
              placeholder={props.filterPlaceholder}
              aria-label={props.filterPlaceholder}
              disabled={props.disabled}
              onInput={(e: Event) => (query.value[side] = (e.target as HTMLInputElement).value)}
            />
          )}
          <div class="i-transfer__items" role="listbox" aria-multiselectable="true" aria-label={titleOf(side)}>
            {shown.length === 0
              ? emptySlot?.() ?? <span class="i-transfer__empty">{query.value[side] ? props.noMatchText : props.noDataText}</span>
              : shown.map((item) => {
                  const key = keyOf(item, map.value);
                  const itemDisabled = props.disabled || disabledOf(item, map.value);
                  const isChecked = checked.value[side].has(key);
                  return (
                    <label
                      class={['i-transfer__item', itemDisabled && 'is-disabled']}
                      key={String(key)}
                      role="option"
                      aria-selected={isChecked ? 'true' : 'false'}
                      aria-disabled={itemDisabled ? 'true' : undefined}
                    >
                      <input type="checkbox" checked={isChecked} disabled={itemDisabled} onChange={() => toggle(side, key, itemDisabled)} />
                      {props.renderContent ? props.renderContent(item) : slots.default?.({ option: item }) ?? slots.item?.({ option: item }) ?? labelOf(item, map.value)}
                    </label>
                  );
                })}
          </div>
          {footerSlot ? <footer class="i-transfer__footer">{footerSlot()}</footer> : null}
        </section>
      );
    };

    return () => {
      const toLeftText = props.buttonTexts[0] ?? '';
      const toRightText = props.buttonTexts[1] ?? '';
      return (
        <div class={['i-transfer', props.disabled && 'is-disabled']} aria-disabled={props.disabled ? 'true' : undefined}>
          {panel(left.value, 0)}
          <div class="i-transfer__buttons">
            <button
              type="button"
              class="i-transfer__button i-transfer__button--right"
              aria-label={toRightText || '移到右侧'}
              disabled={!canMove(0)}
              onClick={() => move(true)}
            >
              <span aria-hidden="true">→</span>
              {toRightText ? ` ${toRightText}` : null}
            </button>
            <button
              type="button"
              class="i-transfer__button i-transfer__button--left"
              aria-label={toLeftText || '移到左侧'}
              disabled={!canMove(1)}
              onClick={() => move(false)}
            >
              <span aria-hidden="true">←</span>
              {toLeftText ? ` ${toLeftText}` : null}
            </button>
          </div>
          {panel(right.value, 1)}
        </div>
      );
    };
  }
});
