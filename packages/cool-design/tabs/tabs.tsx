import {
  Comment,
  Fragment,
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
  type Slot,
  type VNode
} from 'vue';

export interface TabPane {
  name: string | number;
  label: string;
  disabled?: boolean;
  closable?: boolean;
  lazy?: boolean;
}

export type TabsType = '' | 'default' | 'card' | 'border-card';
export type TabPosition = 'top' | 'right' | 'bottom' | 'left';
export type TabsEditAction = 'add' | 'remove';

interface NormalizedPane {
  name: string | number;
  label: string;
  disabled: boolean;
  closable?: boolean;
  lazy: boolean;
  labelSlot?: Slot;
  contentSlot?: Slot;
}

const flatten = (nodes: VNode[]): VNode[] => {
  const result: VNode[] = [];
  nodes.forEach((node) => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      result.push(...flatten(node.children as VNode[]));
    } else if (node.type !== Comment) {
      result.push(node);
    }
  });
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPaneVNode = (node: VNode): boolean => (node.type as any)?.name === 'i-tab-pane';

export default defineComponent({
  name: 'i-tabs',
  props: {
    modelValue: { type: [String, Number] as PropType<string | number>, default: undefined },
    defaultValue: { type: [String, Number] as PropType<string | number>, default: undefined },
    panes: { type: Array as PropType<TabPane[]>, default: () => [] },
    type: { type: String as PropType<TabsType>, default: '' },
    closable: Boolean,
    addable: Boolean,
    editable: Boolean,
    tabPosition: { type: String as PropType<TabPosition>, default: 'top' },
    stretch: Boolean,
    beforeLeave: {
      type: Function as PropType<
        (activeName: string | number, oldActiveName: string | number) => boolean | Promise<boolean> | void
      >,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'tab-click', 'tab-change', 'tab-remove', 'tab-add', 'edit'],
  setup(props, { emit, slots, expose }) {
    const internalActive = ref<string | number>(props.modelValue ?? props.defaultValue ?? '');
    const visited = ref<Set<string | number>>(new Set());
    const rootRef = ref<HTMLElement>();
    const navScrollRef = ref<HTMLElement>();
    const navScrollable = ref(false);
    const navAtStart = ref(true);
    const navAtEnd = ref(true);

    const isVerticalHeader = () => props.tabPosition === 'left' || props.tabPosition === 'right';
    // 页签溢出时显示左右（上下）滚动箭头，箭头到边界时禁用。
    const updateNavScroll = () => {
      const el = navScrollRef.value;
      if (!el) return;
      if (isVerticalHeader()) {
        navScrollable.value = el.scrollHeight > el.clientHeight + 1;
        navAtStart.value = el.scrollTop <= 0;
        navAtEnd.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      } else {
        navScrollable.value = el.scrollWidth > el.clientWidth + 1;
        navAtStart.value = el.scrollLeft <= 0;
        navAtEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      }
    };
    const scrollNav = (direction: 1 | -1) => {
      const el = navScrollRef.value;
      if (!el) return;
      const delta = (isVerticalHeader() ? el.clientHeight : el.clientWidth) * 0.6;
      if (isVerticalHeader()) el.scrollTop += direction * delta;
      else el.scrollLeft += direction * delta;
      // 同步设置 scroll 偏移不一定派发 scroll 事件，主动刷新一次边界状态。
      updateNavScroll();
    };
    let navObserver: ResizeObserver | undefined;
    const scrollHandler = () => updateNavScroll();
    onMounted(() => {
      const el = navScrollRef.value;
      el?.addEventListener('scroll', scrollHandler);
      if (typeof ResizeObserver !== 'undefined' && el) {
        navObserver = new ResizeObserver(() => updateNavScroll());
        navObserver.observe(el);
      }
      updateNavScroll();
    });
    onBeforeUnmount(() => {
      navScrollRef.value?.removeEventListener('scroll', scrollHandler);
      navObserver?.disconnect();
      navObserver = undefined;
    });

    const normalizedFromProps = computed<NormalizedPane[]>(() =>
      props.panes.map((pane) => ({
        name: pane.name,
        label: pane.label,
        disabled: !!pane.disabled,
        closable: pane.closable,
        lazy: !!pane.lazy
      }))
    );

    const getPaneVNodes = (): VNode[] => {
      // panes 模式下默认插槽为内容渲染函数（接收 { name }），需要避免误解析
      if (props.panes.length > 0) return [];
      const children = flatten(((slots.default?.() ?? []) as VNode[]).filter(Boolean));
      return children.filter(isPaneVNode);
    };

    const normalized = computed<NormalizedPane[]>(() => {
      const vnodes = getPaneVNodes();
      if (vnodes.length > 0) {
        return vnodes.map((node, index) => {
          const nodeProps = (node.props ?? {}) as Record<string, unknown>;
          const nodeSlots = node.children as unknown as Record<string, Slot | undefined>;
          const getSlot = (slotName: string): Slot | undefined => {
            const slot = nodeSlots?.[slotName];
            return typeof slot === 'function' ? slot : undefined;
          };
          const rawName = nodeProps.name as string | number | undefined;
          return {
            name: rawName !== undefined && rawName !== '' ? rawName : String(index),
            label: (nodeProps.label as string) ?? '',
            disabled: !!(nodeProps.disabled as boolean),
            closable: nodeProps.closable as boolean | undefined,
            lazy: !!(nodeProps.lazy as boolean),
            labelSlot: getSlot('label'),
            contentSlot: getSlot('default')
          };
        });
      }
      return normalizedFromProps.value;
    });

    const activeName = computed<string | number>(() => {
      const controlled = props.modelValue;
      const current = controlled !== undefined ? controlled : internalActive.value;
      if (current !== '' && current !== undefined) return current;
      const firstEnabled = normalized.value.find((pane) => !pane.disabled);
      return firstEnabled?.name ?? '';
    });

    watch(
      activeName,
      (value) => {
        if (value !== '' && value !== undefined) visited.value.add(value);
      },
      { immediate: true }
    );
    watch(
      () => props.modelValue,
      (value) => {
        if (value !== undefined) internalActive.value = value;
      }
    );

    const isClosable = (pane: NormalizedPane) =>
      pane.closable ?? (props.closable || props.editable || false);
    const showAdd = computed(() => props.addable || props.editable);

    const setActive = async (name: string | number, event?: Event) => {
      const target = normalized.value.find((pane) => pane.name === name);
      if (!target || target.disabled) return;
      const oldName = activeName.value;
      if (name === oldName) {
        emit('tab-click', { ...target }, event);
        return;
      }
      if (props.beforeLeave) {
        const result = await props.beforeLeave(name, oldName);
        if (result === false) return;
      }
      internalActive.value = name;
      visited.value.add(name);
      emit('update:modelValue', name);
      emit('tab-click', { ...target }, event);
      emit('tab-change', name);
    };

    const handleRemove = (pane: NormalizedPane, event: Event) => {
      event.stopPropagation();
      emit('tab-remove', pane.name);
      emit('edit', pane.name, 'remove');
      // 受控模式下由外部更新 modelValue；非受控且删除当前项时切到首个可用
      if (props.modelValue === undefined && pane.name === activeName.value) {
        const next = normalized.value.find((item) => item.name !== pane.name && !item.disabled);
        if (next) {
          internalActive.value = next.name;
          emit('update:modelValue', next.name);
          emit('tab-change', next.name);
        }
      }
    };

    const handleAdd = () => {
      emit('tab-add');
      emit('edit', null, 'add');
    };

    const handleKeydown = (event: KeyboardEvent, index: number) => {
      const pane = normalized.value[index];
      if (event.key === 'Enter' || event.key === ' ') {
        if (pane && !pane.disabled) {
          event.preventDefault();
          setActive(pane.name);
        }
        return;
      }
      const enabled = normalized.value
        .map((pane, paneIndex) => ({ pane, paneIndex }))
        .filter(({ pane }) => !pane.disabled);
      if (enabled.length === 0) return;
      const currentPos = enabled.findIndex(({ paneIndex }) => paneIndex === index);
      let nextPos: number;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextPos = (currentPos + 1) % enabled.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
        nextPos = (currentPos - 1 + enabled.length) % enabled.length;
      else if (event.key === 'Home') nextPos = 0;
      else if (event.key === 'End') nextPos = enabled.length - 1;
      else return;
      event.preventDefault();
      const next = enabled[nextPos];
      setActive(next.pane.name);
      // 键盘切换后在当前实例内聚焦对应页签，避免同页多个 Tabs 同名页签互相干扰
      requestAnimationFrame(() => {
        const el = rootRef.value?.querySelector<HTMLElement>(
          `[data-tabs-tab="${String(next.pane.name).replace(/"/g, '\\"')}"]`
        );
        el?.focus();
      });
    };

    expose({ setActive });

    watch(
      // 页签数量或位置变化后重新评估溢出状态。
      () => [normalized.value.length, props.tabPosition],
      async () => {
        await nextTick();
        updateNavScroll();
      }
    );
    // 切换页签时把激活页签滚动进可视区。
    watch(
      () => activeName.value,
      async () => {
        await nextTick();
        const el = navScrollRef.value;
        const activeTab = el?.querySelector<HTMLElement>('[aria-selected="true"]');
        activeTab?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      }
    );

    const normalizedType = computed(() => (props.type === '' ? 'default' : props.type));

    return () => {
      const vnodes = getPaneVNodes();
      const usePaneVNodes = vnodes.length > 0;
      const panes = normalized.value;
      const active = activeName.value;
      const headerPosition = props.tabPosition ?? 'top';
      const vertical = headerPosition === 'left' || headerPosition === 'right';

      const header = (
        <div
          class={{
            'i-tabs__header': true,
            [`is-${headerPosition}`]: true,
            'is-stretch': props.stretch
          }}>
          {navScrollable.value && (
            <button
              type='button'
              class={{ 'i-tabs__nav-prev': true, 'is-disabled': navAtStart.value }}
              aria-label='上一个可视页签'
              disabled={navAtStart.value}
              onClick={() => scrollNav(-1)}>
              ‹
            </button>
          )}
          <div class='i-tabs__nav-scroll' ref={navScrollRef}>
            <div
              class='i-tabs__nav'
              role='tablist'
              aria-orientation={vertical ? 'vertical' : 'horizontal'}>
              {panes.map((pane, index) => {
                const isActive = pane.name === active;
                const closable = isClosable(pane);
                return (
                  <div
                    key={String(pane.name)}
                    role='tab'
                    data-tabs-tab={String(pane.name)}
                    id={`i-tabs-tab-${String(pane.name)}`}
                    aria-selected={isActive}
                    aria-disabled={pane.disabled || undefined}
                    aria-controls={`i-tabs-panel-${String(pane.name)}`}
                    tabindex={pane.disabled ? -1 : isActive ? 0 : -1}
                    class={{ 'i-tabs__item': true, 'is-active': isActive, 'is-disabled': pane.disabled }}
                    onClick={(event) => setActive(pane.name, event)}
                    onKeydown={(event) => handleKeydown(event, index)}>
                    <span class='i-tabs__label'>{pane.labelSlot?.() ?? pane.label}</span>
                    {closable && (
                      <span
                        class='i-tabs__close'
                        role='button'
                        aria-label={`关闭${pane.label || pane.name}`}
                        tabindex={pane.disabled ? -1 : 0}
                        onClick={(event) => handleRemove(pane, event)}
                        onKeydown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleRemove(pane, event);
                          }
                        }}>
                        ×
                      </span>
                    )}
                  </div>
                );
              })}
              {showAdd.value && (
                <button type='button' class='i-tabs__add' aria-label='新增页签' onClick={handleAdd}>
                  {slots['add-icon']?.() ?? '+'}
                </button>
              )}
            </div>
          </div>
          {navScrollable.value && (
            <button
              type='button'
              class={{ 'i-tabs__nav-next': true, 'is-disabled': navAtEnd.value }}
              aria-label='下一个可视页签'
              disabled={navAtEnd.value}
              onClick={() => scrollNav(1)}>
              ›
            </button>
          )}
        </div>
      );

      const content = (
        <div class='i-tabs__content'>
          {usePaneVNodes
            ? panes.map((pane) => {
                const isActive = pane.name === active;
                const shouldRender = !pane.lazy || isActive || visited.value.has(pane.name);
                if (!shouldRender) return null;
                return (
                  <div
                    key={String(pane.name)}
                    role='tabpanel'
                    id={`i-tabs-panel-${String(pane.name)}`}
                    aria-labelledby={`i-tabs-tab-${String(pane.name)}`}
                    hidden={!isActive}
                    class={{ 'i-tabs__pane': true, 'is-active': isActive }}>
                    {pane.contentSlot?.()}
                  </div>
                );
              })
            : (() => {
                // 兼容旧用法：默认插槽接收当前 name
                const scopeSlots = slots as unknown as Record<string, Slot | undefined>;
                // panes 模式下 slots.default 是内容函数，直接渲染
                const renderDefault = (slots.default as unknown as Slot | undefined)?.({ name: active } as never);
                void scopeSlots;
                return (
                  <div
                    role='tabpanel'
                    id={`i-tabs-panel-${String(active)}`}
                    aria-labelledby={`i-tabs-tab-${String(active)}`}
                    class='i-tabs__pane is-active'>
                    {renderDefault}
                  </div>
                );
              })()}
        </div>
      );

      return (
        <div
          ref={rootRef}
          class={{
            'i-tabs': true,
            [`is-${normalizedType.value}`]: true,
            [`is-${headerPosition}`]: true
          }}>
          {headerPosition === 'bottom' || headerPosition === 'right' ? (
            <>
              {content}
              {header}
            </>
          ) : (
            <>
              {header}
              {content}
            </>
          )}
        </div>
      );
    };
  }
});
