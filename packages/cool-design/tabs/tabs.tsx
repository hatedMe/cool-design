import {
  Fragment,
  computed,
  defineComponent,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  watch,
  type CSSProperties,
  type PropType,
  type VNode,
  type VNodeArrayChildren,
  type VNodeChild
} from 'vue';
import TabPaneComponent from './tab-pane';

export type TabsPaneName = string | number;

export interface TabPane {
  name: TabsPaneName;
  label: string;
  disabled?: boolean;
  closable?: boolean;
  lazy?: boolean;
}

export type TabsType = '' | 'default' | 'card' | 'border-card';
export type TabPosition = 'top' | 'right' | 'bottom' | 'left';
export type TabsEditAction = 'add' | 'remove';
export type TabsBeforeLeave = (activeName: TabsPaneName, oldActiveName: TabsPaneName) => boolean | void | Promise<boolean | void>;

export interface TabsClickPane {
  name: TabsPaneName;
  label: string;
  disabled: boolean;
  closable?: boolean;
  lazy: boolean;
  labelSlot?: () => VNodeChild;
  contentSlot?: () => VNodeChild;
}

export interface TabBarInstance {
  readonly ref: HTMLDivElement | undefined;
  update(): CSSProperties;
}

export interface TabNavInstance {
  readonly tabListRef: HTMLDivElement | undefined;
  readonly tabBarRef: TabBarInstance | undefined;
  scrollToActiveTab(): Promise<void>;
  removeFocus(): boolean;
  focusActiveTab(): Promise<void>;
}

interface PaneNode {
  node: VNode;
  scope: string;
}

interface RenderedPane {
  key: string;
  pane: TabsClickPane;
}

const collectPaneNodes = (
  nodes: VNodeArrayChildren,
  encodeKey: (key: NonNullable<VNode['key']>) => string,
  scope = ''
): PaneNode[] => {
  let unkeyedGroupIndex = 0;
  return nodes.flatMap((node) => {
    if (Array.isArray(node)) return collectPaneNodes(node, encodeKey, `${scope}group:${unkeyedGroupIndex++}/`);
    if (!isVNode(node)) return [];
    if (node.type === Fragment && Array.isArray(node.children)) {
      // 无键组按同级无键组的顺序区分，独立页签和有键组的增删不改变其身份。
      const fragmentKey = node.key === null ? `group:${unkeyedGroupIndex++}` : encodeKey(node.key);
      return collectPaneNodes(node.children, encodeKey, `${scope}${fragmentKey}/`);
    }
    return node.type === TabPaneComponent ? [{ node, scope }] : [];
  });
};

const slotFunction = (value: unknown): (() => VNodeChild) | undefined =>
  typeof value === 'function' ? value as () => VNodeChild : undefined;

const isPaneName = (name: unknown): name is TabsPaneName => typeof name === 'string' || typeof name === 'number';
const allowLeave = () => true;

export default defineComponent({
  name: 'i-tabs',
  props: {
    modelValue: { type: [String, Number] as PropType<TabsPaneName>, default: undefined },
    defaultValue: { type: [String, Number] as PropType<TabsPaneName>, default: undefined },
    panes: { type: Array as PropType<TabPane[]>, default: () => [] },
    type: { type: String as PropType<TabsType>, default: '' },
    closable: Boolean,
    addable: Boolean,
    editable: Boolean,
    tabPosition: { type: String as PropType<TabPosition>, default: 'top' },
    stretch: Boolean,
    beforeLeave: { type: Function as PropType<TabsBeforeLeave>, default: allowLeave }
  },
  emits: {
    'update:modelValue': (name: TabsPaneName) => isPaneName(name),
    'tab-click': (pane: TabsClickPane, ev?: Event) => isPaneName(pane.name) && (ev === undefined || ev instanceof Event),
    'tab-change': (name: TabsPaneName) => isPaneName(name),
    'tab-remove': (name: TabsPaneName) => isPaneName(name),
    'tab-add': () => true,
    edit: (name: TabsPaneName | null, action: TabsEditAction) =>
      action === 'add' ? name === null : action === 'remove' && isPaneName(name)
  },
  setup(props, { emit, slots, expose }) {
    const internalActive = ref(props.modelValue ?? props.defaultValue);
    const currentName = computed(() => {
      const selected = props.modelValue ?? internalActive.value;
      if (props.panes.length && (selected === undefined || selected === '')) {
        return props.panes.find((pane) => !pane.disabled)?.name ?? '';
      }
      return selected ?? '0';
    });
    const visited = new Set<string>();
    let renderedPanes: RenderedPane[] = [];
    let symbolKeys = new Map<symbol, number>();
    let nextSymbolKey = 0;
    const navScrollRef = ref<HTMLDivElement>();
    const tabListRef = ref<HTMLDivElement>();
    const tabBarElement = ref<HTMLDivElement>();
    const barStyle = ref<CSSProperties>();
    const focusedTab = ref<TabsPaneName>();
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
    const activeTab = () => tabListRef.value?.querySelector<HTMLElement>(':scope > [role="tab"][aria-selected="true"]');
    const scrollToActiveTab = async () => {
      await nextTick();
      const viewport = navScrollRef.value;
      const tab = activeTab();
      if (!viewport || !tab) return;
      const area = viewport.getBoundingClientRect();
      const bounds = tab.getBoundingClientRect();
      if (isVerticalHeader()) {
        viewport.scrollTop += bounds.top < area.top ? bounds.top - area.top : Math.max(0, bounds.bottom - area.bottom);
      } else {
        viewport.scrollLeft += bounds.left < area.left ? bounds.left - area.left : Math.max(0, bounds.right - area.right);
      }
      updateNavScroll();
    };
    const removeFocus = () => {
      focusedTab.value = undefined;
      return false;
    };
    const focusActiveTab = async () => {
      await nextTick();
      activeTab()?.focus({ preventScroll: true });
    };
    const updateBar = (): CSSProperties => {
      const tab = activeTab();
      const vertical = isVerticalHeader();
      const style = {
        width: vertical ? undefined : `${tab?.clientWidth ?? 0}px`,
        height: vertical ? `${tab?.clientHeight ?? 0}px` : undefined,
        transform: vertical ? `translateY(${tab?.offsetTop ?? 0}px)` : `translateX(${tab?.offsetLeft ?? 0}px)`
      };
      if (style.width !== barStyle.value?.width || style.height !== barStyle.value?.height ||
        style.transform !== barStyle.value?.transform) barStyle.value = style;
      return style;
    };
    const tabBar: TabBarInstance = {
      get ref() { return tabBarElement.value; },
      update: updateBar
    };
    const tabNav: TabNavInstance = {
      get tabListRef() { return tabListRef.value; },
      get tabBarRef() { return tabBarElement.value ? tabBar : undefined; },
      scrollToActiveTab,
      removeFocus,
      focusActiveTab
    };
    let navObserver: ResizeObserver | undefined;
    let observedTab: HTMLElement | undefined | null;
    const updateNav = () => {
      updateNavScroll();
      if (tabBarElement.value) updateBar();
      const tab = activeTab();
      if (tab !== observedTab) {
        if (observedTab) navObserver?.unobserve(observedTab);
        if (tab) navObserver?.observe(tab);
        observedTab = tab;
      }
    };
    onMounted(() => {
      if (typeof ResizeObserver !== 'undefined' && navScrollRef.value && tabListRef.value) {
        navObserver = new ResizeObserver(updateNav);
        navObserver.observe(navScrollRef.value);
        navObserver.observe(tabListRef.value);
      }
      updateNav();
      void scrollToActiveTab();
    });
    onUpdated(updateNav);
    onBeforeUnmount(() => navObserver?.disconnect());

    watch(
      () => props.modelValue,
      (value) => {
        if (value !== undefined) internalActive.value = value;
      }
    );

    const isClosable = (pane: TabsClickPane) =>
      pane.closable ?? (props.closable || props.editable || false);
    const showAdd = computed(() => props.addable || props.editable);

    const setActive = async (name: TabsPaneName, event?: Event) => {
      const target = renderedPanes.find(({ pane }) => pane.name === name)?.pane;
      if (!target || target.disabled) return;
      const oldName = currentName.value;
      if (name === oldName) {
        emit('tab-click', { ...target }, event);
        return;
      }
      if (props.beforeLeave && props.beforeLeave !== allowLeave) {
        try {
          if (await props.beforeLeave(name, oldName) === false) return;
        } catch {
          return;
        }
      }
      internalActive.value = name;
      removeFocus();
      emit('update:modelValue', name);
      emit('tab-click', { ...target }, event);
      emit('tab-change', name);
    };

    const handleRemove = (pane: TabsClickPane, event: Event) => {
      event.stopPropagation();
      emit('tab-remove', pane.name);
      emit('edit', pane.name, 'remove');
      // 受控模式下由外部更新 modelValue；非受控且删除当前项时切到首个可用
      if (props.modelValue === undefined && pane.name === currentName.value) {
        const next = renderedPanes.find(({ pane: item }) => item.name !== pane.name && !item.disabled)?.pane;
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
      const pane = renderedPanes[index]?.pane;
      if (event.key === 'Enter' || event.key === ' ') {
        if (pane && !pane.disabled) {
          event.preventDefault();
          setActive(pane.name);
        }
        return;
      }
      const enabled = renderedPanes.filter(({ pane }) => !pane.disabled);
      if (enabled.length === 0) return;
      const currentPos = enabled.indexOf(renderedPanes[index]);
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
        const targetIndex = renderedPanes.findIndex(({ key }) => key === next.key);
        tabListRef.value?.querySelectorAll<HTMLElement>(':scope > [role="tab"]')[targetIndex]?.focus();
      });
    };

    expose({ currentName, get tabNavRef() { return tabListRef.value ? tabNav : undefined; }, setActive });
    watch(currentName, scrollToActiveTab);

    const normalizedType = computed(() => (props.type === '' ? 'default' : props.type));

    return () => {
      const active = currentName.value;
      const children = slots.default?.({ name: active }) ?? [];
      const currentSymbolKeys = new Map<symbol, number>();
      const encodeKey = (key: NonNullable<VNode['key']>) => {
        if (typeof key === 'string') return `string:${JSON.stringify(key)}`;
        if (typeof key === 'number') return `number:${key}`;
        const id = currentSymbolKeys.get(key) ?? symbolKeys.get(key) ?? nextSymbolKey++;
        currentSymbolKeys.set(key, id);
        return `symbol:${id}`;
      };
      const paneNodes = props.panes.length ? [] : collectPaneNodes(children, encodeKey);
      const panes: RenderedPane[] = paneNodes.length ? paneNodes.map(({ node, scope }, index) => {
        const { name, label, disabled, closable, lazy } = node.props ?? {};
        const paneName = isPaneName(name) ? name : String(index);
        const children = node.children;
        const paneSlots = children && typeof children === 'object' && !Array.isArray(children) ? children : undefined;
        return {
          key: `${scope}${node.key === null ? `name:${encodeKey(paneName)}` : encodeKey(node.key)}`,
          pane: {
            name: paneName,
            label: typeof label === 'string' ? label : '',
            disabled: disabled === '' || !!disabled,
            closable: closable === '' ? true : typeof closable === 'boolean' ? closable : undefined,
            lazy: lazy === '' || !!lazy,
            labelSlot: slotFunction(paneSlots?.label),
            contentSlot: slotFunction(paneSlots?.default) ??
              (Array.isArray(children) || typeof children === 'string' ? () => children : undefined)
          }
        };
      }) : props.panes.map(({ name, label, disabled, closable, lazy }) =>
        ({ key: `name:${encodeKey(name)}`, pane: { name, label, disabled: !!disabled, closable, lazy: !!lazy } }));
      // 事件只读取最近一次渲染得到的页签，避免在事件和侦听器中执行插槽。
      renderedPanes = panes;
      symbolKeys = currentSymbolKeys;
      const headerPosition = props.tabPosition ?? 'top';
      const vertical = headerPosition === 'left' || headerPosition === 'right';

      const header = (
        <div
          key='header'
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
          <div class='i-tabs__nav-scroll' ref={navScrollRef} onScroll={updateNavScroll}>
            <div
              class='i-tabs__nav'
              ref={tabListRef}
              role='tablist'
              aria-orientation={vertical ? 'vertical' : 'horizontal'}>
              {normalizedType.value === 'default' && panes.length > 0 && (
                <div class='i-tabs__active-bar' ref={tabBarElement} style={barStyle.value} aria-hidden='true' />
              )}
              {panes.map(({ pane, key }, index) => {
                const isActive = pane.name === active;
                const closable = isClosable(pane);
                return (
                  <div
                    key={key}
                    role='tab'
                    data-tabs-tab={String(pane.name)}
                    id={`i-tabs-tab-${String(pane.name)}`}
                    aria-selected={isActive}
                    aria-disabled={pane.disabled || undefined}
                    aria-controls={`i-tabs-panel-${String(pane.name)}`}
                    tabindex={pane.disabled ? -1 : isActive ? 0 : -1}
                    class={{ 'i-tabs__item': true, 'is-active': isActive, 'is-disabled': pane.disabled, 'is-focus': focusedTab.value === pane.name }}
                    onFocus={() => { focusedTab.value = pane.name; }}
                    onBlur={removeFocus}
                    onClick={(event) => { removeFocus(); return setActive(pane.name, event); }}
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
        <div class='i-tabs__content' key='content'>
          {paneNodes.length
            ? panes.map(({ pane, key }) => {
                const isActive = pane.name === active;
                const shouldRender = !pane.lazy || isActive || visited.has(key);
                if (!shouldRender) return null;
                const visit = () => { if (isActive) visited.add(key); };
                const hooks = {
                  onVnodeMounted: visit,
                  onVnodeUpdated: visit,
                  onVnodeUnmounted: () => { visited.delete(key); }
                };
                return (
                  <div
                    key={key}
                    role='tabpanel'
                    id={`i-tabs-panel-${String(pane.name)}`}
                    aria-labelledby={`i-tabs-tab-${String(pane.name)}`}
                    hidden={!isActive}
                    class={{ 'i-tabs__pane': true, 'is-active': isActive }}
                    {...hooks}>
                    {pane.contentSlot?.()}
                  </div>
                );
              })
            : (
                <div
                  role='tabpanel'
                  id={`i-tabs-panel-${String(active)}`}
                  aria-labelledby={`i-tabs-tab-${String(active)}`}
                  class='i-tabs__pane is-active'>
                  {children}
                </div>
              )}
        </div>
      );

      return (
        <div
          class={{
            'i-tabs': true,
            [`is-${normalizedType.value}`]: true,
            [`is-${headerPosition}`]: true
          }}>
          {headerPosition === 'bottom' || headerPosition === 'right' ? [content, header] : [header, content]}
        </div>
      );
    };
  }
});
