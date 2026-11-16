import {
  Teleport,
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
import { overlayKey } from '../config-provider/context';
import { isTopDialog, isTopFocusDialog, lockDialog, unlockDialog } from './stack';

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
    beforeClose: { type: Function as PropType<DialogBeforeClose>, default: undefined }
  },
  emits: ['update:modelValue', 'open', 'opened', 'close', 'closed', 'open-auto-focus', 'close-auto-focus'],
  setup(props, { slots, emit, expose }) {
    const host = inject(overlayKey, undefined);
    const root = ref<HTMLElement>();
    const zIndex = ref(2000);
    const rendered = ref(false);
    const titleId = `i-dialog-title-${++dialogId}`;
    const token = Symbol('dialog');
    let active = false;
    let maskGestureAllowed = true;
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
      if (!active) return;
      emit('close');
      if (props.beforeClose) props.beforeClose(doClose);
      else doClose();
    };
    const requestClose = () => {
      if (props.closable) handleClose();
    };
    const resetPosition = () => {
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
            if (!active) return;
            cleanup();
            emit('closed');
            return;
          }
          if (active) return;
          emit('open');
          rendered.value = true;
          previous = document.activeElement as HTMLElement;
          active = true;
          zIndex.value = lockDialog(token, props.lockScroll);
          document.addEventListener('keydown', onKeydown);
          document.addEventListener('focusin', onFocus);
          document.addEventListener('pointerdown', onPointerdown, true);
          await nextTick();
          if (!active) return;
          focusFirst();
          emit('open-auto-focus');
          emit('opened');
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
          'is-fullscreen': props.fullscreen
        }}
        style={{ zIndex: zIndex.value, display: props.modelValue ? undefined : 'none' }}
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
            marginTop: !props.fullscreen && props.top ? props.top : undefined
          }}
          role='dialog'
          aria-modal='true'
          aria-labelledby={!slots.header && (props.title || slots.title) ? titleId : undefined}
          tabindex={-1}>
          {props.showClose && (
            <button
              type='button'
              class='i-dialog__close'
              aria-label='关闭对话框'
              disabled={!props.closable}
              onClick={requestClose}>
              ×
            </button>
          )}
          {(slots.header || props.title || slots.title || props.showClose) && (
            <header class={['i-dialog__header', props.headerClass]}>
              {slots.header?.() ?? (
                <h2 id={titleId} class='i-dialog__title'>
                  {slots.title?.() ?? props.title}
                </h2>
              )}
            </header>
          )}
          <div class={['i-dialog__body', props.bodyClass]}>{slots.default?.()}</div>
          {slots.footer && <footer class={['i-dialog__footer', props.footerClass]}>{slots.footer()}</footer>}
        </section>
      </div>
    );
    return () => {
      if (!rendered.value) return null;
      if (!props.modelValue && props.destroyOnClose) return null;
      const node = content();
      return target.value ? <Teleport to={target.value}>{node}</Teleport> : node;
    };
  }
});
