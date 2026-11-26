import {
  Comment, Fragment, Teleport, computed, defineComponent, h, inject, isVNode,
  nextTick, normalizeClass, normalizeStyle, onBeforeUnmount, onMounted, onUpdated, provide, ref,
  shallowReactive, shallowRef, type VNode
} from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import Tooltip, { type TooltipInstance } from '../tooltip';
import { menuBranchKey, menuKey } from './context';

// 浮层嵌套单独传递，业务 indexPath 仍由原来的 SubMenu 提供。
const Entry = defineComponent({
  props: { overflow: Boolean, visible: Boolean },
  emits: ['hold', 'leave'],
  setup(props, { slots, emit }) {
    const sub = useNamespace('sub-menu');
    const owner = inject(menuKey);
    provide(menuBranchKey, {
      overflow: computed(() => props.overflow),
      expanded: computed(() => !props.overflow || props.visible),
      hold: () => { if (props.overflow) emit('hold'); },
      leave: () => { if (props.overflow) emit('leave'); },
      popupGroupClass(namespace, menu) {
        if (props.overflow && owner === menu && namespace !== sub.namespace.value) return sub.e('popup-group');
      }
    });
    return () => slots.default?.();
  }
});
export default defineComponent({
  name: 'MenuOverflow',
  setup(_, { slots, expose }) {
    const menu = inject(menuKey)!;
    const ns = useNamespace('menu');
    const sub = useNamespace('sub-menu');
    const list = shallowRef<HTMLElement>();
    const more = shallowRef<HTMLButtonElement>();
    const panel = shallowRef<TooltipInstance>();
    const targets = shallowReactive(new Map<number, Element>());
    const rows = new Set<HTMLElement>();
    const cutoff = ref(Infinity);
    const open = ref(false);
    let observer: ResizeObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clear = () => clearTimeout(timer);
    const close = () => {
      clear();
      if (open.value && panel.value?.popperRef.contentRef?.contains(document.activeElement)) {
        more.value?.focus({ preventScroll: true });
      }
      open.value = false;
    };
    const measureAtRoot = (root: HTMLElement, ordered: HTMLElement[]) => {
      const moved: { entry: HTMLElement; parent: HTMLElement; next: ChildNode | null }[] = [];
      const active = root.ownerDocument.activeElement;
      const move = (entry: HTMLElement, parent: HTMLElement, next: ChildNode | null) => {
        const target = parent as HTMLElement & { moveBefore?: (node: Node, before: Node | null) => void };
        if (target.moveBefore && entry.isConnected && target.isConnected) target.moveBefore(entry, next);
        else target.insertBefore(entry, next);
      };
      try {
        // 根与浮层可有不同的祖先选择器。用原行同步测量，避免复制插槽组件。
        let nextEntry: Element | null = more.value?.closest('li') ?? null;
        for (let i = ordered.length - 1; i >= 0; i--) {
          const entry = ordered[i].parentElement;
          const parent = entry?.parentElement;
          if (!entry || !parent) continue;
          if (parent !== root) {
            moved.push({ entry, parent, next: entry.nextSibling });
            move(entry, root, nextEntry);
          }
          nextEntry = entry;
        }
        return ordered.map(row => Array.from(row.children)
          .reduce((sum, node) => sum + node.getBoundingClientRect().width, 0));
      } finally {
        for (const { entry, parent, next } of moved.reverse()) move(entry, parent, next);
        if (active instanceof HTMLElement && root.ownerDocument.activeElement === root.ownerDocument.body &&
          moved.some(({ entry }) => entry.contains(active))) {
          active.focus({ preventScroll: true });
        }
      }
    };
    const restoreAfterMove = (original: Element | null, target: () => HTMLElement | undefined) => {
      void nextTick(() => {
        if (document.activeElement === original || document.activeElement === document.body) {
          target()?.focus({ preventScroll: true });
        }
      });
    };
    const handleResize = () => {
      const root = list.value;
      if (!root) return;
      const width = root.getBoundingClientRect().width;
      if (!width) return;
      const ordered = [...rows].sort((a, b) => Number(a.dataset.position) - Number(b.dataset.position));
      const widths = measureAtRoot(root, ordered);
      const focused = document.activeElement;
      if (widths.reduce((sum, entry) => sum + entry, 0) <= width) {
        const restore = focused === more.value ? ordered[cutoff.value]?.querySelector<HTMLElement>('button:not(:disabled)') :
          panel.value?.popperRef.contentRef?.contains(focused) && focused instanceof HTMLElement ? focused : undefined;
        close();
        cutoff.value = Infinity;
        if (restore) restoreAfterMove(focused, () => restore);
        return;
      }
      let used = more.value?.getBoundingClientRect().width ?? width;
      const end = widths.findIndex(entry => (used += entry) > width);
      const next = end < 0 ? widths.length : end;
      const index = ordered.findIndex(row => row.contains(focused));
      const entersPopup = index >= next && index < cutoff.value;
      const leavesPopup = index >= cutoff.value && index < next;
      cutoff.value = next;
      if (entersPopup && !open.value) restoreAfterMove(focused, () => more.value);
      else if ((entersPopup || leavesPopup) && focused instanceof HTMLElement) restoreAfterMove(focused, () => focused);
    };
    const attachRow = (vnode: VNode) => {
      const row = vnode.el as HTMLElement;
      rows.add(row);
      observer?.observe(row);
    };
    const detachRow = (vnode: VNode) => {
      const row = vnode.el as HTMLElement;
      rows.delete(row);
      observer?.unobserve(row);
    };
    onMounted(() => {
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(handleResize);
        observer.observe(list.value!);
        rows.forEach(row => observer!.observe(row));
      }
      window.addEventListener('resize', handleResize);
      handleResize();
    });
    onUpdated(handleResize);
    onBeforeUnmount(() => {
      clear();
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
    });
    expose({ handleResize, close });
    const hover = (visible: boolean) => {
      clear();
      if (menu.menuTrigger === 'hover') {
        timer = setTimeout(() => { if (visible) open.value = true; else close(); }, visible ? menu.popperProps.showTimeout : menu.popperProps.hideTimeout);
      }
    };
    const keyboard = async (event: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowRight', 'Enter', ' '].includes(event.key) || event.isComposing) return;
      event.preventDefault();
      clear();
      open.value = true;
      await nextTick();
      await panel.value?.updatePopper();
      panel.value?.popperRef.contentRef?.querySelector<HTMLElement>('button:not(:disabled)')?.focus({ preventScroll: true });
    };
    const hasMore = computed(() => Number.isFinite(cutoff.value));
    return () => {
      let count = 0;
      const wrap = (nodes: unknown[]): VNode[] => nodes.flatMap(node => {
        if (Array.isArray(node)) return wrap(node);
        if (!isVNode(node) || node.type === Comment) return [];
        if (node.type === Fragment && Array.isArray(node.children)) {
          const fragment = h(Fragment, { key: node.key ?? undefined }, wrap(node.children)) as VNode & { slotScopeIds?: string[] };
          fragment.slotScopeIds = (node as typeof fragment).slotScopeIds;
          return [fragment];
        }
        const index = count++;
        const overflow = index >= cutoff.value;
        const target = open.value && overflow ? targets.get(index) : undefined;
        return [<Teleport key={node.key ?? undefined} to={target ?? 'body'} disabled={!target}>{
          h(Entry, { overflow, visible: open.value, onHold: clear, onLeave: () => hover(false) }, () => h('li', { role: 'none', class: [ns.e('entry'), overflow && !target && ns.e('parked')] }, [
            h('ul', { role: 'presentation', 'data-position': index, onVnodeMounted: attachRow, onVnodeUnmounted: detachRow, class: ns.e('entry-list') }, [node])
          ]))
        }</Teleport>];
      });
      const entries = wrap(slots.default?.() ?? []);
      const popper = menu.popperProps;
      return <ul ref={list} role="menubar" aria-orientation="horizontal">
        {entries}
        {hasMore.value && <li role="none" onMouseenter={() => hover(true)} onMouseleave={() => hover(false)}>
          <Tooltip ref={panel} trigger={[]} triggerKeys={[]} visible={open.value}
            onUpdate:visible={() => undefined} onDismiss={close} closeOnOutside contentRole="menu" persistent={popper.persistent} effect={popper.effect}
            placement="bottom-start" offset={popper.offset} teleported={popper.teleported ?? true}
            popperClass={normalizeClass([sub.e('popup'), sub.em('popup', popper.effect), popper.popperClass])}
            popperStyle={normalizeStyle([menu.themeStyle, popper.popperStyle])} showArrow={false}>
            {{
              default: () => <button ref={more} type="button" aria-label="更多" aria-haspopup="menu" aria-expanded={open.value}
                onClick={() => { clear(); open.value = !open.value; }} onKeydown={keyboard}>…</button>,
              content: () => <ul role="presentation" class={sub.e('children')} onMouseenter={clear} onMouseleave={() => hover(false)}>
                {Array.from({ length: Math.max(0, count - cutoff.value) }, (_, offset) => {
                  const index = cutoff.value + offset;
                  return <li key={index} role="none"><ul role="presentation" class={ns.e('destination')}
                    ref={el => { if (el instanceof Element) targets.set(index, el); else targets.delete(index); }} /></li>;
                })}
              </ul>
            }}
          </Tooltip>
        </li>}
      </ul>;
    };
  }
});
