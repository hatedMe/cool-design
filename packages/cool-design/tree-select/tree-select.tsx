import {
  computed,
  defineComponent,
  inject,
  nextTick,
  onBeforeUnmount,
  normalizeClass,
  ref,
  watch,
  type CSSProperties,
  type Component,
  type PropType
} from 'vue';
import Select from '../select';
import Icon from '../icon';
import type { SelectTagType } from '../select';
import type { SelectInstance } from '../select';
import Tree from '../tree';
import type { TreeAllowDrag, TreeAllowDrop, TreeRenderContent, TreeData, TreeExposed, TreeKey, TreeLoadFunction, TreePropsMapping, TreeNode, TreeFilterMethod } from '../tree/types';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { useNamespace } from '../../hooks/use-namespace';
import { useConfig, type Size } from '../config-provider/context';
import { formKey, useField } from '../form/context';
import type { FloatingOptions, Placement } from '../../../src/utils/use-floating';
export interface TreeSelectNode extends TreeData {
  value?: string | number;
  label?: string;
  children?: TreeSelectNode[];
  disabled?: boolean;
}
export default defineComponent({
  name: 'i-tree-select',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Array] as PropType<string | number | boolean | (string | number)[] | null>,
      default: null
    },
    data: { type: Array as PropType<TreeSelectNode[]>, default: () => [] },
    props: { type: Object as PropType<TreePropsMapping>, default: () => ({}) },
    nodeKey: String,
    valueKey: String,
    appendTo: [String, Object] as PropType<string | HTMLElement>,
    name: String,
    lazy: Boolean,
    load: Function as PropType<TreeLoadFunction>,
    cacheData: { type: Array as PropType<TreeSelectNode[]>, default: () => [] },
    defaultExpandAll: Boolean,
    defaultExpandedKeys: { type: Array as PropType<TreeKey[]>, default: () => [] },
    autoExpandParent: { type: Boolean, default: true },
    accordion: Boolean,
    showCheckbox: { type: Boolean, default: undefined },
    expandOnClickNode: { type: Boolean, default: undefined },
    checkOnClickNode: Boolean,
    checkOnClickLeaf: { type: Boolean, default: true },
    checkDescendants: Boolean,
    highlightCurrent: { type: Boolean, default: undefined },
    emptyText: { type: String, default: '暂无数据' },
    draggable: Boolean,
    allowDrag: Function as PropType<TreeAllowDrag>,
    allowDrop: Function as PropType<TreeAllowDrop>,
    renderContent: Function as PropType<TreeRenderContent>,
    indent: { type: Number, default: 18 },
    renderAfterExpand: Boolean,
    filterNodeMethod: Function as PropType<TreeFilterMethod>,
    multiple: Boolean,
    checkStrictly: Boolean,
    filterable: Boolean,
    filterMethod: Function as PropType<(query: string) => void>,
    remote: Boolean,
    debounce: { type: Number, default: 300 },
    remoteShowSuffix: Boolean,
    autocomplete: { type: String, default: 'off' },
    suffixIcon: [String, Object, Function] as PropType<string | Component>,
    clearIcon: { type: [String, Object, Function] as PropType<string | Component>, default: 'icon-close' },
    tagType: String as PropType<SelectTagType>,
    tagEffect: { type: String as PropType<'light' | 'dark' | 'plain'>, default: 'light' },
    remoteMethod: Function as PropType<(query: string) => void>,
    fitInputWidth: Boolean,
    loading: Boolean,
    loadingText: String,
    ariaLabel: String,
    id: String,
    tabindex: [String, Number],
    collapseTags: Boolean,
    maxCollapseTags: { type: Number, default: 1 },
    placeholder: { type: String, default: '请选择' },
    disabled: Boolean,
    size: String as PropType<Size>,
    clearable: Boolean,
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: { type: [String, Number, Boolean, Function], default: undefined },
    validateEvent: { type: Boolean, default: true },
    teleported: { type: Boolean, default: true },
    persistent: { type: Boolean, default: true },
    placement: { type: String as PropType<Placement>, default: 'bottom-start' },
    fallbackPlacements: { type: Array as PropType<Placement[]>, default: () => ['top-start', 'bottom', 'top'] },
    popperOptions: { type: Object as PropType<FloatingOptions>, default: undefined },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    popperStyle: { type: [String, Array, Object] as PropType<string | CSSProperties | CSSProperties[]>, default: undefined },
    effect: { type: String as PropType<'light' | 'dark'>, default: 'light' }
  },
  emits: ['update:modelValue', 'change', 'clear', 'visible-change', 'remove-tag', 'focus', 'blur', 'node-click', 'check',
    'popup-scroll', 'end-reached', 'node-contextmenu', 'current-change', 'check-change', 'node-expand', 'node-collapse', 'node-drag-start', 'node-drag-enter', 'node-drag-leave', 'node-drag-over', 'node-drag-end', 'node-drop'],
  setup(props, { emit, expose, slots }) {
    const ns = useNamespace('tree-select');
    const treeNs = useNamespace('tree');
    const selectNs = useNamespace('select');
    const field = useField();
    const form = inject(formKey, undefined);
    const config = useConfig();
    const size = computed(() => props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size);
    const root = ref<HTMLElement>();
    const nodeKey = computed(() => props.nodeKey || props.valueKey || 'value');
    const treeRef = ref<TreeExposed>();
    const selectRef = ref<SelectInstance>();
    const open = ref(false);
    const query = ref('');
    const syncing = ref(false);
    const loadedData = ref<TreeData[]>([]);
    const load: TreeLoadFunction = (node, resolve, reject) => {
      const onResolve = (children: TreeData[]) => {
        loadedData.value = [...loadedData.value, ...children];
        resolve(children);
        nextTick(syncTree);
      };
      const result = props.load?.(node, onResolve, reject);
      if (Array.isArray(result)) onResolve(result);
      else if (result && typeof (result as Promise<TreeData[]>).then === 'function') {
        (result as Promise<TreeData[]>).then(onResolve).catch(() => reject?.());
      }
    };
    const { getValueOnClear, isEmptyValue } = useEmptyValues({
      emptyValues: computed(() => props.emptyValues),
      valueOnClear: computed(() => props.valueOnClear)
    });
    const showCheckbox = computed(() => props.showCheckbox ?? props.multiple);
    const selectedValues = computed<(string | number)[]>(() =>
      Array.isArray(props.modelValue) ? props.modelValue : (typeof props.modelValue === 'boolean' || props.modelValue == null || isEmptyValue(props.modelValue)) ? [] : [props.modelValue]
    );
    const labelMap = computed(() => {
      const map = new Map<string | number, string>();
      const walk = (nodes: TreeData[]) =>
        nodes.forEach((node) => {
          const key = node[nodeKey.value] as TreeKey;
          const label = props.props.label;
          const treeNode = treeRef.value?.getNode(key);
          const text = typeof label === 'function'
            ? treeNode ? label(node, treeNode) : node.label
            : node[label || 'label'];
          map.set(key, String(text ?? key));
          const children = node[props.props.children || 'children'];
          if (Array.isArray(children)) walk(children);
        });
      walk(props.cacheData);
      walk(loadedData.value);
      walk(props.data);
      return map;
    });
    const labelOf = (value: string | number) => labelMap.value.get(value) ?? String(value);
    const isDisabled = () => props.disabled || !!(field?.disabled?.() ?? form?.disabled?.());

    const close = () => selectRef.value?.togglePopperVisible(false);
    const handleVisible = (value: boolean) => {
      open.value = value;
      emit('visible-change', value);
      if (value) nextTick(() => {
        syncTree();
        if (query.value && !props.filterMethod && !(props.remote && props.remoteMethod)) treeRef.value?.filter(query.value);
      });
    };
    const commit = (result: unknown) => {
      emit('update:modelValue', result);
      emit('change', result);
      if (props.validateEvent) field?.validate?.('change');
    };

    const syncTree = () => {
      if (!treeRef.value) return;
      syncing.value = true;
      if (showCheckbox.value) treeRef.value.setCheckedKeys(selectedValues.value as TreeKey[]);
      else treeRef.value.setCurrentKey((selectedValues.value[0] ?? null) as TreeKey | null);
      syncing.value = false;
    };
    const syncTreeAfterRender = async () => {
      await nextTick();
      syncTree();
    };
    watch(selectedValues, syncTreeAfterRender, { deep: true });
    watch(() => props.data, syncTreeAfterRender, { deep: true });
    watch(treeRef, syncTreeAfterRender, { immediate: true });

    const onNodeClick = (data: TreeData, node: TreeNode, instance: unknown) => {
      emit('node-click', data, node, instance);
      if (showCheckbox.value || isDisabled() || node.disabled || (!props.checkStrictly && !node.isLeaf)) return;
      let parent = node.parent;
      while (parent) {
        if (parent.disabled) return;
        parent = parent.parent;
      }
      const value = data[nodeKey.value] as string | number;
      if (props.multiple) {
        const current = selectedValues.value;
        commit(current.includes(value) ? current.filter((key) => key !== value) : [...current, value]);
      } else {
        commit(value);
        close();
      }
    };
    const onCheck = (data: TreeData, info: { checkedKeys: TreeKey[] }) => {
      if (syncing.value || isDisabled()) return;
      emit('check', data, info);
      if (props.multiple) {
        const keys = props.checkStrictly ? info.checkedKeys : treeRef.value?.getCheckedKeys(true) ?? info.checkedKeys;
        const unloaded = selectedValues.value.filter((key) => !treeRef.value?.getNode(key));
        commit([...new Set([...unloaded, ...keys])]);
      }
      else if (showCheckbox.value) {
        const clicked = treeRef.value?.getNode(data);
        const selected = selectedValues.value[0];
        const findCandidate = (node: TreeNode): TreeKey | undefined => {
          if (node.disabled) return;
          if (props.checkStrictly || node.isLeaf) return node.key ?? undefined;
          for (const child of node.children) {
            const key = findCandidate(child);
            if (key !== undefined) return key;
          }
        };
        const belongsTo = (node: TreeNode): boolean => node.key === selected || node.children.some(belongsTo);
        const key = props.checkStrictly
          ? clicked?.key != null && info.checkedKeys.includes(clicked.key) ? clicked.key : undefined
          : clicked && !belongsTo(clicked) ? findCandidate(clicked) : undefined;
        commit(key ?? getValueOnClear());
        close();
      }
    };
    const removeTag = (value: string | number) => {
      if (isDisabled()) return;
      emit('remove-tag', value);
      commit(selectedValues.value.filter((item) => item !== value));
    };
    const onClear = () => {
      if (isDisabled()) return;
      commit(props.multiple ? [] : getValueOnClear());
      emit('clear');
    };

    watch(isDisabled, (disabled) => { if (disabled) close(); });
    let remoteTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelRemote = () => {
      if (remoteTimer !== undefined) clearTimeout(remoteTimer);
      remoteTimer = undefined;
    };
    onBeforeUnmount(cancelRemote);
    watch(open, (visible) => {
      if (visible) return;
      cancelRemote();
      if (props.remote && !props.filterMethod) query.value = '';
    });
    watch(query, (value) => {
      cancelRemote();
      if (props.filterMethod) props.filterMethod(value);
      else if (props.remote && props.remoteMethod) {
        if (!open.value) return;
        if (props.debounce > 0) remoteTimer = setTimeout(() => props.remoteMethod?.(value), props.debounce);
        else props.remoteMethod(value);
      } else treeRef.value?.filter(value);
    });

    const focusTreeNode = (step: number) => {
      const tree = treeRef.value as (TreeExposed & { $el?: HTMLElement }) | undefined;
      const candidates = tree?.$el?.querySelectorAll<HTMLElement>('[role="treeitem"]:not([aria-disabled="true"])');
      const nodes = Array.from(candidates ?? []).filter((node) => {
        for (let ancestor: HTMLElement | null = node; ancestor && ancestor !== tree?.$el; ancestor = ancestor.parentElement) {
          if (ancestor.style.display === 'none' || ancestor.hidden) return false;
        }
        return true;
      });
      if (!nodes.length) return;
      const index = nodes.indexOf(document.activeElement as HTMLElement);
      const target = nodes[index < 0 ? (step < 0 ? nodes.length - 1 : 0) : (index + step + nodes.length) % nodes.length];
      target.tabIndex = -1;
      target.focus();
    };
    const onTreeKeydown = (event: KeyboardEvent) => {
      if (isDisabled() || event.isComposing) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusTreeNode(event.key === 'ArrowUp' ? -1 : 1);
      } else if (event.key === 'Escape') {
        close();
        selectRef.value?.focus();
      } else if (event.key === 'Enter' && (event.target as HTMLElement).matches('[role="treeitem"]')) {
        event.preventDefault();
        (event.target as HTMLElement).querySelector<HTMLElement>(showCheckbox.value ? 'input[type="checkbox"]' : `.${treeNs.e('content')}`)?.click();
      }
    };

    const selectedLabel = computed(() => props.multiple ? selectedValues.value.map(labelOf) : (selectedValues.value.map(labelOf)[0] ?? ''));
    expose({
      selectRef,
      treeRef,
      selectedLabel,
      filter: (value: string) => treeRef.value?.filter(value),
      getNode: (...args: Parameters<TreeExposed['getNode']>) => treeRef.value?.getNode(...args) ?? null,
      getCheckedKeys: (...args: Parameters<TreeExposed['getCheckedKeys']>) => treeRef.value?.getCheckedKeys(...args) ?? [],
      getCheckedNodes: (...args: Parameters<TreeExposed['getCheckedNodes']>) => treeRef.value?.getCheckedNodes(...args) ?? [],
      getHalfCheckedKeys: () => treeRef.value?.getHalfCheckedKeys() ?? [],
      getHalfCheckedNodes: () => treeRef.value?.getHalfCheckedNodes() ?? [],
      setCheckedKeys: (...args: Parameters<TreeExposed['setCheckedKeys']>) => treeRef.value?.setCheckedKeys(...args),
      setCheckedNodes: (...args: Parameters<TreeExposed['setCheckedNodes']>) => treeRef.value?.setCheckedNodes(...args),
      setChecked: (...args: Parameters<TreeExposed['setChecked']>) => treeRef.value?.setChecked(...args),
      setCurrentKey: (...args: Parameters<TreeExposed['setCurrentKey']>) => treeRef.value?.setCurrentKey(...args),
      setCurrentNode: (...args: Parameters<TreeExposed['setCurrentNode']>) => treeRef.value?.setCurrentNode(...args),
      getCurrentKey: () => treeRef.value?.getCurrentKey() ?? null,
      getCurrentNode: () => treeRef.value?.getCurrentNode() ?? null,
      updateKeyChildren: (...args: Parameters<TreeExposed['updateKeyChildren']>) => treeRef.value?.updateKeyChildren(...args),
      remove: (...args: Parameters<TreeExposed['remove']>) => treeRef.value?.remove(...args),
      append: (...args: Parameters<TreeExposed['append']>) => treeRef.value?.append(...args),
      insertBefore: (...args: Parameters<TreeExposed['insertBefore']>) => treeRef.value?.insertBefore(...args),
      insertAfter: (...args: Parameters<TreeExposed['insertAfter']>) => treeRef.value?.insertAfter(...args),
      focus: () => { selectRef.value?.focus(); },
      blur: () => { selectRef.value?.blur(); }
    });

    return () => {
      const shownTags = props.collapseTags
        ? selectedValues.value.slice(0, Math.max(0, props.maxCollapseTags))
        : selectedValues.value;
      const restCount = selectedValues.value.length - shownTags.length;
      const tagClasses = [selectNs.e('tag'), props.tagType && selectNs.em('tag', props.tagType), selectNs.em('tag', props.tagEffect)];
      return (
        <span
          ref={root}
          class={[ns.b(), ns.m(size.value), open.value && 'is-open', isDisabled() && 'is-disabled']}
          aria-invalid={field?.invalid() ? 'true' : undefined}
          aria-describedby={field?.invalid() ? field.errorId : undefined}>
          <Select
            ref={selectRef}
            disabled={isDisabled()}
            options={Array.from(labelMap.value, ([value, label]) => ({ value, label }))}
            modelValue={props.modelValue}
            multiple={props.multiple}
            fitInputWidth={props.fitInputWidth}
            teleported={props.teleported}
            appendTo={props.appendTo}
            persistent={props.persistent}
            placement={props.placement}
            fallbackPlacements={props.fallbackPlacements}
            popperOptions={props.popperOptions}
            popperClass={normalizeClass([ns.e('dropdown'), ns.em('dropdown', props.effect), props.popperClass])}
            popperStyle={props.popperStyle}
            effect={props.effect}
            onPopup-scroll={(position: { scrollTop: number; scrollLeft: number }) => emit('popup-scroll', position)}
            onEnd-reached={(direction: string) => emit('end-reached', direction)}
            onVisible-change={handleVisible}>
            {{
              control: ({ toggle }: { toggle: () => void }) => <>
          <button
            type='button'
            class={ns.e('control')}
            role='combobox'
            id={props.id ?? field?.id}
            tabindex={props.tabindex}
            aria-label={props.ariaLabel}
            onFocus={(event: FocusEvent) => emit('focus', event)}
            onBlur={(event: FocusEvent) => emit('blur', event)}
            onKeydown={(event: KeyboardEvent) => {
              if (isDisabled() || event.isComposing) return;
              if (event.key === 'Escape') close();
              else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                selectRef.value?.togglePopperVisible(true);
                nextTick(() => requestAnimationFrame(() => focusTreeNode(event.key === 'ArrowUp' ? -1 : 1)));
              }
            }}
            disabled={isDisabled()}
            aria-expanded={open.value}
            onClick={toggle}>
            {slots.prefix?.()}
            {props.multiple ? (
              shownTags.length ? (
                shownTags.map((value) => (
                  <span class={[ns.e('tag'), tagClasses]} key={String(value)}>
                    {slots.label?.({ value, label: labelOf(value) }) ?? labelOf(value)}
                    {!isDisabled() && (
                      <span
                        class={ns.e('tag-close')}
                        role='button'
                        tabindex={0}
                        aria-label={`移除 ${labelOf(value)}`}
                        onClick={(event: MouseEvent) => {
                          event.stopPropagation();
                          removeTag(value);
                        }}>
                        ×
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span class={ns.e('placeholder')}>{props.placeholder}</span>
              )
            ) : selectedValues.value.length ? (
              <span class={ns.e('label')}>{slots.label?.({ value: selectedValues.value[0], label: labelOf(selectedValues.value[0]) }) ?? labelOf(selectedValues.value[0])}</span>
            ) : (
              <span class={ns.e('placeholder')}>{props.placeholder}</span>
            )}
            {props.multiple && restCount > 0 && <span class={[ns.e('more'), tagClasses]}>+{restCount}</span>}
            {slots.suffix?.() ?? ((!props.remote || !props.filterable || props.remoteShowSuffix) && (props.suffixIcon ? <Icon icon={props.suffixIcon} aria-hidden='true' /> : <span class={selectNs.e('suffix-caret')} aria-hidden='true' />))}
          </button>
          {props.name && (props.multiple ? selectedValues.value : [selectedValues.value[0] ?? '']).map((value, index) =>
            <input key={index} type='hidden' name={props.name} value={value} disabled={isDisabled()} />
          )}
          {props.clearable && selectedValues.value.length > 0 && !isDisabled() && (
            <button
              type='button'
              class={ns.e('clear')}
              aria-label='清空'
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                onClear();
              }}>
              <Icon icon={props.clearIcon} aria-hidden='true' />
            </button>
          )}
              </>,
              header: slots.header,
              footer: slots.footer,
              dropdown: () => <div onKeydown={onTreeKeydown}>
                {props.filterable && (
                  <input
                    class={ns.e('filter')}
                    autocomplete={props.autocomplete}
                    value={query.value}
                    placeholder='筛选'
                    onInput={(event: Event) => {
                      if (!(event as InputEvent).isComposing) query.value = (event.target as HTMLInputElement).value;
                    }}
                    onCompositionend={(event: CompositionEvent) => (query.value = (event.target as HTMLInputElement).value)}
                  />
                )}
                {props.loading && <div role='status'>{slots.loading?.() ?? props.loadingText ?? '加载中…'}</div>}
                <Tree
                  ref={treeRef}
                  data={props.data as unknown as TreeData[]}
                  nodeKey={nodeKey.value}
                  props={props.props}
                  lazy={props.lazy}
                  load={props.load ? load : undefined}
                  defaultExpandAll={props.defaultExpandAll}
                  defaultExpandedKeys={props.defaultExpandedKeys}
                  autoExpandParent={props.autoExpandParent}
                  accordion={props.accordion}
                  indent={props.indent}
                  filterNodeMethod={props.filterNodeMethod}
                  showCheckbox={showCheckbox.value}
                  checkStrictly={props.checkStrictly}
                  highlightCurrent={props.highlightCurrent ?? !props.multiple}
                  expandOnClickNode={!props.checkStrictly && (props.expandOnClickNode ?? !props.multiple)}
                  checkOnClickNode={props.checkOnClickNode}
                  checkOnClickLeaf={props.checkOnClickLeaf}
                  checkDescendants={props.checkDescendants}
                  renderAfterExpand={props.renderAfterExpand}
                  style={props.loading ? { display: 'none' } : undefined}
                  disabled={isDisabled()}
                  emptyText={props.emptyText}
                  draggable={props.draggable}
                  allowDrag={props.allowDrag}
                  allowDrop={props.allowDrop}
                  renderContent={props.renderContent}
                  onNode-contextmenu={(...args: unknown[]) => emit('node-contextmenu', ...args)}
                  onCurrent-change={(...args: unknown[]) => emit('current-change', ...args)}
                  onCheck-change={(...args: unknown[]) => emit('check-change', ...args)}
                  onNode-expand={(...args: unknown[]) => emit('node-expand', ...args)}
                  onNode-collapse={(...args: unknown[]) => emit('node-collapse', ...args)}
                  onNode-drag-start={(...args: unknown[]) => emit('node-drag-start', ...args)}
                  onNode-drag-enter={(...args: unknown[]) => emit('node-drag-enter', ...args)}
                  onNode-drag-leave={(...args: unknown[]) => emit('node-drag-leave', ...args)}
                  onNode-drag-over={(...args: unknown[]) => emit('node-drag-over', ...args)}
                  onNode-drag-end={(...args: unknown[]) => emit('node-drag-end', ...args)}
                  onNode-drop={(...args: unknown[]) => emit('node-drop', ...args)}
                  onNode-click={onNodeClick}
                  onCheck={onCheck}>
                  {{ default: slots.default, empty: slots.empty }}
                </Tree>
              </div>
            }}
          </Select>
        </span>
      );
    };
  }
});
