import {
  computed,
  defineComponent,
  nextTick,
  ref,
  watch,
  type CSSProperties,
  type PropType
} from 'vue';
import { Teleport } from 'vue';
import Tree from '../tree';
import type { TreeData, TreeExposed, TreeKey } from '../tree/types';
import { useField } from '../form/context';
import { useFloating, type FloatingOptions, type Placement } from '../../../src/utils/use-floating';
export interface TreeSelectNode {
  value: string | number;
  label: string;
  children?: TreeSelectNode[];
  disabled?: boolean;
}
export default defineComponent({
  name: 'i-tree-select',
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<string | number | (string | number)[] | null>,
      default: null
    },
    data: { type: Array as PropType<TreeSelectNode[]>, default: () => [] },
    multiple: Boolean,
    checkStrictly: Boolean,
    filterable: Boolean,
    collapseTags: Boolean,
    maxCollapseTags: { type: Number, default: 1 },
    placeholder: { type: String, default: '请选择' },
    disabled: Boolean,
    clearable: Boolean,
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
    const root = ref<HTMLElement>();
    const treeRef = ref<TreeExposed>();
    const dropdown = ref<HTMLElement>();
    const open = ref(false);
    const shownOnce = ref(false);
    const query = ref('');
    const syncing = ref(false);
    const position = useFloating({
      open,
      reference: root,
      floating: dropdown,
      placement: () => props.popperOptions?.placement ?? props.placement,
      fallbackPlacements: () => props.fallbackPlacements,
      offset: () => props.popperOptions?.offset ?? 4,
      close: () => close()
    });

    const selectedValues = computed<(string | number)[]>(() =>
      Array.isArray(props.modelValue) ? props.modelValue : props.modelValue == null ? [] : [props.modelValue]
    );
    const labelMap = computed(() => {
      const map = new Map<string | number, string>();
      const walk = (nodes: TreeSelectNode[]) =>
        nodes.forEach((node) => {
          map.set(node.value, node.label);
          walk(node.children ?? []);
        });
      walk(props.data);
      return map;
    });
    const labelOf = (value: string | number) => labelMap.value.get(value) ?? String(value);
    const isDisabled = () => props.disabled || !!field?.disabled?.();

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
    const commit = (result: string | number | (string | number)[] | null) => {
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

    const onNodeClick = (data: TreeData) => {
      if (props.multiple) return;
      const value = data.value as string | number;
      commit(value);
      close();
    };
    const onCheck = (_data: TreeData, info: { checkedKeys: TreeKey[] }) => {
      if (syncing.value || !props.multiple) return;
      commit([...info.checkedKeys] as (string | number)[]);
    };
    const removeTag = (value: string | number) => {
      if (isDisabled()) return;
      emit('remove-tag', value);
      commit(selectedValues.value.filter((item) => item !== value));
    };
    const onClear = () => {
      commit(props.multiple ? [] : null);
      emit('clear');
    };

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
          class={['i-tree-select', open.value && 'is-open', isDisabled() && 'is-disabled']}
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
                  nodeKey='value'
                  showCheckbox={props.multiple}
                  checkStrictly={props.checkStrictly}
                  highlightCurrent={!props.multiple}
                  expandOnClickNode={!props.multiple}
                  checkOnClickNode={false}
                  renderAfterExpand={false}
                  disabled={isDisabled()}
                  emptyText='暂无数据'
                  onNode-click={(data: TreeData) => onNodeClick(data)}
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
