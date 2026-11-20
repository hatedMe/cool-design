import {
  Teleport,
  Transition,
  h,
  vShow,
  withDirectives,
  computed,
  defineComponent,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType
} from 'vue';
import { overlayKey, useConfig, type DialogConfigContext } from '../config-provider/context';
import { useZIndex } from '../../hooks/use-z-index';
import { isTopDialog, isTopFocusDialog, lockDialog, unlockDialog } from './stack';
import Icon from '../icon';

export type DialogBeforeClose = (done: () => void) => void;

let dialogId = 0;
export default defineComponent({
  name: 'i-dialog',
  props: {
    modelValue: Boolean,
    title: { type: String, default: '' },
    width: { type: [String, Number] as PropType<string | number>, default: undefined },
    fullscreen: Boolean,
    top: { type: String, default: '' },
    modal: { type: Boolean, default: true },
    appendTo: { type: [String, Object] as PropType<string | HTMLElement>, default: undefined },
    lockScroll: { type: Boolean, default: true },
    customClass: { type: String, default: '' },
    headerClass: { type: String, default: '' },
    bodyClass: { type: String, default: '' },
    footerClass: { type: String, default: '' },
    showClose: { type: Boolean, default: true },
    closeOnClickModal: { type: Boolean, default: true },
    closeOnPressEscape: { type: Boolean, default: true },
    closable: { type: Boolean, default: true },
    center: Boolean,
    destroyOnClose: { type: Boolean, default: false },
    beforeClose: { type: Function as PropType<DialogBeforeClose>, default: undefined },
    alignCenter: { type: Boolean, default: undefined },
    draggable: { type: Boolean, default: undefined },
    overflow: { type: Boolean, default: undefined },
    transition: [String, Object] as PropType<DialogConfigContext['transition']>,
    closeIcon: [String, Object],
    zIndex: Number
  },
  emits: ['update:modelValue', 'open', 'opened', 'close', 'closed', 'open-auto-focus', 'close-auto-focus'],
  setup(props, { slots, emit, expose }) {
    const config = useConfig();
    const alignCenter = computed(() => props.alignCenter ?? config.value.dialog?.alignCenter);
    const draggable = computed(() => props.draggable ?? config.value.dialog?.draggable);
    const overflow = computed(() => props.overflow ?? config.value.dialog?.overflow);
    const transition = computed(() => props.transition ?? config.value.dialog?.transition);
    const host = inject(overlayKey, undefined);
    const { nextZIndex } = useZIndex();
    const root = ref<HTMLElement>();
    const zIndex = ref(2000);
    const rendered = ref(false);
    const titleId = `i-dialog-title-${++dialogId}`;
    const token = Symbol('dialog');
    let active = false;
    let openCycle = 0;
    let maskGestureAllowed = true;
    const dragOffset = ref({ x: 0, y: 0 });
    let dragStart: { x: number; y: number; ox: number; oy: number; rect: DOMRect } | null = null;
    const onDragMove = (event: MouseEvent) => {
      if (!dragStart) return;
      const { x, y, ox, oy, rect } = dragStart;
      let dx = event.clientX - x;
      let dy = event.clientY - y;
      if (overflow.value === false) {
        dx = Math.min(Math.max(0, window.innerWidth - rect.right), Math.max(Math.min(0, -rect.left), dx));
        dy = Math.min(Math.max(0, window.innerHeight - rect.bottom), Math.max(Math.min(0, -rect.top), dy));
      }
      dragOffset.value = { x: ox + dx, y: oy + dy };
    };
    const onDragEnd = () => {
      dragStart = null;
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };
    const onHeaderMousedown = (event: MouseEvent) => {
      if (!draggable.value || props.fullscreen) return;
      if ((event.target as HTMLElement).closest('button')) return;
      if (!root.value) return;
      dragStart = { x: event.clientX, y: event.clientY, ox: dragOffset.value.x, oy: dragOffset.value.y, rect: root.value.getBoundingClientRect() };
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    };
    onBeforeUnmount(onDragEnd);
    // 在锚定浮层处理外部 pointerdown 之前，记录本次手势是否属于当前弹窗。
    const onPointerdown = () => {
      maskGestureAllowed = isTopDialog(token);
    };
    let previous: HTMLElement | null = null;
    const target = computed(() => {
      const value = props.appendTo;
      if (value instanceof HTMLElement) return value;
      if (typeof value === 'string') {
        try {
          return document.querySelector(value) || undefined;
        } catch {
          return undefined;
        }
      }
      return host?.value;
    });
    const focusable = () =>
      Array.from(
        root.value?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'
        ) || []
      );
    const focusFirst = () => (focusable()[0] || root.value)?.focus();
    const doClose = () => emit('update:modelValue', false);
    const handleClose = () => {
      if (!active || !props.modelValue) return;
      emit('close');
      if (props.beforeClose) props.beforeClose(doClose);
      else doClose();
    };
    const requestClose = () => {
      if (props.closable) handleClose();
    };
    const resetPosition = () => {
      // 重置拖拽偏移，恢复初始位置
      dragOffset.value = { x: 0, y: 0 };
      if (!root.value) return;
      if (!props.fullscreen && props.top) root.value.style.marginTop = props.top;
      else root.value.style.removeProperty('margin-top');
    };
    const cleanup = () => {
      if (!active) return;
      const wasTop = isTopDialog(token);
      active = false;
      unlockDialog(token);
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('pointerdown', onPointerdown, true);
      if (wasTop && previous?.isConnected) {
        previous.focus();
        emit('close-auto-focus');
      }
    };
    const finishClose = () => {
      if (!active || props.modelValue) return;
      cleanup();
      emit('closed');
    };
    watch(transition, (animation) => {
      if (animation === undefined) finishClose();
    }, { flush: 'post' });
    const onFocus = (event: FocusEvent) => {
      if (active && isTopFocusDialog(token) && root.value && !root.value.contains(event.target as Node)) focusFirst();
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (!active) return;
      if (event.key === 'Escape' && !isTopDialog(token)) return;
      if (event.key === 'Tab' && !isTopFocusDialog(token)) return;
      if (event.key === 'Escape' && props.closeOnPressEscape && props.closable) {
        event.preventDefault();
        requestClose();
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!items.length) {
        event.preventDefault();
        root.value?.focus();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === root.value)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === root.value)) {
        event.preventDefault();
        first.focus();
      }
    };
    onMounted(() => {
      watch(
        () => props.modelValue,
        async (open) => {
          if (!open) {
            if (transition.value === undefined) finishClose();
            return;
          }
          openCycle++;
          emit('open');
          rendered.value = true;
          if (!active) {
            previous = document.activeElement as HTMLElement;
            active = true;
            zIndex.value = Math.max(lockDialog(token, props.lockScroll), nextZIndex());
            document.addEventListener('keydown', onKeydown);
            document.addEventListener('focusin', onFocus);
            document.addEventListener('pointerdown', onPointerdown, true);
          }
          await nextTick();
          if (!active || !props.modelValue) return;
          focusFirst();
          emit('open-auto-focus');
          if (transition.value === undefined) emit('opened');
        },
        { immediate: true }
      );
    });
    onBeforeUnmount(cleanup);
    expose({ handleClose, resetPosition });
    const content = () => (
      <div
        class={{
          'i-dialog__mask': props.modal,
          'i-dialog__wrapper': !props.modal,
          'is-top': !!props.top && !props.fullscreen,
          'is-fullscreen': props.fullscreen,
          'is-align-center': alignCenter.value
        }}
        style={{ zIndex: props.zIndex ?? zIndex.value, display: props.modelValue || transition.value !== undefined ? undefined : 'none' }}
        aria-hidden={props.modelValue ? undefined : 'true'}
        onClick={(event: MouseEvent) => {
          const allowed = maskGestureAllowed && isTopDialog(token);
          maskGestureAllowed = true;
          if (event.target === event.currentTarget && props.closeOnClickModal && allowed) requestClose();
        }}>
        <section
          ref={root}
          class={[
            'i-dialog',
            { 'i-dialog--center': props.center, 'is-fullscreen': props.fullscreen },
            props.customClass
          ]}
          style={{
            width: typeof props.width === 'number' ? `${props.width}px` : props.width,
            marginTop: !props.fullscreen && props.top && !alignCenter.value ? props.top : undefined,
            transform: dragOffset.value.x || dragOffset.value.y ? `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px)` : undefined
          }}
          role={props.modelValue ? 'dialog' : undefined}
          aria-modal={props.modelValue ? 'true' : undefined}
          aria-labelledby={!slots.header && (props.title || slots.title) ? titleId : undefined}
          tabindex={-1}>
          {(slots.header || props.title || slots.title || props.showClose) && (
            <header
              class={['i-dialog__header', props.headerClass, draggable.value && !props.fullscreen && 'is-draggable']}
              onMousedown={onHeaderMousedown}>
              {slots.header?.({ close: requestClose, titleId, titleClass: 'i-dialog__title' }) ?? (
                <h2 id={titleId} class='i-dialog__title'>
                  {slots.title?.() ?? props.title}
                </h2>
              )}
              {props.showClose && (
                <button
                  type='button'
                  class='i-dialog__close'
                  aria-label='关闭对话框'
                  disabled={!props.closable}
                  onClick={requestClose}>
                  {props.closeIcon ? <Icon icon={props.closeIcon} aria-hidden='true' /> : '×'}
                </button>
              )}
            </header>
          )}
          <div class={['i-dialog__body', props.bodyClass]}>{slots.default?.()}</div>
          {slots.footer && <footer class={['i-dialog__footer', props.footerClass]}>{slots.footer()}</footer>}
        </section>
      </div>
    );
    return () => {
      const animation = transition.value;
      const cycle = openCycle;
      if (animation === undefined && (!rendered.value || (!props.modelValue && props.destroyOnClose))) return null;
      const transitionProps = typeof animation === 'string' ? { name: animation } : animation;
      const node = transitionProps === undefined
        ? content()
        : h(Transition, {
            ...transitionProps,
            onAfterEnter: [
              () => { if (props.modelValue) emit('opened'); },
              transitionProps.onAfterEnter ?? []
            ].flat(),
            onAfterLeave: [
              () => { if (cycle === openCycle) finishClose(); },
              transitionProps.onAfterLeave ?? []
            ].flat()
          }, {
            default: () => {
              if (!rendered.value || (props.destroyOnClose && !props.modelValue)) return null;
              return props.destroyOnClose ? content() : withDirectives(content(), [[vShow, props.modelValue]]);
            }
          });
      if (animation === undefined) return target.value ? <Teleport to={target.value}>{node}</Teleport> : node;
      return <Teleport to={target.value ?? 'body'} disabled={!target.value}>{node}</Teleport>;
    };
  }
});
