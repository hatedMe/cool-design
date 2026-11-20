import { computed, defineComponent, inject, nextTick, onBeforeUnmount, ref, watch, type PropType } from 'vue';
import type { CascaderLazyLoad, CascaderItemValue, CascaderModelValue, CascaderNode, CascaderNodeValue, CascaderOption, CascaderPropsMapping } from '../cascader/types';
import { embeddedCascaderPanelKey, useCascaderNodes } from '../cascader/node';

export default defineComponent({
  name: 'i-cascader-panel',
  props: {
    modelValue: [String, Number, Array] as PropType<CascaderModelValue>,
    embedded: Boolean,
    options: { type: Array as PropType<CascaderOption[]>, default: () => [] },
    props: Object as PropType<CascaderPropsMapping>,
    emitPath: { type: Boolean, default: undefined },
    multiple: { type: Boolean, default: undefined },
    virtualScroll: Boolean,
    itemSize: { type: Number, default: 34 },
    height: { type: Number, default: 204 },
    checkStrictly: { type: Boolean, default: undefined },
    border: { type: Boolean, default: true },
    lazy: { type: Boolean, default: undefined },
    lazyLoad: Function as PropType<CascaderLazyLoad>,
    expandTrigger: { type: String as PropType<'click' | 'hover'>, default: undefined }
  },
  emits: ['update:modelValue', 'change', 'expand-change'],
  setup(props, { emit, slots, expose }) {
    const expandTrigger = computed(() => props.expandTrigger ?? props.props?.expandTrigger ?? 'click');
    const lazy = computed(() => props.lazy ?? props.props?.lazy ?? false);
    const lazyLoad = computed(() => props.lazyLoad ?? props.props?.lazyLoad);
    const multiple = computed(() => props.multiple ?? props.props?.multiple ?? false);
    const checkStrictly = computed(() => props.checkStrictly ?? props.props?.checkStrictly ?? false);
    const emitPath = computed(() => props.emitPath ?? props.props?.emitPath ?? true);
    const embeddedContext = inject(embeddedCascaderPanelKey, undefined);
    const embedded = props.embedded ? embeddedContext : undefined;
    const activeValues = ref<CascaderNodeValue[]>([]);

    const nodes = embedded?.nodes ?? useCascaderNodes({
      options: () => props.options,
      mapping: () => props.props,
      model: () => props.modelValue ?? null,
      multiple: () => multiple.value,
      checkStrictly: () => checkStrictly.value,
      lazy: () => lazy.value,
      lazyLoad: () => lazyLoad.value,
      rootLevel: 0
    });

    const nodeValue = (node: CascaderNode): CascaderItemValue =>
      emitPath.value ? node.path.map((item) => item.value) : node.value;

    const columns = computed(() => embedded?.columns() ?? nodes.columns(activeValues.value));

    const expandTo = (node: CascaderNode) => {
      const values = nodes.activePathValues(node);
      if (values.join('\u0000') === activeValues.value.join('\u0000')) return;
      activeValues.value = values;
      emit('expand-change', [...activeValues.value]);
    };

    const expand = (node: CascaderNode) => {
      if (embedded) embedded.expand(node);
      else {
        nodes.ensureChildren(node);
        expandTo(node);
      }
    };
    const update = (value: CascaderModelValue) => {
      emit('update:modelValue', value);
      emit('change', value);
    };

    let hoverTimer: ReturnType<typeof setTimeout> | undefined;
    let hoverOrigin: { column: number; x: number; top: number; bottom: number } | undefined;
    const stopHover = () => {
      if (hoverTimer !== undefined) clearTimeout(hoverTimer);
      hoverTimer = undefined;
    };
    onBeforeUnmount(stopHover);
    const trackHover = (event: MouseEvent, node: CascaderNode, column: number) => {
      if (expandTrigger.value !== 'hover' || (embedded?.active() ?? activeValues.value)[column] !== node.value || node.leaf) return;
      const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
      hoverOrigin = { column, x: event.clientX, top: bounds.top, bottom: bounds.bottom };
      stopHover();
    };
    const hoverNode = (event: MouseEvent, node: CascaderNode, column: number) => {
      stopHover();
      if (nodes.isEffectivelyDisabled(node) || node.leaf) return;
      const adjacent = menuList.value[column + 1]?.getBoundingClientRect();
      if (hoverOrigin?.column === column && adjacent && adjacent.left > hoverOrigin.x) {
        const progress = (event.clientX - hoverOrigin.x) / (adjacent.left - hoverOrigin.x);
        const top = hoverOrigin.top + (adjacent.top - hoverOrigin.top) * progress;
        const bottom = hoverOrigin.bottom + (adjacent.bottom - hoverOrigin.bottom) * progress;
        if (progress > 0 && progress <= 1 && event.clientY >= top && event.clientY <= bottom) {
          hoverTimer = setTimeout(() => expand(node), props.props?.hoverThreshold ?? 500);
          return;
        }
      }
      hoverOrigin = undefined;
      expand(node);
    };

    const handleNodeClick = (node: CascaderNode) => {
      if (nodes.isEffectivelyDisabled(node)) return;
      const checkOnClick = (props.props?.checkOnClickNode ?? (props.checkStrictly === true && !multiple.value)) || (node.leaf && props.props?.checkOnClickLeaf !== false);
      if (multiple.value) {
        if (!node.leaf && nodes.ensureChildren(node)) { expand(node); return; }
        if (node.loading) return;
        if (checkOnClick) toggleCheck(node);
        if (!node.leaf) expand(node);
        return;
      }
      if ((!checkStrictly.value && node.leaf) || (checkStrictly.value && checkOnClick)) {
        if (embedded) embedded.select(node);
        else {
          update(nodeValue(node));
          activeValues.value = nodes.activePathValues(node);
        }
      } else if (!node.leaf) expand(node);
    };

    const toggleCheck = (node: CascaderNode) => {
      if (!multiple.value || nodes.isEffectivelyDisabled(node)) return;
      if (!node.leaf && nodes.ensureChildren(node)) { expand(node); return; }
      if (node.loading) return;
      if (embedded) { embedded.toggle(node); return; }
      const { checked, indeterminate } = nodes.checkState.value;
      const checking = !(checked.has(node) && !indeterminate.has(node));
      update(nodes.valueFromChecked(nodes.cascadeCheckedSet(checked, node, checking), nodeValue) as CascaderModelValue);
    };

    const checkedNodes = computed(() => multiple.value
      ? [...nodes.checkState.value.checked] : nodes.selectedNodes.value);
    if (!embedded) watch(nodes.selectedNodes, ([selected]) => {
      if (selected) activeValues.value = nodes.activePathValues(selected);
    }, { immediate: true });
    const getCheckedNodes = (leafOnly = false) =>
      checkedNodes.value.filter((node) => !leafOnly || node.leaf).map((node) => node.data);
    const clearCheckedNodes = () => embedded ? embedded.clear() : update(multiple.value ? [] : null);
    const rowHeight = computed(() => Math.max(1, props.itemSize));
    const windowHeight = computed(() => Math.max(rowHeight.value, props.height));
    const scrollOffsets = ref<number[]>([]);
    const menuList = ref<HTMLElement[]>([]);
    const focusedNode = ref<CascaderNode>();
    const showNode = (column: number, index: number) => {
      if (!props.virtualScroll || index < 0) return;
      const row = index * rowHeight.value;
      const current = scrollOffsets.value[column] ?? 0;
      const height = windowHeight.value;
      const top = row < current ? row : row + rowHeight.value > current + height ? row + rowHeight.value - height : current;
      scrollOffsets.value[column] = top;
      nextTick(() => { if (menuList.value[column]) menuList.value[column].scrollTop = top; });
    };
    const scrollToExpandingNode = () => {
      const selected = checkedNodes.value[0];
      columns.value.forEach((column, index) => {
        showNode(index, column.findIndex((node) => node === selected?.path[index]));
      });
    };
    watch(columns, (next, previous) => {
      next.forEach((column, index) => {
        if (column[0]?.parent === previous[index]?.[0]?.parent) return;
        scrollOffsets.value[index] = 0;
        if (menuList.value[index]) menuList.value[index].scrollTop = 0;
      });
    });
    watch([columns, checkedNodes, () => props.virtualScroll], scrollToExpandingNode, { immediate: true });
    const getFlattedNodes = (leafOnly = false): CascaderNode[] => {
      const all: CascaderNode[] = [];
      const visit = (list: CascaderNode[]) => list.forEach((node) => {
        if (!leafOnly || node.leaf) all.push(node);
        visit(node.children);
      });
      visit(nodes.trees.value);
      return all;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      const columnIndex = Math.max(0, columns.value.findIndex((column) => column.includes(focusedNode.value!)));
      const column = columns.value[columnIndex] ?? [];
      const from = column.findIndex((node) => node === focusedNode.value);
      const focusRow = (targetColumn: number, index: number) => {
        const node = columns.value[targetColumn]?.[index];
        if (!node) return;
        focusedNode.value = node;
        showNode(targetColumn, index);
        nextTick(() => menuList.value[targetColumn]?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus());
      };
      if (event.key === 'ArrowLeft' && columnIndex > 0) {
        event.preventDefault();
        const parent = focusedNode.value?.parent;
        focusRow(columnIndex - 1, columns.value[columnIndex - 1].findIndex((node) => node === parent));
      } else if (event.key === 'ArrowRight' && focusedNode.value && !focusedNode.value.leaf) {
        event.preventDefault();
        expand(focusedNode.value);
        nextTick(() => focusRow(columnIndex + 1, columns.value[columnIndex + 1]?.findIndex((node) => !nodes.isEffectivelyDisabled(node)) ?? -1));
      } else if (event.key === 'Enter' && focusedNode.value) {
        event.preventDefault();
        handleNodeClick(focusedNode.value);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const start = from < 0 ? (step > 0 ? 0 : column.length - 1) : from + step;
        for (let index = start; index >= 0 && index < column.length; index += step) {
          if (nodes.isEffectivelyDisabled(column[index])) continue;
          focusRow(columnIndex, index);
          break;
        }
      }
    };
    expose({ getCheckedNodes, clearCheckedNodes, getFlattedNodes, scrollToExpandingNode, handleKeyDown, loadLazyRootNodes: nodes.loadLazyRootNodes });

    return () => (
      <div class={[embedded ? 'i-cascader__menus' : 'i-cascader-panel', props.border && 'has-border']}
        tabindex={embedded ? undefined : 0} onKeydown={handleKeyDown}>
        {columns.value.map((column, columnIndex) => {
          const start = props.virtualScroll ? Math.max(0, Math.floor((scrollOffsets.value[columnIndex] ?? 0) / rowHeight.value) - 2) : 0;
          const end = props.virtualScroll ? start + Math.ceil(windowHeight.value / rowHeight.value) + 5 : column.length;
          const rows = column.slice(start, end).map((node, offset) => {
            const index = start + offset;
            const state = nodes.nodeState(node);
            const active = (embedded?.active() ?? activeValues.value)[columnIndex] === node.value;
            const disabled = nodes.isEffectivelyDisabled(node);
            const singleSelected = !multiple.value && checkedNodes.value.includes(node);
            return (
              <div key={String(node.value)} data-index={index} tabindex={-1}
                style={props.virtualScroll ? { height: `${rowHeight.value}px`, boxSizing: 'border-box' } : undefined}
                class={[embedded ? 'i-cascader__node' : 'i-cascader-panel__node', {
                  'is-active': active, 'is-disabled': disabled,
                  'is-checked': state === 'checked' || singleSelected, 'is-loading': node.loading
                }]}
                role={embedded ? 'option' : 'menuitemcheckbox'}
                aria-selected={embedded ? singleSelected || state === 'checked' : undefined}
                aria-checked={!embedded && multiple.value ? (state === 'indeterminate' ? 'mixed' : state === 'checked') : undefined}
                aria-disabled={disabled || undefined}
                onFocus={() => { focusedNode.value = node; }}
                onClick={() => handleNodeClick(node)}
                onMousemove={(event: MouseEvent) => trackHover(event, node, columnIndex)}
                onMouseenter={(event: MouseEvent) => { if (expandTrigger.value === 'hover') hoverNode(event, node, columnIndex); }}>
                {props.props?.showPrefix !== false && (multiple.value || checkStrictly.value) && (
                  <input class={embedded ? 'i-cascader__checkbox' : 'i-cascader-panel__checkbox'}
                    type={multiple.value ? 'checkbox' : 'radio'}
                    checked={multiple.value ? state === 'checked' : singleSelected}
                    indeterminate={state === 'indeterminate'}
                    disabled={disabled}
                    aria-label={node.label}
                    onClick={(event: MouseEvent) => event.stopPropagation()}
                    onChange={(event: Event) => {
                      if (multiple.value) (event.currentTarget as HTMLInputElement).checked = state === 'checked';
                      if (multiple.value) toggleCheck(node);
                      else if (embedded) embedded.select(node);
                      else update(nodeValue(node));
                    }} />
                )}
                <span class={embedded ? 'i-cascader__label' : 'i-cascader-panel__label'}>
                  {slots.default?.({ node, data: node.data }) ?? node.label}
                </span>
                {!node.leaf && (
                  <span class={embedded ? 'i-cascader__expand' : 'i-cascader-panel__arrow'} aria-hidden='true'
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation();
                      if (!disabled) { stopHover(); expand(node); }
                    }}>
                    {node.loading ? '…' : '›'}
                  </span>
                )}
              </div>
            );
          });
          return <div key={columnIndex} role={embedded ? 'listbox' : 'menu'}
            ref={(element) => { menuList.value[columnIndex] = element as HTMLElement; }}
            class={embedded ? 'i-cascader__menu' : 'i-cascader-panel__column'}
            style={props.virtualScroll ? { maxHeight: `${windowHeight.value}px`, overflowY: 'auto' } : undefined}
            onMouseenter={stopHover}
            onScroll={props.virtualScroll ? (event: Event) => {
              scrollOffsets.value[columnIndex] = (event.currentTarget as HTMLElement).scrollTop;
            } : undefined}>
            {props.virtualScroll
              ? <div style={{ paddingTop: `${start * rowHeight.value}px`, paddingBottom: `${Math.max(0, column.length - end) * rowHeight.value}px` }}>
                {rows}
              </div>
              : rows}
          </div>;
        })}
        {!columns.value.length && slots.empty?.()}
      </div>
    );
  }
});
