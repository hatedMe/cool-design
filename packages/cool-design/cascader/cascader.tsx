import {
  Teleport,
  computed,
  defineComponent,
  nextTick,
  ref,
  type PropType
} from 'vue';
import { useField } from '../form/context';
import { useConfig, type Size } from '../config-provider/context';
import { useFloating } from '../../../src/utils/use-floating';
import { createNamespace } from '../../../src/utils/create';
import type {
  CascaderFilterMethod,
  CascaderItemValue,
  CascaderModelValue,
  CascaderNode,
  CascaderNodeValue,
  CascaderOption,
  CascaderPropsMapping
} from './types';

const [name, bem] = createNamespace('cascader');

type NodeState = 'checked' | 'indeterminate' | 'unchecked';

export default defineComponent({
  name,
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Array] as PropType<CascaderModelValue>, default: null },
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
    maxCollapseTags: { type: Number, default: 1 },
    clearable: Boolean,
    disabled: Boolean,
    placeholder: { type: String, default: '请选择' },
    size: String as PropType<Size>,
    filterable: Boolean,
    filterMethod: Function as PropType<CascaderFilterMethod>,
    popperClass: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    teleported: { type: Boolean, default: true },
    validateEvent: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'change', 'expand-change', 'visible-change', 'remove-tag', 'clear', 'focus', 'blur'],
  setup(props, { attrs, emit, expose, slots }) {
    const field = useField();
    const config = useConfig();
    const root = ref<HTMLElement>();
    const reference = ref<HTMLElement>();
    const floating = ref<HTMLElement>();
    const inputRef = ref<HTMLInputElement>();
    const open = ref(false);
    const query = ref('');
    const activeValues = ref<CascaderNodeValue[]>([]);
    const panelId = `i-cascader-panel-${Math.random().toString(36).slice(2)}`;

    const isDisabled = () => props.disabled || field?.disabled?.();

    const labelKey = computed(() => props.props?.label || 'label');
    const valueKey = computed(() => props.props?.value || 'value');
    const childrenKey = computed(() => props.props?.children || 'children');
    const disabledKey = computed(() => props.props?.disabled || 'disabled');
    const leafKey = computed(() => props.props?.leaf || 'leaf');

    const createNode = (data: CascaderOption, parent: CascaderNode | null): CascaderNode => {
      const rawChildren = data[childrenKey.value] as CascaderOption[] | undefined;
      const childrenData = Array.isArray(rawChildren) ? rawChildren : [];
      const rawLeaf = data[leafKey.value];
      const node: CascaderNode = {
        value: data[valueKey.value] as CascaderNodeValue,
        label: String(data[labelKey.value] ?? ''),
        disabled: Boolean(data[disabledKey.value]),
        leaf: rawLeaf === undefined ? childrenData.length === 0 : Boolean(rawLeaf),
        level: parent ? parent.level + 1 : 1,
        data,
        parent,
        children: [],
        path: []
      };
      node.path = parent ? [...parent.path, node] : [node];
      node.children = childrenData.map((child) => createNode(child, node));
      return node;
    };

    const trees = computed(() => props.options.map((option) => createNode(option, null)));
    const nodeByValue = computed(() => {
      const map = new Map<CascaderNodeValue, CascaderNode>();
      const walk = (list: CascaderNode[]) =>
        list.forEach((node) => {
          if (node.value !== undefined && node.value !== null && !map.has(node.value)) map.set(node.value, node);
          walk(node.children);
        });
      walk(trees.value);
      return map;
    });

    const resolveNode = (item: CascaderItemValue): CascaderNode | null => {
      if (Array.isArray(item)) {
        let list = trees.value;
        let node: CascaderNode | null = null;
        for (const value of item) {
          node = list.find((candidate) => candidate.value === value) ?? null;
          if (!node) return null;
          list = node.children;
        }
        return node;
      }
      return nodeByValue.value.get(item) ?? null;
    };

    const modelItems = computed<CascaderItemValue[]>(() => {
      const value = props.modelValue;
      if (value === null || value === undefined) return [];
      if (props.multiple) return (Array.isArray(value) ? value : [value]) as CascaderItemValue[];
      return [value as CascaderItemValue];
    });

    const selectedNodes = computed(() =>
      modelItems.value.map(resolveNode).filter((node): node is CascaderNode => !!node)
    );

    const isEffectivelyDisabled = (node: CascaderNode): boolean => {
      if (isDisabled()) return true;
      let cursor: CascaderNode | null = node;
      while (cursor) {
        if (cursor.disabled) return true;
        cursor = cursor.parent;
      }
      return false;
    };

    const checkState = computed(() => {
      const checked = new Set<CascaderNode>();
      const indeterminate = new Set<CascaderNode>();
      if (!props.multiple) return { checked, indeterminate };
      const add = (node: CascaderNode, isRoot: boolean) => {
        if (node.disabled && !isRoot) return;
        checked.add(node);
        node.children.forEach((child) => add(child, false));
      };
      selectedNodes.value.forEach((node) => add(node, true));
      if (props.checkStrictly) return { checked, indeterminate };
      const recalc = (node: CascaderNode) => {
        node.children.forEach(recalc);
        if (node.children.length === 0) return;
        const enabled = node.children.filter((child) => !child.disabled);
        const list = enabled.length ? enabled : node.children;
        if (list.every((child) => checked.has(child))) {
          checked.add(node);
          indeterminate.delete(node);
        } else {
          checked.delete(node);
          if (list.some((child) => checked.has(child) || indeterminate.has(child))) indeterminate.add(node);
          else indeterminate.delete(node);
        }
      };
      trees.value.forEach(recalc);
      return { checked, indeterminate };
    });

    const nodeState = (node: CascaderNode): NodeState => {
      if (checkState.value.checked.has(node)) return 'checked';
      if (checkState.value.indeterminate.has(node)) return 'indeterminate';
      return 'unchecked';
    };

    const nodeValue = (node: CascaderNode): CascaderItemValue =>
      props.emitPath ? node.path.map((item) => item.value) : node.value;

    const valueFromChecked = (set: Set<CascaderNode>): CascaderItemValue[] => {
      const result: CascaderItemValue[] = [];
      const walk = (list: CascaderNode[]) =>
        list.forEach((node) => {
          if (props.checkStrictly) {
            if (set.has(node)) result.push(nodeValue(node));
            walk(node.children);
          } else if (node.leaf) {
            if (set.has(node)) result.push(nodeValue(node));
          } else {
            walk(node.children);
          }
        });
      walk(trees.value);
      return result;
    };

    const displayEntries = computed<{ item: CascaderItemValue; node: CascaderNode | null }[]>(() => {
      const items = props.multiple ? valueFromChecked(checkState.value.checked) : modelItems.value;
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

    const renderEntryText = (entry: { item: CascaderItemValue; node: CascaderNode | null }) => {
      if (entry.node && slots.default) return slots.default({ data: entry.node.data, node: entry.node });
      return entryLabel(entry);
    };

    const displayText = computed(() => (displayEntries.value[0] ? entryLabel(displayEntries.value[0]) : ''));

    const columns = computed<CascaderNode[][]>(() => {
      const result: CascaderNode[][] = [trees.value];
      let list = trees.value;
      for (const value of activeValues.value) {
        const node = list.find((candidate) => candidate.value === value);
        if (!node || node.children.length === 0) break;
        list = node.children;
        result.push(list);
      }
      return result;
    });

    const activePathValues = (node: CascaderNode): CascaderNodeValue[] =>
      (node.children.length ? node.path : node.path.slice(0, -1)).map((item) => item.value);

    const expandTo = (node: CascaderNode) => {
      const values = activePathValues(node);
      if (values.join('\u0000') === activeValues.value.join('\u0000')) return;
      activeValues.value = values;
      emit('expand-change', [...activeValues.value]);
    };

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
      placement: () => 'bottom-start',
      close: () => setOpen(false),
      closeOnOutside: () => true
    });

    const setOpen = (value: boolean) => {
      if (isDisabled() || open.value === value) return;
      open.value = value;
      if (value) {
        const node = selectedNodes.value[0];
        activeValues.value = node ? activePathValues(node) : [];
        nextTick(() => position.update());
      } else {
        query.value = '';
      }
      emit('visible-change', value);
    };

    const update = (value: CascaderModelValue) => {
      emit('update:modelValue', value);
      emit('change', value);
      if (props.validateEvent) nextTick(() => field?.validate('change'));
    };

    const toggleCheck = (node: CascaderNode) => {
      if (!props.multiple || isEffectivelyDisabled(node)) return;
      const { checked, indeterminate } = checkState.value;
      const checking = !(checked.has(node) && !indeterminate.has(node));
      const next = new Set(checked);
      const apply = (target: CascaderNode, value: boolean) => {
        if (target.disabled && target !== node) return;
        if (value) next.add(target);
        else next.delete(target);
        target.children.forEach((child) => apply(child, value));
      };
      if (props.checkStrictly) {
        if (checking) next.add(node);
        else next.delete(node);
      } else {
        apply(node, checking);
        const recalc = (target: CascaderNode) => {
          target.children.forEach(recalc);
          if (target.children.length === 0) return;
          const enabled = target.children.filter((child) => !child.disabled);
          const list = enabled.length ? enabled : target.children;
          if (list.every((child) => next.has(child))) next.add(target);
          else next.delete(target);
        };
        trees.value.forEach(recalc);
      }
      update(valueFromChecked(next));
    };

    const selectNode = (node: CascaderNode) => {
      if (isEffectivelyDisabled(node)) return;
      if (props.multiple) {
        toggleCheck(node);
        if (node.children.length) expandTo(node);
        return;
      }
      if (props.checkStrictly || node.leaf || node.children.length === 0) {
        update(nodeValue(node));
        setOpen(false);
        return;
      }
      expandTo(node);
    };

    const removeTag = (item: CascaderItemValue) => {
      if (!props.multiple || isDisabled()) return;
      const node = resolveNode(item);
      if (node) {
        const next = new Set(checkState.value.checked);
        if (props.checkStrictly) {
          next.delete(node);
        } else {
          const remove = (target: CascaderNode) => {
            next.delete(target);
            target.children.forEach(remove);
          };
          remove(node);
          const recalc = (target: CascaderNode) => {
            target.children.forEach(recalc);
            if (target.children.length === 0) return;
            const enabled = target.children.filter((child) => !child.disabled);
            const list = enabled.length ? enabled : target.children;
            if (list.every((child) => next.has(child))) next.add(target);
            else next.delete(target);
          };
          trees.value.forEach(recalc);
        }
        update(valueFromChecked(next));
      } else {
        update(modelItems.value.filter((candidate) => candidate !== item) as CascaderModelValue);
      }
      emit('remove-tag', item);
    };

    const clear = () => {
      if (isDisabled()) return;
      update(props.multiple ? [] : null);
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

    expose({
      focus: focusTarget,
      blur: () => {
        const target = inputRef.value ?? root.value?.querySelector<HTMLElement>('[role="combobox"]');
        target?.blur();
      },
      togglePopperVisibility: (visible?: boolean) => setOpen(visible ?? !open.value),
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
            (state === 'checked' || singleSelected) && 'is-checked'
          ]}
          role='option'
          aria-selected={singleSelected || state === 'checked' || undefined}
          aria-disabled={disabled || undefined}
          onClick={() => selectNode(node)}>
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
          <span class={bem('label')}>{node.label}</span>
          {!node.leaf && (
            <span
              class={bem('expand')}
              aria-hidden='true'
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                expandTo(node);
              }}>
              ›
            </span>
          )}
        </li>
      );
    };

    return () => {
      const visibleEntries = displayEntries.value;
      const tagEntries = props.collapseTags
        ? visibleEntries.slice(0, props.maxCollapseTags)
        : visibleEntries;
      const panel = open.value ? (
        <div
          id={panelId}
          ref={floating}
          class={[bem('dropdown'), props.popperClass]}
          style={position.style.value}>
          {isFiltering.value ? (
            suggestionNodes.value.length ? (
              <ul class={bem('suggestions')} role='listbox'>
                {suggestionNodes.value.map((node) => (
                  <li
                    key={`${node.level}-${String(node.value)}`}
                    class={bem('suggestion')}
                    role='option'
                    onClick={() => selectNode(node)}>
                    {node.path.map((item) => item.label).join(props.separator)}
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
        </div>
      ) : null;
      const content = props.teleported && panel ? <Teleport to={position.target.value}>{panel}</Teleport> : panel;
      return (
        <span
          ref={root}
          class={[
            bem(),
            `i-control--${props.size || config.value.size}`,
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
            {props.multiple &&
              tagEntries.map((entry) => (
                <span class={bem('tag')} key={`${entry.node ? 'n' : 'v'}-${String(entry.item)}`}>
                  <span class={bem('tag-text')}>{renderEntryText(entry)}</span>
                  {!isDisabled() && (
                    <button
                      type='button'
                      aria-label={`移除 ${entryLabel(entry)}`}
                      onClick={(event: MouseEvent) => {
                        event.stopPropagation();
                        removeTag(entry.item);
                      }}>
                      ×
                    </button>
                  )}
                </span>
              ))}
            {props.multiple && props.collapseTags && visibleEntries.length > props.maxCollapseTags && (
              <span
                class={bem('more')}
                title={props.collapseTagsTooltip ? visibleEntries.map(entryLabel).join('、') : undefined}>
                +{visibleEntries.length - props.maxCollapseTags}
              </span>
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
                  query.value = (event.target as HTMLInputElement).value;
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
