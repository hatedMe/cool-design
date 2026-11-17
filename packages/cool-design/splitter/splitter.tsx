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
  index: number;
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
    const panels = reactive(new Map<number, PanelEntry>());
    const collapsed = new Map<number, number>();
    const sizes = reactive(new Map<number, number>());
    let nextIndex = 0;
    let drag: DragState | null = null;

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
    const minOf = (index: number) => {
      const entry = panels.get(index);
      return entry ? toPx(entry.meta().min, 0) : 0;
    };
    const maxOf = (index: number) => {
      const entry = panels.get(index);
      return entry ? toPx(entry.meta().max, Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
    };
    const resolvedPx = (index: number): number => {
      const entry = panels.get(index);
      const explicit = sizes.get(index);
      if (explicit !== undefined) return explicit;
      if (!entry) return 0;
      const measured = entry.element()?.getBoundingClientRect().width ?? 0;
      return toPx(entry.meta().size, measured || 0);
    };
    const allSizes = () => Array.from(panels.keys()).map((index) => resolvedPx(index));

    const sizeStyle = (index: number) => {
      const entry = panels.get(index);
      const explicit = sizes.get(index);
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

    const applySize = (index: number, value: number) => {
      sizes.set(index, value);
      panels.get(index)?.emitSize(value);
    };

    const clamp = (index: number, value: number) => Math.min(maxOf(index), Math.max(minOf(index), value));

    const onMove = (event: MouseEvent) => {
      if (!drag) return;
      const pos = props.layout === 'vertical' ? event.clientY : event.clientX;
      const delta = pos - drag.startPos;
      const pairTotal = drag.startA + drag.startB;
      let a = clamp(drag.index, drag.startA + delta);
      let b = pairTotal - a;
      if (b < minOf(drag.index + 1) || b > maxOf(drag.index + 1)) {
        b = clamp(drag.index + 1, b);
        a = pairTotal - b;
      }
      const next = { a, b };
      if (props.lazy) drag.pending = next;
      else {
        sizes.set(drag.index, a);
        sizes.set(drag.index + 1, b);
      }
      emit('resize', drag.index, allSizes());
    };
    const onUp = () => {
      if (!drag) return;
      const { index, pending } = drag;
      if (pending) {
        applySize(index, pending.a);
        applySize(index + 1, pending.b);
      } else {
        panels.get(index)?.emitSize(sizes.get(index) ?? resolvedPx(index));
        panels.get(index + 1)?.emitSize(sizes.get(index + 1) ?? resolvedPx(index + 1));
      }
      emit('resize-end', index, allSizes());
      drag = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    const startDrag = (index: number) => (event: MouseEvent) => {
      const left = panels.get(index);
      const right = panels.get(index + 1);
      if (!left || !right || !left.meta().resizable || !right.meta().resizable) return;
      event.preventDefault();
      drag = {
        index,
        startPos: props.layout === 'vertical' ? event.clientY : event.clientX,
        startA: resolvedPx(index),
        startB: resolvedPx(index + 1)
      };
      emit('resize-start', index, allSizes());
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };

    const collapse = (index: number, side: 'start' | 'end') => {
      const target = side === 'end' ? index : index + 1;
      const entry = panels.get(target);
      if (!entry) return;
      const current = resolvedPx(target);
      const preSize = collapsed.get(target);
      if (preSize !== undefined) {
        collapsed.delete(target);
        applySize(target, preSize);
      } else {
        collapsed.set(target, current);
        applySize(target, minOf(target));
      }
      emit('collapse', index);
    };

    provide(splitterKey, {
      layout: () => props.layout,
      lazy: () => props.lazy,
      register: (meta, emitSize, panelSlots, element) => {
        const index = nextIndex++;
        panels.set(index, { meta, emitSize, slots: panelSlots, element });
        return index;
      },
      unregister: (index) => {
        panels.delete(index);
      },
      sizeStyle,
      startDrag,
      collapse
    });

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    });

    const renderDivider = (index: number): VNode => {
      const left = panels.get(index);
      const right = panels.get(index + 1);
      return (
        <div
          class='i-splitter__divider'
          role='separator'
          aria-orientation={props.layout === 'vertical' ? 'horizontal' : 'vertical'}
          onMousedown={startDrag(index)}>
          {left?.meta().collapsible && (
            <button
              type='button'
              class='i-splitter__collapse is-start'
              aria-label='折叠起始面板'
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                collapse(index, 'end');
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
                collapse(index, 'start');
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
