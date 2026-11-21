import {
  Comment,
  defineComponent,
  onBeforeUnmount,
  provide,
  reactive,
  ref,
  type PropType,
  type VNode
} from 'vue';
import { splitterKey, type SplitterLayout, type SplitterPanelMeta, type SplitterSize } from './context';

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

export default defineComponent({
  name: 'i-splitter',
  props: {
    layout: { type: String as PropType<SplitterLayout>, default: 'horizontal' },
    lazy: Boolean
  },
  emits: ['resize-start', 'resize', 'resize-end', 'collapse'],
  setup(props, { slots, emit }) {
    const root = ref<HTMLElement>();
    // 面板以唯一 id 标识，Map 的插入顺序即面板注册顺序（与渲染顺序一致）；
    // 面板增删后 id 不复用，避免分隔条与面板配对错乱
    const panels = reactive(new Map<number, PanelEntry>());
    const collapsed = new Map<number, number>();
    const sizes = reactive(new Map<number, number>());
    let nextId = 0;
    let drag: DragState | null = null;

    const orderedIds = () => Array.from(panels.keys());
    const idAt = (position: number): number | undefined => orderedIds()[position];

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
    const allSizes = () => orderedIds().map((id) => resolvedPx(id));

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
      if (pending) {
        applySize(leftId, pending.a);
        applySize(rightId, pending.b);
      } else {
        panels.get(leftId)?.emitSize(sizes.get(leftId) ?? resolvedPx(leftId));
        panels.get(rightId)?.emitSize(sizes.get(rightId) ?? resolvedPx(rightId));
      }
      emit('resize-end', position, allSizes());
      drag = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
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
      emit('resize-start', position, allSizes());
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };

    const collapse = (position: number, side: 'start' | 'end') => {
      const targetPosition = side === 'end' ? position : position + 1;
      const id = idAt(targetPosition);
      const entry = id !== undefined ? panels.get(id) : undefined;
      if (id === undefined || !entry) return;
      const current = resolvedPx(id);
      const preSize = collapsed.get(id);
      if (preSize !== undefined) {
        collapsed.delete(id);
        applySize(id, preSize);
      } else {
        collapsed.set(id, current);
        applySize(id, minOf(id));
      }
      emit('collapse', position);
    };

    provide(splitterKey, {
      layout: () => props.layout,
      lazy: () => props.lazy,
      register: (meta, emitSize, panelSlots, element) => {
        const id = nextId++;
        panels.set(id, { meta, emitSize, slots: panelSlots, element });
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
      return (
        <div
          class='i-splitter__divider'
          role='separator'
          aria-orientation={props.layout === 'vertical' ? 'horizontal' : 'vertical'}
          onMousedown={startDrag(position)}>
          {left?.meta().collapsible && (
            <button
              type='button'
              class='i-splitter__collapse is-start'
              aria-label='折叠起始面板'
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                collapse(position, 'end');
              }}>
              {left.slots.end?.() ?? '◀'}
            </button>
          )}
          {right?.meta().collapsible && (
            <button
              type='button'
              class='i-splitter__collapse is-end'
              aria-label='折叠结束面板'
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                collapse(position, 'start');
              }}>
              {right.slots.start?.() ?? '▶'}
            </button>
          )}
        </div>
      ) as VNode;
    };

    return () => {
      const children = (slots.default?.() ?? []).filter((child) => child.type !== Comment);
      const rendered: unknown[] = [];
      children.forEach((child, index) => {
        if (index > 0) rendered.push(renderDivider(index - 1));
        rendered.push(child);
      });
      return (
        <div ref={root} class={['i-splitter', `i-splitter--${props.layout}`]}>
          {rendered}
        </div>
      );
    };
  }
});
