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
import { isTopDialog, isTopFocusDialog, lockDialog, unlockDialog } from '../dialog/stack';

export type DrawerDirection = 'rtl' | 'ltr' | 'ttb' | 'btt';
export type DrawerBeforeClose = (done: () => void) => void;
export interface DrawerResizableOptions {
  minSize?: string | number;
  maxSize?: string | number;
}
export interface DrawerResizePayload {
  size: string;
}

let drawerId = 0;

const parseSizeToPx = (value: string | number | undefined, horizontal: boolean, fallback: number): number => {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : fallback;
  const text = value.trim();
  if (text.endsWith('%')) {
    const percent = Number(text.slice(0, -1));
    if (!Number.isFinite(percent) || percent < 0) return fallback;
    const base =
      typeof window !== 'undefined'
        ? horizontal
          ? window.innerWidth || 0
          : window.innerHeight || 0
        : 0;
    return (base * percent) / 100;
  }
  const parsed = Number(text.replace(/px$/i, ''));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export default defineComponent({
  name: 'i-drawer',
  props: {
    modelValue: Boolean,
    title: { type: String, default: '' },
    direction: { type: String as PropType<DrawerDirection>, default: 'rtl' },
    size: { type: [String, Number] as PropType<string | number>, default: '30%' },
    withHeader: { type: Boolean, default: true },
    closeOnClickModal: { type: Boolean, default: true },
    closeOnPressEscape: { type: Boolean, default: true },
    showClose: { type: Boolean, default: true },
    appendTo: { type: [String, Object] as PropType<string | HTMLElement>, default: undefined },
    appendToBody: { type: Boolean, default: false },
    lockScroll: { type: Boolean, default: true },
    beforeClose: { type: Function as PropType<DrawerBeforeClose>, default: undefined },
    modal: { type: Boolean, default: true },
    modalPenetrable: { type: Boolean, default: false },
    modalClass: { type: String, default: '' },
    destroyOnClose: { type: Boolean, default: false },
    openDelay: { type: Number, default: 0 },
    closeDelay: { type: Number, default: 0 },
    customClass: { type: String, default: '' },
    headerClass: { type: String, default: '' },
    bodyClass: { type: String, default: '' },
    footerClass: { type: String, default: '' },
    zIndex: { type: Number, default: undefined },
    headerAriaLevel: { type: String, default: '2' },
    resizable: { type: [Boolean, Object] as PropType<boolean | DrawerResizableOptions>, default: false }
  },
  emits: [
    'update:modelValue',
    'open',
    'opened',
    'close',
    'closed',
    'open-auto-focus',
    'close-auto-focus',
    'resize-start',
    'resize',
    'resize-end'
  ],
  setup(props, { slots, emit, expose }) {
    const host = inject(overlayKey, undefined);
    const root = ref<HTMLElement>();
    const zIndex = ref(2000);
    const rendered = ref(false);
    const visible = ref(false);
    const titleId = `i-drawer-title-${++drawerId}`;
    const titleClass = 'i-drawer__title';
    const token = Symbol('drawer');
    let active = false;
    let maskGestureAllowed = true;
    let previous: HTMLElement | null = null;
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    let dragMove: ((event: MouseEvent) => void) | null = null;
    let dragUp: (() => void) | null = null;

    const onPointerdown = () => {
      maskGestureAllowed = isTopDialog(token);
    };

    const target = computed(() => {
      if (props.appendToBody) return document.body;
      const value = props.appendTo;
      if (value instanceof HTMLElement) return value;
      if (typeof value === 'string') {
        try {
          return document.querySelector(value) || document.body;
        } catch {
          return document.body;
        }
      }
      return host?.value || document.body;
    });

    const isHorizontal = computed(() => props.direction === 'rtl' || props.direction === 'ltr');
    const isResizable = computed(() => !!props.resizable);
    const resizableOptions = computed<DrawerResizableOptions>(() =>
      typeof props.resizable === 'object' && props.resizable ? props.resizable : {}
    );
    const resizedSize = ref<string | null>(null);
    const sizeValue = computed(() => {
      if (resizedSize.value) return resizedSize.value;
      return typeof props.size === 'number' ? `${props.size}px` : props.size;
    });
    const sizePx = computed(() =>
      parseSizeToPx(resizedSize.value ?? props.size, isHorizontal.value, 0)
    );
    const minPx = computed(() =>
      parseSizeToPx(resizableOptions.value.minSize, isHorizontal.value, 4)
    );
    const maxPx = computed(() => {
      const fallback =
        typeof window !== 'undefined'
          ? isHorizontal.value
            ? window.innerWidth || Number.MAX_SAFE_INTEGER
            : window.innerHeight || Number.MAX_SAFE_INTEGER
          : Number.MAX_SAFE_INTEGER;
      return parseSizeToPx(resizableOptions.value.maxSize, isHorizontal.value, fallback);
    });
    watch([() => props.size, () => props.direction], () => {
      resizedSize.value = null;
    });

    const clampPx = (value: number) => {
      const min = Math.max(minPx.value, 0);
      const max = Math.max(maxPx.value, min);
      return Math.min(Math.max(value, min), max);
    };
    const applyPx = (value: number): string => {
      const clamped = clampPx(value);
      resizedSize.value = `${clamped}px`;
      return resizedSize.value;
    };

    const stopDrag = () => {
      if (dragMove) document.removeEventListener('mousemove', dragMove);
      if (dragUp) document.removeEventListener('mouseup', dragUp);
      dragMove = null;
      dragUp = null;
    };
    const onHandleMousedown = (event: MouseEvent) => {
      if (!isResizable.value || event.button !== 0) return;
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const startPx = sizePx.value;
      emit('resize-start', { size: sizeValue.value } satisfies DrawerResizePayload);
      dragMove = (moveEvent: MouseEvent) => {
        const delta =
          props.direction === 'rtl'
            ? startX - moveEvent.clientX
            : props.direction === 'ltr'
              ? moveEvent.clientX - startX
              : props.direction === 'ttb'
                ? moveEvent.clientY - startY
                : startY - moveEvent.clientY;
        const size = applyPx(startPx + delta);
        emit('resize', { size } satisfies DrawerResizePayload);
      };
      dragUp = () => {
        emit('resize-end', { size: sizeValue.value } satisfies DrawerResizePayload);
        stopDrag();
      };
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragUp);
    };
    const onHandleKeydown = (event: KeyboardEvent) => {
      if (!isResizable.value) return;
      const step = 10;
      let delta: number | null = null;
      if (event.key === 'Home') {
        event.preventDefault();
        emit('resize-start', { size: sizeValue.value });
        const size = applyPx(minPx.value);
        emit('resize', { size });
        emit('resize-end', { size });
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        emit('resize-start', { size: sizeValue.value });
        const size = applyPx(maxPx.value);
        emit('resize', { size });
        emit('resize-end', { size });
        return;
      }
      if (props.direction === 'rtl') {
        if (event.key === 'ArrowLeft') delta = step;
        else if (event.key === 'ArrowRight') delta = -step;
      } else if (props.direction === 'ltr') {
        if (event.key === 'ArrowRight') delta = step;
        else if (event.key === 'ArrowLeft') delta = -step;
      } else if (props.direction === 'ttb') {
        if (event.key === 'ArrowDown') delta = step;
        else if (event.key === 'ArrowUp') delta = -step;
      } else {
        if (event.key === 'ArrowUp') delta = step;
        else if (event.key === 'ArrowDown') delta = -step;
      }
      if (delta === null) return;
      event.preventDefault();
      emit('resize-start', { size: sizeValue.value });
      const size = applyPx(sizePx.value + delta);
      emit('resize', { size });
      emit('resize-end', { size });
    };

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

    const clearTimers = () => {
      if (openTimer) clearTimeout(openTimer);
      if (closeTimer) clearTimeout(closeTimer);
      openTimer = undefined;
      closeTimer = undefined;
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
      if (active && isTopFocusDialog(token) && root.value && !root.value.contains(event.target as Node)) {
        focusFirst();
      }
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (!active) return;
      if (event.key === 'Escape' && !isTopDialog(token)) return;
      if (event.key === 'Tab' && !isTopFocusDialog(token)) return;
      if (event.key === 'Escape' && props.closeOnPressEscape) {
        event.preventDefault();
        handleClose();
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

    const doOpen = async () => {
      if (active) return;
      emit('open');
      rendered.value = true;
      previous = document.activeElement as HTMLElement;
      active = true;
      visible.value = true;
      const stackZIndex = lockDialog(token, props.lockScroll);
      zIndex.value = props.zIndex ?? stackZIndex;
      document.addEventListener('keydown', onKeydown);
      document.addEventListener('focusin', onFocus);
      document.addEventListener('pointerdown', onPointerdown, true);
      await nextTick();
      if (!active) return;
      focusFirst();
      emit('open-auto-focus');
      emit('opened');
    };

    const doClosed = () => {
      if (!active) return;
      cleanup();
      visible.value = false;
      emit('closed');
    };

    onMounted(() => {
      watch(
        () => props.modelValue,
        (open) => {
          clearTimers();
          if (!open) {
            if (!active) return;
            const delay = Math.max(props.closeDelay, 0);
            if (delay <= 0) doClosed();
            else closeTimer = setTimeout(doClosed, delay);
            return;
          }
          const delay = Math.max(props.openDelay, 0);
          if (delay <= 0) void doOpen();
          else openTimer = setTimeout(() => void doOpen(), delay);
        },
        { immediate: true }
      );
    });
    onBeforeUnmount(() => {
      clearTimers();
      stopDrag();
      cleanup();
    });

    expose({ handleClose });

    const content = () => (
      <div
        class={[
          { 'i-drawer__mask': props.modal, 'i-drawer__wrapper': !props.modal },
          { 'is-penetrable': !props.modal && props.modalPenetrable },
          props.modalClass
        ]}
        style={{ zIndex: zIndex.value, display: visible.value ? undefined : 'none' }}
        aria-hidden={visible.value ? undefined : 'true'}
        onClick={(event: MouseEvent) => {
          const allowed = maskGestureAllowed && isTopDialog(token);
          maskGestureAllowed = true;
          if (event.target === event.currentTarget && props.closeOnClickModal && allowed) handleClose();
        }}>
        <aside
          ref={root}
          class={['i-drawer', `is-${props.direction}`, { 'is-resizable': isResizable.value }, props.customClass]}
          style={{
            width: isHorizontal.value ? sizeValue.value : undefined,
            height: isHorizontal.value ? undefined : sizeValue.value,
            ['--i-drawer-size' as string]: sizeValue.value
          }}
          role='dialog'
          aria-modal='true'
          aria-labelledby={props.withHeader && (props.title || slots.title || slots.header) ? titleId : undefined}
          tabindex={-1}>
          {props.withHeader && (
            <header class={['i-drawer__header', props.headerClass]}>
              {slots.header?.({ close: handleClose, titleId, titleClass }) ?? (
                <>
                  <div id={titleId} class={titleClass} role='heading' aria-level={props.headerAriaLevel}>
                    {slots.title?.() ?? props.title}
                  </div>
                  {props.showClose && (
                    <button
                      type='button'
                      class='i-drawer__close'
                      aria-label='关闭'
                      onClick={handleClose}>
                      ×
                    </button>
                  )}
                </>
              )}
            </header>
          )}
          <div class={['i-drawer__body', props.bodyClass]}>{slots.default?.()}</div>
          {slots.footer && <footer class={['i-drawer__footer', props.footerClass]}>{slots.footer()}</footer>}
          {isResizable.value && (
            <div
              class={['i-drawer__resize-handle', `is-${props.direction}`]}
              role='separator'
              tabindex={0}
              aria-orientation={isHorizontal.value ? 'vertical' : 'horizontal'}
              aria-label='调整抽屉尺寸'
              aria-valuenow={Math.round(sizePx.value)}
              aria-valuemin={Math.round(minPx.value)}
              aria-valuemax={Math.round(maxPx.value)}
              onMousedown={onHandleMousedown}
              onKeydown={onHandleKeydown}
            />
          )}
        </aside>
      </div>
    );

    return () => {
      if (!rendered.value) return null;
      if (!visible.value && props.destroyOnClose) return null;
      const node = content();
      return target.value ? <Teleport to={target.value}>{node}</Teleport> : node;
    };
  }
});
