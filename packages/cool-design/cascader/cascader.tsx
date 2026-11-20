import {
  Teleport,
  computed,
  defineComponent,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type CSSProperties,
  type PropType
} from 'vue';
import { useEmptyValues } from '../../hooks/use-empty-values';
import { formKey, useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import { useFloating, type Placement, type FloatingOptions } from '../../../src/utils/use-floating';
import { createNamespace } from '../../../src/utils/create';
import Tooltip from '../tooltip';
import type { TagType } from '../tag/tag';
import { useCascaderNodes } from './node';
import type {
  CascaderFilterMethod,
  CascaderItemValue,
  CascaderLazyLoad,
  CascaderModelValue,
  CascaderNode,
  CascaderNodeValue,
  CascaderOption,
  CascaderTag,
  CascaderPropsMapping
} from './types';

const [name, bem] = createNamespace('cascader');

export default defineComponent({
  name,
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Boolean, Array] as PropType<CascaderModelValue | boolean>, default: null },
    options: { type: Array as PropType<CascaderOption[]>, default: () => [] },
    props: {
      type: Object as PropType<CascaderPropsMapping>,
      default: () => ({ label: 'label', value: 'value', children: 'children', disabled: 'disabled', leaf: 'leaf' })
    },
    emitPath: { type: Boolean, default: true },
    multiple: Boolean,
    checkStrictly: Boolean,
    showAllLevels: { type: Boolean, default: true },
    separator: { type: String, default: ' / ' },
    collapseTags: Boolean,
    collapseTagsTooltip: Boolean,
    maxCollapseTagsTooltipHeight: [String, Number],
    tagType: { type: String as PropType<TagType>, default: 'info' },
    tagEffect: { type: String as PropType<'light' | 'dark' | 'plain'>, default: 'light' },
    persistent: { type: Boolean, default: true },
    appendTo: [String, Object] as PropType<string | HTMLElement>,
    placement: { type: String as PropType<Placement>, default: 'bottom-start' },
    fallbackPlacements: { type: Array as PropType<Placement[]>, default: () => ['bottom-start', 'bottom', 'top-start', 'top', 'right', 'left'] },
    popperStyle: [String, Object, Array] as PropType<string | CSSProperties | CSSProperties[]>,
    popperOptions: Object as PropType<FloatingOptions>,
    effect: { type: String as PropType<'light' | 'dark'>, default: 'light' },
    fitInputWidth: [Boolean, Number],
    maxCollapseTags: { type: Number, default: 1 },
    clearable: Boolean,
    emptyValues: Array as PropType<unknown[]>,
    valueOnClear: { type: [String, Number, Boolean, Array, Function], default: undefined },
    disabled: Boolean,
    placeholder: { type: String, default: '请选择' },
    size: String as PropType<Size>,
    filterable: Boolean,
    filterMethod: Function as PropType<CascaderFilterMethod>,
    beforeFilter: Function as PropType<(query: string) => boolean | Promise<boolean>>,
    debounce: { type: Number, default: 300 },
    lazy: Boolean,
    lazyLoad: Function as PropType<CascaderLazyLoad>,
    expandTrigger: { type: String as PropType<'click' | 'hover'>, default: 'click' },
    popperClass: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    teleported: { type: Boolean, default: true },
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'expand-change', 'visible-change', 'remove-tag', 'clear', 'focus', 'blur'],
  setup(props, { attrs, emit, expose, slots }) {
    const field = useField();
    const form = inject(formKey, undefined);
    const config = useConfig();
    const { getValueOnClear, isEmptyValue } = useEmptyValues({
      emptyValues: computed(() => props.emptyValues),
      valueOnClear: computed(() => props.valueOnClear)
    });
    const root = ref<HTMLElement>();
    const reference = ref<HTMLElement>();
    const floating = ref<HTMLElement>();
    const inputRef = ref<HTMLInputElement>();
    const open = ref(false);
    const shownOnce = ref(false);
    const referenceWidth = ref(0);
    const query = ref('');
    const activeValues = ref<CascaderNodeValue[]>([]);
    const panelId = `i-cascader-panel-${Math.random().toString(36).slice(2)}`;

    const isDisabled = () => props.disabled || (field?.disabled?.() ?? form?.disabled?.());

    // 节点建树、勾选级联、半选计算与展开列：与独立面板共享同一实现。
    const nodes = useCascaderNodes({
      options: () => props.options,
      mapping: () => props.props,
      model: () => {
        const value = props.modelValue;
        return typeof value === 'boolean' || isEmptyValue(value) ? null : value;
      },
      multiple: () => props.multiple,
      checkStrictly: () => props.checkStrictly,
      disabled: () => isDisabled() === true,
      lazy: () => props.lazy,
      lazyLoad: () => props.lazyLoad,
      rootLevel: 1
    });
    const { trees, resolveNode, modelItems, selectedNodes, checkState, nodeState, isEffectivelyDisabled } = nodes;

    const nodeValue = (node: CascaderNode): CascaderItemValue =>
      props.emitPath ? node.path.map((item) => item.value) : node.value;

    const displayEntries = computed<{ item: CascaderItemValue; node: CascaderNode | null }[]>(() => {
      const items = props.multiple ? nodes.valueFromChecked(checkState.value.checked, nodeValue) : modelItems.value;
      return items.map((item) => ({ item, node: resolveNode(item) }));
    });

    const entryLabel = (entry: { item: CascaderItemValue; node: CascaderNode | null }): string => {
      if (entry.node) {
        return props.showAllLevels
          ? entry.node.path.map((item) => item.label).join(props.separator)
          : entry.node.label;
      }
      return Array.isArray(entry.item) ? entry.item.join(props.separator) : String(entry.item);
    };

    const tags = computed<CascaderTag[]>(() => displayEntries.value.map((entry) => ({
      node: entry.node,
      key: JSON.stringify(entry.item),
      text: entryLabel(entry),
      hitState: false,
      closable: !isDisabled() && (!entry.node || !isEffectivelyDisabled(entry.node)),
      value: entry.item
    })));

    const renderEntryText = (entry: { item: CascaderItemValue; node: CascaderNode | null }) => {
      if (entry.node && slots.default) return slots.default({ data: entry.node.data, node: entry.node });
      return entryLabel(entry);
    };

    const displayText = computed(() => (displayEntries.value[0] ? entryLabel(displayEntries.value[0]) : ''));

    const columns = computed<CascaderNode[][]>(() => nodes.columns(activeValues.value));

    const expandTo = (node: CascaderNode) => {
      const values = nodes.activePathValues(node);
      if (values.join('\u0000') === activeValues.value.join('\u0000')) return;
      activeValues.value = values;
      emit('expand-change', [...activeValues.value]);
    };

    // 过滤入口：beforeFilter 钩子通过后才进入防抖查询。
    const applyQuery = async (value: string) => {
      if (props.beforeFilter) {
        try {
          if (!(await props.beforeFilter(value))) return;
        } catch {
          return;
        }
      }
      query.value = value;
    };
    let filterTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleQuery = (value: string) => {
      if (filterTimer !== undefined) clearTimeout(filterTimer);
      if (props.debounce > 0) {
        filterTimer = setTimeout(() => {
          filterTimer = undefined;
          void applyQuery(value);
        }, props.debounce);
      } else void applyQuery(value);
    };
    onBeforeUnmount(() => {
      if (filterTimer !== undefined) clearTimeout(filterTimer);
    });

    const suggestionNodes = computed(() => {
      if (!props.filterable || !query.value) return [];
      const candidates: CascaderNode[] = [];
      const collect = (list: CascaderNode[]) =>
        list.forEach((node) => {
          if (props.checkStrictly || node.leaf) candidates.push(node);
          collect(node.children);
        });
      collect(trees.value);
      return candidates.filter((node) =>
        props.filterMethod
          ? props.filterMethod(query.value, node.data, node.path.map((item) => item.data))
          : node.path.some((item) => item.label.includes(query.value))
      );
    });

    const isFiltering = computed(() => props.filterable && query.value.length > 0);

    const position = useFloating({
      open,
      reference,
      floating,
      placement: () => props.popperOptions?.placement ?? props.placement,
      fallbackPlacements: () => props.fallbackPlacements,
      offset: () => props.popperOptions?.offset ?? 4,
      appendTo: () => props.appendTo,
      close: () => setOpen(false),
      closeOnOutside: () => true
    });

    const setOpen = (value: boolean) => {
      if (open.value === value || (value && isDisabled())) return;
      open.value = value;
      if (value) {
        shownOnce.value = true;
        referenceWidth.value = reference.value?.getBoundingClientRect().width ?? 0;
        const node = selectedNodes.value[0];
        activeValues.value = node ? nodes.activePathValues(node) : [];
        nextTick(() => position.update());
      } else {
        query.value = '';
      }
      emit('visible-change', value);
    };

    watch([open, reference], ([opened, target], _, cleanup) => {
      if (!opened || !target || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => { referenceWidth.value = target.getBoundingClientRect().width; });
      observer.observe(target);
      cleanup(() => observer.disconnect());
    });
    watch(isDisabled, (disabled) => { if (disabled) setOpen(false); });

    const update = (value: unknown) => {
      emit('update:modelValue', value);
      emit('change', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };

    const toggleCheck = (node: CascaderNode) => {
      if (!props.multiple || isEffectivelyDisabled(node)) return;
      const { checked, indeterminate } = checkState.value;
      const checking = !(checked.has(node) && !indeterminate.has(node));
      update(nodes.valueFromChecked(nodes.cascadeCheckedSet(checked, node, checking), nodeValue) as CascaderModelValue);
    };

    const selectNode = (node: CascaderNode) => {
      if (isEffectivelyDisabled(node)) return;
      if (props.multiple) {
        toggleCheck(node);
        if (node.children.length) expandTo(node);
        else nodes.ensureChildren(node);
        return;
      }
      // 非懒加载模式下无子级即视为最终选择；懒加载节点先补齐子级再展开。
      if (props.checkStrictly || node.leaf || (!props.lazy && node.children.length === 0)) {
        update(nodeValue(node));
        setOpen(false);
        return;
      }
      nodes.ensureChildren(node);
      expandTo(node);
    };

    const removeTag = (item: CascaderItemValue) => {
      if (!props.multiple || isDisabled()) return;
      const node = resolveNode(item);
      if (node) {
        update(nodes.valueFromChecked(nodes.pruneCheckedSet(checkState.value.checked, node), nodeValue) as CascaderModelValue);
      } else {
        update(modelItems.value.filter((candidate) => candidate !== item) as CascaderModelValue);
      }
      emit('remove-tag', item);
    };

    const clear = () => {
      if (isDisabled()) return;
      update(props.multiple ? [] : getValueOnClear());
      emit('clear');
      query.value = '';
    };

    const syncIndeterminate = (value: boolean) => (el: unknown) => {
      const input = el as HTMLInputElement | null;
      if (input) input.indeterminate = value;
    };

    const focusTarget = () => {
      const target = inputRef.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
      target?.focus();
    };

    const togglePopperVisible = (visible?: boolean) => setOpen(visible ?? !open.value);
    expose({
      focus: focusTarget,
      blur: () => {
        const target = inputRef.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
        target?.blur();
      },
      togglePopperVisibility: togglePopperVisible,
      togglePopperVisible,
      contentRef: floating,
      presentText: computed(() => props.multiple ? '' : displayText.value),
      getCheckedNodes: (leafOnly = false): CascaderNode[] => {
        if (props.multiple) {
          const result: CascaderNode[] = [];
          const walk = (list: CascaderNode[]) =>
            list.forEach((node) => {
              if (checkState.value.checked.has(node) && (!leafOnly || node.leaf)) result.push(node);
              walk(node.children);
            });
          walk(trees.value);
          return result;
        }
        const node = selectedNodes.value[0];
        return node && (!leafOnly || node.leaf) ? [node] : [];
      }
    });

    const renderNode = (node: CascaderNode) => {
      const state = nodeState(node);
      const disabled = isEffectivelyDisabled(node);
      const active = activeValues.value.includes(node.value);
      const singleSelected = !props.multiple && displayEntries.value.some((entry) => entry.node === node);
      return (
        <li
          key={`${node.level}-${String(node.value)}`}
          class={[
            bem('node'),
            active && 'is-active',
            disabled && 'is-disabled',
            (state === 'checked' || singleSelected) && 'is-checked',
            node.loading && 'is-loading'
          ]}
          role='option'
          aria-selected={singleSelected || state === 'checked' || undefined}
          aria-disabled={disabled || undefined}
          onClick={() => selectNode(node)}
          onMouseenter={() => {
            if (props.expandTrigger === 'hover' && !node.leaf && !disabled) {
              nodes.ensureChildren(node);
              expandTo(node);
            }
          }}>
          {props.multiple && (
            <input
              type='checkbox'
              class={bem('checkbox')}
              checked={state === 'checked'}
              disabled={disabled}
              ref={syncIndeterminate(state === 'indeterminate')}
              aria-label={node.label}
              onClick={(event: MouseEvent) => event.stopPropagation()}
              onChange={() => toggleCheck(node)}
            />
          )}
          <span class={bem('label')}>{slots.default?.({ node, data: node.data }) ?? node.label}</span>
          {!node.leaf && (
            <span
              class={bem('expand')}
              aria-hidden='true'
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                nodes.ensureChildren(node);
                expandTo(node);
              }}>
              {node.loading ? '…' : '›'}
            </span>
          )}
        </li>
      );
    };

    const renderTag = (tag: CascaderTag, custom = false) => (
      <span class={bem('tag', { [props.tagEffect]: true, [props.tagType]: true })} key={tag.key}>
        <span class={bem('tag-text')}>{custom ? renderEntryText({ item: tag.value, node: tag.node }) : tag.text}</span>
        {tag.closable && <button type='button' aria-label={`移除 ${tag.text}`} onClick={(event: MouseEvent) => {
          event.stopPropagation();
          removeTag(tag.value);
        }}>×</button>}
      </span>
    );

    return () => {
      const visibleEntries = displayEntries.value;
      const tagEntries = props.collapseTags
        ? visibleEntries.slice(0, props.maxCollapseTags)
        : visibleEntries;
      const width = typeof props.fitInputWidth === 'number' ? props.fitInputWidth : props.fitInputWidth ? referenceWidth.value : 0;
      const panel = open.value || (props.persistent && shownOnce.value) ? (
        <div
          id={panelId}
          ref={floating}
          class={[bem('dropdown'), bem('dropdown', { [props.effect]: true }), props.popperClass]}
          data-placement={position.placement.value}
          aria-hidden={!open.value || undefined}
          style={[position.style.value, props.popperStyle, !open.value ? { display: 'none' } : undefined]}>
          {slots.header?.()}
          {isFiltering.value ? (
            suggestionNodes.value.length ? (
              <ul class={bem('suggestions')} role='listbox' style={width > 0 ? { width: `${width}px` } : undefined}>
                {suggestionNodes.value.map((node) => (
                  <li
                    key={`${node.level}-${String(node.value)}`}
                    class={bem('suggestion')}
                    role='option'
                    onClick={() => selectNode(node)}>
                    {slots['suggestion-item']?.({ item: {
                      ...node,
                      text: entryLabel({ item: nodeValue(node), node }),
                      checked: props.multiple ? checkState.value.checked.has(node) : selectedNodes.value.includes(node)
                    } }) ?? node.path.map((item) => item.label).join(props.separator)}
                  </li>
                ))}
              </ul>
            ) : (
              <div class={bem('empty')}>{slots.empty?.() ?? '无匹配数据'}</div>
            )
          ) : trees.value.length === 0 ? (
            <div class={bem('empty')}>{slots.empty?.() ?? '暂无数据'}</div>
          ) : (
            <div class={bem('menus')}>
              {columns.value.map((list, index) => (
                <ul class={bem('menu')} key={index} role='listbox'>
                  {list.map((node) => renderNode(node))}
                </ul>
              ))}
            </div>
          )}
          {slots.footer?.()}
        </div>
      ) : null;
      const content = props.teleported && panel ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
      return (
        <span
          ref={root}
          class={[
            bem(),
            `i-control--${props.size ?? field?.size?.() ?? form?.size?.() ?? config.value.size}`,
            { 'is-disabled': isDisabled(), 'is-open': open.value }
          ]}>
          <div
            {...attrs}
            ref={reference}
            id={(attrs.id as string) || field?.id}
            class={bem('control')}
            role='combobox'
            tabindex={isDisabled() ? -1 : 0}
            aria-expanded={open.value}
            aria-haspopup='listbox'
            aria-controls={open.value ? panelId : undefined}
            aria-disabled={isDisabled() || undefined}
            aria-invalid={field?.invalid() || undefined}
            aria-describedby={field?.invalid() ? field.errorId : undefined}
            onClick={() => {
              if (!open.value) query.value = '';
              setOpen(!open.value);
            }}
            onFocusin={(event: FocusEvent) => emit('focus', event)}
            onFocusout={(event: FocusEvent) => {
              if (props.validateEvent) field?.validate('blur');
              emit('blur', event);
            }}
            onKeydown={(event: KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
              }
            }}>
            {slots.prefix?.()}
            {props.multiple && (slots.tag
              ? slots.tag({ data: tags.value, deleteTag: (tag: CascaderTag) => {
                if (tag.closable) removeTag(tag.value);
              } })
              : tags.value.slice(0, tagEntries.length).map((tag) => renderTag(tag, true)))}
            {props.multiple && !slots.tag && props.collapseTags && visibleEntries.length > props.maxCollapseTags && (
              props.collapseTagsTooltip ? (
                <Tooltip effect={props.effect} disabled={isDisabled() || open.value}
                  popperClass={props.popperClass} popperStyle={props.popperStyle}>
                  {{
                    default: () => <span class={bem('more')}
                      title={!open.value && !isDisabled() ? visibleEntries.map(entryLabel).join('、') : undefined}>
                      +{visibleEntries.length - props.maxCollapseTags}
                    </span>,
                    content: () => <div style={{
                      maxHeight: typeof props.maxCollapseTagsTooltipHeight === 'number'
                        ? `${props.maxCollapseTagsTooltipHeight}px` : props.maxCollapseTagsTooltipHeight,
                      overflowY: 'auto'
                    }}>
                      {tags.value.slice(props.maxCollapseTags).map((tag) => renderTag(tag))}
                    </div>
                  }}
                </Tooltip>
              ) : (
                <span class={bem('more')}>+{visibleEntries.length - props.maxCollapseTags}</span>
              )
            )}
            {!props.multiple && !props.filterable && (
              <span class={bem('text')}>
                {visibleEntries.length ? (
                  renderEntryText(visibleEntries[0])
                ) : (
                  <span class={bem('placeholder')}>{props.placeholder}</span>
                )}
              </span>
            )}
            {props.multiple && !props.filterable && visibleEntries.length === 0 && (
              <span class={bem('placeholder')}>{props.placeholder}</span>
            )}
            {props.filterable && (
              <input
                ref={inputRef}
                class={bem('input')}
                type='text'
                value={query.value || (props.multiple ? '' : displayText.value)}
                placeholder={props.multiple ? (visibleEntries.length ? '' : props.placeholder) : displayText.value ? '' : props.placeholder}
                disabled={isDisabled()}
                aria-label={props.placeholder}
                onClick={(event: MouseEvent) => event.stopPropagation()}
                onFocus={() => setOpen(true)}
                onInput={(event: Event) => {
                  scheduleQuery((event.target as HTMLInputElement).value);
                  setOpen(true);
                }}
                onKeydown={(event: KeyboardEvent) => {
                  if (event.key === 'Enter' && suggestionNodes.value[0]) {
                    event.preventDefault();
                    selectNode(suggestionNodes.value[0]);
                  }
                }}
              />
            )}
            {props.clearable && visibleEntries.length > 0 && !isDisabled() && (
              <button
                type='button'
                class={bem('clear')}
                aria-label='清空'
                onClick={(event: MouseEvent) => {
                  event.stopPropagation();
                  clear();
                }}>
                ×
              </button>
            )}
            <span class={bem('arrow')} aria-hidden='true'>
              ▾
            </span>
          </div>
          {content}
        </span>
      );
    };
  }
});
