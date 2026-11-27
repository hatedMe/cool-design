import { useFloatingTheme } from '../../../src/utils/use-floating';
import { avoidIdCollision, createSlotIds, reserveSlotIds } from '../../../src/utils/slot-ids';
import { useId } from '../../hooks/use-id';
import { useNamespace } from '../../hooks/use-namespace';
import {
  Teleport,
  Transition,
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRaw,
  vShow,
  watch,
  withDirectives,
  type Component,
  type PropType
} from 'vue';
import { useZIndex } from '../../hooks/use-z-index';
import { isTopDialog, isTopFocusDialog, lockDialog, unlockDialog } from '../dialog/stack';
import { useModalTarget } from '../dialog/use-modal-target';

export type DrawerDirection = 'rtl' | 'ltr' | 'ttb' | 'btt';
export type DrawerBeforeClose = (done: (cancel?: boolean) => void) => void;
export interface DrawerResizableOptions {
  minSize?: string | number;
  maxSize?: string | number;
}
export interface DrawerResizePayload {
  size: string;
}

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
    closeIcon: { type: [String, Object, Function] as PropType<string | Component>, default: undefined },
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
    const ns = useNamespace('drawer');
    const { nextZIndex } = useZIndex();
    const root = ref<HTMLElement>();
    const zIndex = ref(2000);
    const rendered = ref(false);
    const visible = ref(false);
    const id = useId();
    const titleClass = computed(() => ns.e('title'));
    const token = Symbol('drawer');
    let active = false;
    let maskGestureAllowed = true;
    let previous: HTMLElement | null = null;
    let modelCycle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let dragMove: ((event: MouseEvent) => void) | null = null;
    let dragUp: (() => void) | null = null;

    const onPointerdown = () => {
      maskGestureAllowed = isTopDialog(token);
    };

    const { target, teleportProps, initiallyInline } = useModalTarget(props);
    const theme = useFloatingTheme(target, () => !!target.value);

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
    const clearTimer = () => {
      clearTimeout(timer);
      timer = undefined;
    };
    const schedule = (callback: () => void, delay: number) => {
      clearTimer();
      if (delay > 0) {
        timer = setTimeout(() => {
          timer = undefined;
          callback();
        }, delay);
      } else callback();
    };
    const doClose = () => { visible.value = false; };
    const handleClose = () => {
      if (!visible.value || !props.modelValue) return;
      if (!props.beforeClose) {
        if (timer === undefined) schedule(doClose, props.closeDelay);
        return;
      }
      const cycle = modelCycle;
      let settled = false;
      props.beforeClose((cancel) => {
        if (settled) return;
        settled = true;
        if (cancel || cycle !== modelCycle || !visible.value) return;
        clearTimer();
        doClose();
      });
    };

    const cleanup = () => {
      if (!active) return;
      const wasTop = isTopFocusDialog(token);
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
      if (event.key === 'Escape' && visible.value && props.closeOnPressEscape) {
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

    const doOpen = () => {
      rendered.value = true;
      if (!active) {
        previous = document.activeElement as HTMLElement;
        active = true;
        const stackZIndex = Math.max(lockDialog(token, props.lockScroll), nextZIndex());
        zIndex.value = props.zIndex ?? stackZIndex;
        document.addEventListener('keydown', onKeydown);
        document.addEventListener('focusin', onFocus);
        document.addEventListener('pointerdown', onPointerdown, true);
      }
      visible.value = true;
      nextTick(() => {
        if (!visible.value || !isTopFocusDialog(token)) return;
        focusFirst();
        emit('open-auto-focus');
      });
    };

    const afterLeave = () => {
      if (!active || visible.value) return;
      stopDrag();
      cleanup();
      emit('closed');
      if (!props.modelValue || timer === undefined) emit('update:modelValue', false);
      if (props.destroyOnClose) rendered.value = false;
    };

    onMounted(() => {
      watch(
        () => props.modelValue,
        (open) => {
          modelCycle++;
          clearTimer();
          if (open && !visible.value) schedule(doOpen, props.openDelay);
          else if (!open && visible.value) schedule(doClose, props.closeDelay);
        },
        { immediate: true }
      );
    });
    onBeforeUnmount(() => {
      modelCycle++;
      clearTimer();
      stopDrag();
      cleanup();
    });

    expose({ handleClose });

    const content = () => {
      const scopedHeader = props.withHeader ? slots.header : undefined;
      const title = props.withHeader && !scopedHeader ? slots.title?.() : undefined;
      const body = slots.default?.();
      const footer = slots.footer?.();
      const reserved = createSlotIds();
      reserveSlotIds(reserved, title);
      reserveSlotIds(reserved, body);
      reserveSlotIds(reserved, footer);
      const titleId = avoidIdCollision(`${id.value}-drawer-title`, reserved);
      const header = scopedHeader?.({ close: handleClose, titleId, titleClass: titleClass.value });
      return (
        <div
          class={[
            theme.value.scopeClass,
            props.modal ? ns.e('mask') : ns.e('wrapper'),
            { 'is-penetrable': !props.modal && props.modalPenetrable },
            props.modalClass
          ]}
          data-theme={theme.value.theme}
          style={{ ...theme.value.style, zIndex: zIndex.value }}
          onClick={(event: MouseEvent) => {
            const allowed = maskGestureAllowed && isTopDialog(token);
            maskGestureAllowed = true;
            if (event.target === event.currentTarget && props.closeOnClickModal && allowed) handleClose();
          }}>
          <aside
            ref={root}
            class={[ns.b(), `is-${props.direction}`, { 'is-resizable': isResizable.value }, props.customClass]}
            style={{
              width: isHorizontal.value ? sizeValue.value : undefined,
              height: isHorizontal.value ? undefined : sizeValue.value,
              [ns.cssVarName('drawer-size')]: sizeValue.value
            }}
            role='dialog'
            aria-modal='true'
            aria-labelledby={props.withHeader && (props.title || slots.title || slots.header) ? titleId : undefined}
            tabindex={-1}>
            {props.withHeader && (
              <header class={[ns.e('header'), props.headerClass]}>
                {header ?? (
                  <>
                    <div id={titleId} class={titleClass.value} role='heading' aria-level={props.headerAriaLevel}>
                      {title ?? props.title}
                    </div>
                    {props.showClose && (
                      <button
                        type='button'
                        class={ns.e('close')}
                        aria-label='关闭'
                        onClick={handleClose}>
                        {typeof props.closeIcon === 'string'
                          ? props.closeIcon
                          : props.closeIcon
                            ? h(toRaw(props.closeIcon))
                            : '×'}
                      </button>
                    )}
                  </>
                )}
              </header>
            )}
            <div class={[ns.e('body'), props.bodyClass]}>{body}</div>
            {slots.footer && <footer class={[ns.e('footer'), props.footerClass]}>{footer}</footer>}
            {isResizable.value && (
              <div
                class={[ns.e('resize-handle'), `is-${props.direction}`]}
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
    };

    return () => {
      const node = rendered.value ? withDirectives(content(), [[vShow, visible.value]]) : null;
      const animated = (
        <Transition
          name={ns.b('fade')}
          persisted
          onBeforeEnter={() => emit('open')}
          onAfterEnter={() => { if (visible.value) emit('opened'); }}
          onBeforeLeave={() => emit('close')}
          onAfterLeave={afterLeave}>
          {node}
        </Transition>
      );
      const teleport = (
        <Teleport {...teleportProps()}>
          {initiallyInline ? <>{animated}</> : animated}
        </Teleport>
      );
      return initiallyInline ? <>{teleport}</> : teleport;
    };
  }
});
