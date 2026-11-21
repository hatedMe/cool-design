import { defineComponent, onBeforeUnmount, ref, watch, type Component, type PropType, type VNode } from 'vue';
import Icon from '../icon';

export interface DialogHeaderScope {
  close(): void;
  titleId: string;
  titleClass: string;
}

export type DialogSlots = Readonly<{
  default?: () => VNode[];
  header?: (scope: DialogHeaderScope) => VNode[];
  title?: () => VNode[];
  footer?: () => VNode[];
}>;

export interface DialogContentInstance {
  readonly $el: HTMLElement;
  resetPosition(): void;
  updatePosition(): void;
}

export const dialogContentProps = {
  title: { type: String, default: '' },
  width: [String, Number],
  fullscreen: Boolean,
  top: { type: String, default: '' },
  customClass: { type: String, default: '' },
  headerClass: { type: String, default: '' },
  bodyClass: { type: String, default: '' },
  footerClass: { type: String, default: '' },
  showClose: { type: Boolean, default: true },
  closable: { type: Boolean, default: true },
  center: Boolean,
  alignCenter: { type: Boolean, default: undefined },
  draggable: { type: Boolean, default: undefined },
  overflow: { type: Boolean, default: undefined },
  headerAriaLevel: { type: String, default: '2' },
  closeIcon: [String, Object, Function] as PropType<string | Component>
};

export default defineComponent({
  name: 'i-dialog-content',
  props: {
    ...dialogContentProps,
    titleId: { type: String, required: true },
    bodyId: { type: String, required: true },
    visible: Boolean,
    close: { type: Function as PropType<() => void>, required: true }
  },
  setup(props, { slots, expose }) {
    const root = ref<HTMLElement>();
    const dragOffset = ref({ x: 0, y: 0 });
    let dragStart: { x: number; y: number; ox: number; oy: number; rect: DOMRect } | undefined;
    const clampOffset = (x: number, y: number, rect: DOMRect) => ({
      x: Math.min(Math.max(0, window.innerWidth - rect.right), Math.max(Math.min(0, -rect.left), x)),
      y: Math.min(Math.max(0, window.innerHeight - rect.bottom), Math.max(Math.min(0, -rect.top), y))
    });
    const onDragMove = (event: MouseEvent) => {
      if (!dragStart) return;
      const { x, y, ox, oy, rect } = dragStart;
      const dx = event.clientX - x;
      const dy = event.clientY - y;
      const delta = props.overflow ? { x: dx, y: dy } : clampOffset(dx, dy, rect);
      dragOffset.value = { x: ox + delta.x, y: oy + delta.y };
    };
    const onDragEnd = () => {
      dragStart = undefined;
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };
    const onHeaderMousedown = (event: MouseEvent) => {
      if (event.button !== 0 || !props.draggable || props.fullscreen || !root.value) return;
      if ((event.target as Element).closest('button')) return;
      dragStart = {
        x: event.clientX,
        y: event.clientY,
        ox: dragOffset.value.x,
        oy: dragOffset.value.y,
        rect: root.value.getBoundingClientRect()
      };
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    };
    const resetPosition = () => {
      dragOffset.value = { x: 0, y: 0 };
      if (!root.value) return;
      if (props.top && !props.fullscreen && !props.alignCenter) root.value.style.marginTop = props.top;
      else root.value.style.removeProperty('margin-top');
    };
    const updatePosition = () => {
      if (!root.value || props.overflow || props.fullscreen) return;
      const { x, y } = dragOffset.value;
      const rect = root.value.getBoundingClientRect();
      const shift = clampOffset(x, y, new DOMRect(rect.x - x, rect.y - y, rect.width, rect.height));
      dragOffset.value = shift;
    };
    onBeforeUnmount(onDragEnd);
    watch(() => props.visible, (visible) => { if (!visible) onDragEnd(); });
    expose({ resetPosition, updatePosition });

    return () => {
      const titleClass = 'i-dialog__title';
      const { x, y } = dragOffset.value;
      const showTitle = !!(props.title || slots.title || slots.header);
      return (
        <section
          ref={root}
          class={['i-dialog', { 'i-dialog--center': props.center, 'is-fullscreen': props.fullscreen }, props.customClass]}
          style={{
            width: !props.fullscreen && typeof props.width === 'number'
              ? `${props.width}px` : props.fullscreen ? undefined : props.width,
            marginTop: !props.fullscreen && props.top && !props.alignCenter ? props.top : undefined,
            transform: !props.fullscreen && (x || y) ? `translate(${x}px, ${y}px)` : undefined
          }}
          role={props.visible ? 'dialog' : undefined}
          aria-modal={props.visible ? 'true' : undefined}
          aria-label={props.title || undefined}
          aria-labelledby={!props.title && showTitle ? props.titleId : undefined}
          aria-describedby={props.bodyId}
          tabindex={-1}>
          {(showTitle || props.showClose) && (
            <header
              class={['i-dialog__header', props.headerClass, props.draggable && !props.fullscreen && 'is-draggable']}
              onMousedown={onHeaderMousedown}>
              {(!slots.title && slots.header?.({ close: props.close, titleId: props.titleId, titleClass })) || (
                <h2 id={props.titleId} class={titleClass} role='heading' aria-level={props.headerAriaLevel}>
                  {slots.title?.() ?? props.title}
                </h2>
              )}
              {props.showClose && (
                <button
                  type='button'
                  class='i-dialog__close'
                  aria-label='关闭对话框'
                  disabled={!props.closable}
                  onClick={props.close}>
                  {props.closeIcon ? <Icon icon={props.closeIcon} aria-hidden='true' /> : '×'}
                </button>
              )}
            </header>
          )}
          <div id={props.bodyId} class={['i-dialog__body', props.bodyClass]}>{slots.default?.()}</div>
          {slots.footer && <footer class={['i-dialog__footer', props.footerClass]}>{slots.footer()}</footer>}
        </section>
      );
    };
  }
});
