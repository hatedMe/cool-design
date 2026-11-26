import {
  Fragment,
  h,
  isVNode,
  onMounted,
  onUpdated,
  watch,
  defineComponent,
  onBeforeUnmount,
  provide,
  reactive,
  ref,
  type PropType,
  type VNode,
  type VNodeChild
} from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import { splitterKey, type SplitterLayout, type SplitterPanelMeta, type SplitterSize } from './context';
import SplitterPanel from './splitter-panel';

interface PanelEntry {
  meta: () => SplitterPanelMeta;
  emitSize: (size: number) => void;
  slots: { start?: () => unknown; end?: () => unknown };
  element: () => HTMLElement | undefined;
}

interface DragState {
  /** 分隔条位置（左侧面板在面板序列中的序号），仅用于事件载荷 */
  position: number;
  leftId: number;
  rightId: number;
  startPos: number;
  startA: number;
  startB: number;
  pending?: { a: number; b: number };
}

const validResize = (index: number, sizes: number[]) => Number.isInteger(index) && Array.isArray(sizes);

export default defineComponent({
  name: 'i-splitter',
  props: {
    layout: { type: String as PropType<SplitterLayout>, default: 'horizontal' },
    lazy: Boolean
  },
  emits: {
    'resize-start': validResize,
    resize: validResize,
    'resize-end': validResize,
    collapse: (index: number, type: 'start' | 'end', sizes: number[]) =>
      validResize(index, sizes) && (type === 'start' || type === 'end')
  },
  setup(props, { slots, emit }) {
    const ns = useNamespace('splitter');
    const root = ref<HTMLElement>();
    const panels = reactive(new Map<number, PanelEntry>());
    const collapsed = reactive(new Map<number, number>());
    const sizes = reactive(new Map<number, number>());
    const order = ref<number[]>([]);
    let leaves: VNode[] = [];
    const wrappedPositions = ref<number[]>([]);
    let drag: DragState | null = null;

    const idAt = (position: number): number | undefined => order.value[position];
    const syncOrder = () => {
      const ids = new Map(Array.from(panels, ([id, entry]) => [entry.element(), id]));
      const next: number[] = [];
      const wrapped: number[] = [];
      leaves.forEach((node, index) => {
        // Vue 完成渲染后才识别单根包装组件中的面板。
        const id = node.el && ids.get(node.el as HTMLElement);
        if (typeof id !== 'number') return;
        next.push(id);
        if (node.type !== SplitterPanel) wrapped.push(index);
      });
      if (wrapped.length !== wrappedPositions.value.length ||
          wrapped.some((index, i) => wrappedPositions.value[i] !== index)) {
        wrappedPositions.value = wrapped;
      }
      if (next.length === order.value.length && next.every((id, index) => idAt(index) === id)) return;
      order.value = next;
      if (drag && (next[drag.position] !== drag.leftId || next[drag.position + 1] !== drag.rightId)) stopDrag();
    };
    onMounted(syncOrder);
    onUpdated(syncOrder);
    watch(() => panels.size, syncOrder, { flush: 'post' });

    const total = () => {
      const element = root.value;
      if (!element) return 0;
      return props.layout === 'vertical' ? element.clientHeight : element.clientWidth;
    };
    const toPx = (value: SplitterSize, fallback: number): number => {
      if (value === undefined || value === null || value === '') return fallback;
      if (typeof value === 'number') return value;
      const text = String(value).trim();
      if (text.endsWith('%')) return (parseFloat(text) / 100) * (total() || 0);
      const px = parseFloat(text);
      return Number.isFinite(px) ? px : fallback;
    };
    const minOf = (id: number) => {
      const entry = panels.get(id);
      return entry ? toPx(entry.meta().min, 0) : 0;
    };
    const maxOf = (id: number) => {
      const entry = panels.get(id);
      return entry ? toPx(entry.meta().max, Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
    };
    const resolvedPx = (id: number): number => {
      const entry = panels.get(id);
      const explicit = sizes.get(id);
      if (explicit !== undefined) return explicit;
      if (!entry) return 0;
      const element = entry.element();
      const rect = element?.getBoundingClientRect();
      const measured = props.layout === 'vertical' ? rect?.height : rect?.width;
      return toPx(entry.meta().size, measured || 0);
    };
    const allSizes = () => order.value.map((id) => resolvedPx(id));

    const sizeStyle = (id: number) => {
      const entry = panels.get(id);
      const explicit = sizes.get(id);
      if (explicit !== undefined) return { flex: `0 0 ${explicit}px`, minWidth: '0', minHeight: '0' };
      const prop = entry?.meta().size;
      if (prop === undefined || prop === null || prop === '') {
        return { flex: '1 1 0', minWidth: '0', minHeight: '0' };
      }
      return {
        flex: `0 0 ${typeof prop === 'number' ? `${prop}px` : prop}`,
        minWidth: '0',
        minHeight: '0'
      };
    };

    const applySize = (id: number, value: number) => {
      sizes.set(id, value);
      panels.get(id)?.emitSize(value);
    };

    const clamp = (id: number, value: number) => Math.min(maxOf(id), Math.max(minOf(id), value));

    const onMove = (event: MouseEvent) => {
      if (!drag) return;
      const pos = props.layout === 'vertical' ? event.clientY : event.clientX;
      const delta = pos - drag.startPos;
      const pairTotal = drag.startA + drag.startB;
      let a = clamp(drag.leftId, drag.startA + delta);
      let b = pairTotal - a;
      if (b < minOf(drag.rightId) || b > maxOf(drag.rightId)) {
        b = clamp(drag.rightId, b);
        a = pairTotal - b;
      }
      const next = { a, b };
      if (props.lazy) drag.pending = next;
      else {
        sizes.set(drag.leftId, a);
        sizes.set(drag.rightId, b);
      }
      emit('resize', drag.position, allSizes());
    };
    const onUp = () => {
      if (!drag) return;
      const { leftId, rightId, position, pending } = drag;
      stopDrag();
      if (pending) {
        applySize(leftId, pending.a);
        applySize(rightId, pending.b);
      } else {
        panels.get(leftId)?.emitSize(sizes.get(leftId) ?? resolvedPx(leftId));
        panels.get(rightId)?.emitSize(sizes.get(rightId) ?? resolvedPx(rightId));
      }
      emit('resize-end', position, allSizes());
    };
    const stopDrag = () => {
      drag = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    const startDrag = (position: number) => (event: MouseEvent) => {
      // 按当前面板顺序解析分隔条两侧的面板，面板增删后依然配对正确
      const leftId = idAt(position);
      const rightId = idAt(position + 1);
      const left = leftId !== undefined ? panels.get(leftId) : undefined;
      const right = rightId !== undefined ? panels.get(rightId) : undefined;
      if (leftId === undefined || rightId === undefined || !left || !right) return;
      if (!left.meta().resizable || !right.meta().resizable) return;
      event.preventDefault();
      drag = {
        position,
        leftId,
        rightId,
        startPos: props.layout === 'vertical' ? event.clientY : event.clientX,
        startA: resolvedPx(leftId),
        startB: resolvedPx(rightId)
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      emit('resize-start', position, allSizes());
    };

    const collapse = (position: number, side: 'start' | 'end') => {
      const id = idAt(side === 'start' ? position : position + 1);
      const other = idAt(side === 'start' ? position + 1 : position);
      if (id === undefined || other === undefined) return;
      const current = resolvedPx(id);
      const neighbor = resolvedPx(other);
      const previous = collapsed.get(id);
      let direction = side;
      if (previous !== undefined && !current) {
        direction = side === 'start' ? 'end' : 'start';
        const restored = Math.min(previous, neighbor);
        applySize(id, restored);
        applySize(other, neighbor - restored);
        collapsed.delete(id);
      } else if (current > 0 && neighbor > 0) {
        collapsed.set(id, current);
        applySize(id, 0);
        applySize(other, neighbor + current);
      } else return;
      emit('collapse', position, direction, allSizes());
    };

    provide(splitterKey, {
      layout: () => props.layout,
      lazy: () => props.lazy,
      register: (id, meta, emitSize, panelSlots, element) => {
        panels.set(id, { meta, emitSize, slots: panelSlots, element });
        // 注册在面板的 setup 中调用，监听随面板卸载自动释放。
        watch(() => meta().size, (size) => {
          if (typeof size === 'number' && size === sizes.get(id)) return;
          if (collapsed.has(id) && sizes.get(id) === 0 && typeof size === 'string' && parseFloat(size) === 0) return;
          sizes.delete(id);
          collapsed.delete(id);
        });
        return id;
      },
      unregister: (id) => {
        panels.delete(id);
        sizes.delete(id);
        collapsed.delete(id);
        // 面板被移除时终止涉及它的拖拽
        if (drag && (drag.leftId === id || drag.rightId === id)) stopDrag();
      },
      sizeStyle,
      startDrag,
      collapse
    });

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    });

    const renderDivider = (position: number): VNode => {
      const leftId = idAt(position);
      const rightId = idAt(position + 1);
      const left = leftId !== undefined ? panels.get(leftId) : undefined;
      const right = rightId !== undefined ? panels.get(rightId) : undefined;
      const leftFolded = leftId !== undefined && collapsed.has(leftId) && sizes.get(leftId) === 0;
      const rightFolded = rightId !== undefined && collapsed.has(rightId) && sizes.get(rightId) === 0;
      const startArrow = props.layout === 'vertical' ? '▲' : '◀';
      const endArrow = props.layout === 'vertical' ? '▼' : '▶';
      return (
        <div
          class={ns.e('divider')}
          role='separator'
          aria-orientation={props.layout === 'vertical' ? 'horizontal' : 'vertical'}
          onMousedown={startDrag(position)}>
          {left?.meta().collapsible && !rightFolded && (
            <button
              type='button'
              class={[ns.e('collapse'), 'is-start', { 'is-collapsed': leftFolded }]}
              onMousedown={(event: MouseEvent) => event.stopPropagation()}
              aria-label={leftFolded ? '恢复起始面板' : '折叠起始面板'}
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                collapse(position, 'start');
              }}>
              {left.slots.end?.() ?? (leftFolded ? endArrow : startArrow)}
            </button>
          )}
          {right?.meta().collapsible && !leftFolded && (
            <button
              type='button'
              class={[ns.e('collapse'), 'is-end', { 'is-collapsed': rightFolded }]}
              onMousedown={(event: MouseEvent) => event.stopPropagation()}
              aria-label={rightFolded ? '恢复结束面板' : '折叠结束面板'}
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                collapse(position, 'end');
              }}>
              {right.slots.start?.() ?? (rightFolded ? startArrow : endArrow)}
            </button>
          )}
        </div>
      ) as VNode;
    };

    return () => {
      let position = 0;
      leaves = [];
      const renderChild = (child: VNodeChild): VNodeChild => {
        if (Array.isArray(child)) return child.map(renderChild);
        if (!isVNode(child)) return child;
        if (child.type === Fragment && Array.isArray(child.children)) {
          // 保留 Fragment 自身的键和插槽作用域，交给 Vue 匹配各层子节点。
          type SlotFragment = VNode & { slotScopeIds?: string[] | null };
          const group = h(Fragment, { key: child.key ?? undefined }, child.children.map(renderChild)) as SlotFragment;
          group.slotScopeIds = (child as SlotFragment).slotScopeIds;
          return group;
        }
        if (typeof child.type !== 'object' && typeof child.type !== 'function') return child;
        const leaf = leaves.push(child) - 1;
        const panel = child.type === SplitterPanel || wrappedPositions.value.includes(leaf);
        const divider = panel && position > 0 ? renderDivider(position - 1) : null;
        if (panel) position++;
        return h(Fragment, { key: child.key ?? undefined }, [divider, child]);
      };
      const rendered = slots.default?.().map(renderChild);
      return (
        <div ref={root} class={[ns.b(), ns.m(props.layout)]}>
          {rendered}
        </div>
      );
    };
  }
});
