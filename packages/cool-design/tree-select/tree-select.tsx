import {
  computed,
  defineComponent,
  inject,
  nextTick,
  ref,
  watch,
  type CSSProperties,
  type PropType
} from 'vue';
import { Teleport } from 'vue';
import Tree from '../tree';
import type { TreeData, TreeExposed, TreeKey, TreeLoadFunction, TreePropsMapping, TreeNode, TreeFilterMethod } from '../tree/types';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { useConfig, type Size } from '../config-provider/context';
import { formKey, useField } from '../form/context';
import { useFloating, type FloatingOptions, type Placement } from '../../../src/utils/use-floating';
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
    nodeKey: { type: String, default: 'value' },
    lazy: Boolean,
    load: Function as PropType<TreeLoadFunction>,
    cacheData: { type: Array as PropType<TreeSelectNode[]>, default: () => [] },
    defaultExpandAll: Boolean,
    defaultExpandedKeys: { type: Array as PropType<TreeKey[]>, default: () => [] },
    autoExpandParent: { type: Boolean, default: true },
    accordion: Boolean,
    indent: { type: Number, default: 18 },
    renderAfterExpand: Boolean,
    filterNodeMethod: Function as PropType<TreeFilterMethod>,
    multiple: Boolean,
    checkStrictly: Boolean,
    filterable: Boolean,
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
    persistent: Boolean,
    placement: { type: String as PropType<Placement>, default: 'bottom-start' },
    fallbackPlacements: { type: Array as PropType<Placement[]>, default: () => ['top-start', 'bottom', 'top'] },
    popperOptions: { type: Object as PropType<FloatingOptions>, default: undefined },
    popperClass: { type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>, default: undefined },
    popperStyle: { type: [String, Array, Object] as PropType<string | CSSProperties | CSSProperties[]>, default: undefined },
    effect: { type: String as PropType<'light' | 'dark'>, default: 'light' }
  },
  emits: ['update:modelValue', 'change', 'clear', 'visible-change', 'remove-tag'],
  setup(props, { emit, expose }) {
    const field = useField();
    const form = inject(formKey, undefined);
    const config = useConfig();
    const size = computed(() => props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size);
    const root = ref<HTMLElement>();
    const treeRef = ref<TreeExposed>();
    const dropdown = ref<HTMLElement>();
    const open = ref(false);
    const shownOnce = ref(false);
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
    const position = useFloating({
      open,
      reference: root,
      floating: dropdown,
      placement: () => props.popperOptions?.placement ?? props.placement,
      fallbackPlacements: () => props.fallbackPlacements,
      offset: () => props.popperOptions?.offset ?? 4,
      close: () => close()
    });

    const { getValueOnClear, isEmptyValue } = useEmptyValues({
      emptyValues: computed(() => props.emptyValues),
      valueOnClear: computed(() => props.valueOnClear)
    });
    const selectedValues = computed<(string | number)[]>(() =>
      Array.isArray(props.modelValue) ? props.modelValue : (typeof props.modelValue === 'boolean' || props.modelValue == null || isEmptyValue(props.modelValue)) ? [] : [props.modelValue]
    );
    const labelMap = computed(() => {
      const map = new Map<string | number, string>();
      const walk = (nodes: TreeData[]) =>
        nodes.forEach((node) => {
          const key = node[props.nodeKey] as TreeKey;
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

    const close = () => {
      if (!open.value) return;
      open.value = false;
      emit('visible-change', false);
    };
    const openDropdown = () => {
      if (open.value || isDisabled()) return;
      open.value = true;
      shownOnce.value = true;
      emit('visible-change', true);
      nextTick(() => {
        syncTree();
        if (query.value) treeRef.value?.filter(query.value);
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
      if (props.multiple) treeRef.value.setCheckedKeys(selectedValues.value as TreeKey[]);
      else treeRef.value.setCurrentKey((selectedValues.value[0] ?? null) as TreeKey | null);
      syncing.value = false;
    };
    watch(
      () => [selectedValues.value.join('\u0000'), props.data] as const,
      () => {
        nextTick(syncTree);
      },
      { immediate: true }
    );

    const onNodeClick = (data: TreeData, node: TreeNode) => {
      if (props.multiple || isDisabled() || node.disabled) return;
      let parent = node.parent;
      while (parent) {
        if (parent.disabled) return;
        parent = parent.parent;
      }
      const value = data[props.nodeKey] as string | number;
      commit(value);
      close();
    };
    const onCheck = (_data: TreeData, info: { checkedKeys: TreeKey[] }) => {
      if (syncing.value || !props.multiple || isDisabled()) return;
      commit([...info.checkedKeys] as (string | number)[]);
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
    watch(query, (value) => {
      treeRef.value?.filter(value);
    });

    expose({
      focus: () => root.value?.querySelector<HTMLElement>('.i-tree-select__control')?.focus(),
      blur: () => root.value?.querySelector<HTMLElement>('.i-tree-select__control')?.blur()
    });

    return () => {
      const shownTags = props.collapseTags
        ? selectedValues.value.slice(0, Math.max(0, props.maxCollapseTags))
        : selectedValues.value;
      const restCount = selectedValues.value.length - shownTags.length;
      return (
        <span
          ref={root}
          class={['i-tree-select', `i-tree-select--${size.value}`, open.value && 'is-open', isDisabled() && 'is-disabled']}
          id={field?.id}
          aria-invalid={field?.invalid() ? 'true' : undefined}
          aria-describedby={field?.invalid() ? field.errorId : undefined}>
          <button
            type='button'
            class='i-tree-select__control'
            disabled={isDisabled()}
            aria-expanded={open.value}
            onClick={() => (open.value ? close() : openDropdown())}>
            {props.multiple ? (
              shownTags.length ? (
                shownTags.map((value) => (
                  <span class='i-tree-select__tag' key={String(value)}>
                    {labelOf(value)}
                    {!isDisabled() && (
                      <span
                        class='i-tree-select__tag-close'
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
                <span class='i-tree-select__placeholder'>{props.placeholder}</span>
              )
            ) : selectedValues.value.length ? (
              <span class='i-tree-select__label'>{labelOf(selectedValues.value[0])}</span>
            ) : (
              <span class='i-tree-select__placeholder'>{props.placeholder}</span>
            )}
            {props.multiple && restCount > 0 && <span class='i-tree-select__more'>+{restCount}</span>}
          </button>
          {props.clearable && selectedValues.value.length > 0 && !isDisabled() && (
            <button
              type='button'
              class='i-tree-select__clear'
              aria-label='清空'
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                onClear();
              }}>
              ×
            </button>
          )}
          {(() => {
            const kept = props.persistent && shownOnce.value && !open.value;
            if (!open.value && !kept) return null;
            const panel = (
              <div
                ref={dropdown}
                class={['i-tree-select__dropdown', `i-tree-select__dropdown--${props.effect}`, props.popperClass]}
                aria-hidden={kept ? 'true' : undefined}
                data-placement={position.placement.value}
                style={[position.style.value, props.popperStyle, kept ? { display: 'none' } : undefined]}>
                {props.filterable && (
                  <input
                    class='i-tree-select__filter'
                    value={query.value}
                    placeholder='筛选'
                    onInput={(e: Event) => (query.value = (e.target as HTMLInputElement).value)}
                  />
                )}
                <Tree
                  ref={treeRef}
                  data={props.data as unknown as TreeData[]}
                  nodeKey={props.nodeKey}
                  props={props.props}
                  lazy={props.lazy}
                  load={props.load ? load : undefined}
                  defaultExpandAll={props.defaultExpandAll}
                  defaultExpandedKeys={props.defaultExpandedKeys}
                  autoExpandParent={props.autoExpandParent}
                  accordion={props.accordion}
                  indent={props.indent}
                  filterNodeMethod={props.filterNodeMethod}
                  showCheckbox={props.multiple}
                  checkStrictly={props.checkStrictly}
                  highlightCurrent={!props.multiple}
                  expandOnClickNode={!props.multiple}
                  checkOnClickNode={false}
                  renderAfterExpand={props.renderAfterExpand}
                  disabled={isDisabled()}
                  emptyText='暂无数据'
                  onNode-click={onNodeClick}
                  onCheck={onCheck}
                />
              </div>
            );
            return props.teleported ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
          })()}
        </span>
      );
    };
  }
});
