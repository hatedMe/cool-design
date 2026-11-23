import { useFloatingTheme } from '../../../src/utils/use-floating';
import { useNamespace } from '../../hooks/use-namespace';
import {
  Teleport,
  Transition,
  computed,
  defineComponent,
  h,
  inject,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  vShow,
  watch,
  withDirectives,
  type PropType,
  type TransitionProps
} from 'vue';
import { overlayKey, useConfig, type DialogConfigContext } from '../config-provider/context';
import { useZIndex } from '../../hooks/use-z-index';
import DialogContent, { dialogContentProps, type DialogContentInstance, type DialogSlots } from './dialog-content';
import { bringDialogToFront, isTopDialog, isTopFocusDialog, lockDialog, unlockDialog } from './stack';

export type DialogBeforeClose = (done: (cancel?: boolean) => void) => void;
export type DialogModalClass = string | boolean | Record<string, unknown> | DialogModalClass[];

function sameTransition(first: DialogConfigContext['transition'], second: DialogConfigContext['transition'], defaultTransition: string) {
  if (first === second) return true;
  if (first === undefined || second === undefined) return false;
  const previous: TransitionProps = typeof first === 'string' ? { name: first } : first;
  const current: TransitionProps = typeof second === 'string' ? { name: second } : second;
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)] as (keyof TransitionProps)[]);
  for (const key of keys) {
    const before = previous[key];
    const after = current[key];
    if (before === after) continue;
    if (key === 'name' && (before || defaultTransition) === (after || defaultTransition)) continue;
    if (Array.isArray(before) && Array.isArray(after) &&
        before.length === after.length && before.every((hook, index) => hook === after[index])) continue;
    if (key === 'duration' && typeof before === 'object' && typeof after === 'object' &&
        'enter' in before && 'enter' in after && before.enter === after.enter && before.leave === after.leave) continue;
    return false;
  }
  return true;
}

function callHook<Args extends unknown[]>(hook: ((...args: Args) => void) | Array<(...args: Args) => void> | undefined, ...args: Args) {
  if (Array.isArray(hook)) hook.forEach((fn) => fn(...args));
  else hook?.(...args);
}

let dialogId = 0;
const Dialog = defineComponent({
  name: 'i-dialog',
  inheritAttrs: false,
  props: {
    ...dialogContentProps,
    modelValue: Boolean,
    modal: { type: Boolean, default: true },
    modalClass: { type: [String, Array, Object, Boolean] as PropType<DialogModalClass>, default: undefined },
    modalPenetrable: Boolean,
    appendTo: [String, Object] as PropType<string | HTMLElement>,
    appendToBody: Boolean,
    lockScroll: { type: Boolean, default: true },
    closeOnClickModal: { type: Boolean, default: true },
    closeOnPressEscape: { type: Boolean, default: true },
    destroyOnClose: Boolean,
    beforeClose: Function as PropType<DialogBeforeClose>,
    openDelay: { type: Number, default: 0 },
    closeDelay: { type: Number, default: 0 },
    trapFocus: Boolean,
    transition: [String, Object] as PropType<DialogConfigContext['transition']>,
    zIndex: Number
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    open: () => true,
    opened: () => true,
    close: () => true,
    closed: () => true,
    'open-auto-focus': () => true,
    'close-auto-focus': () => true
  },
  setup(props, { attrs, slots, emit, expose }) {
    const ns = useNamespace('dialog');
    const config = useConfig();
    const alignCenter = computed(() => props.alignCenter ?? config.value.dialog?.alignCenter ?? false);
    const draggable = computed(() => props.draggable ?? config.value.dialog?.draggable ?? false);
    const overflow = computed(() => props.overflow ?? config.value.dialog?.overflow ?? false);
    const defaultTransition = computed(() => ns.namespace.value === 'i' ? 'dialog-fade' : ns.b('fade'));
    const transition = computed(() => props.transition ?? config.value.dialog?.transition);
    const penetrable = computed(() => props.modalPenetrable && !props.modal && !props.fullscreen);
    const host = inject(overlayKey, undefined);
    const { nextZIndex } = useZIndex();
    const content = ref<DialogContentInstance | null>(null);
    const dialogContentRef = computed(() => content.value ?? undefined);
    const root = computed(() => dialogContentRef.value?.$el);
    const zIndex = ref(2000);
    const rendered = ref(false);
    const visible = ref(false);
    const id = ++dialogId;
    const titleId = `i-dialog-title-${id}`;
    const bodyId = `i-dialog-body-${id}`;
    const token = Symbol('dialog');
    let active = false;
    let pendingLeave: { transition: DialogConfigContext['transition']; done?: () => void } | undefined;
    const openCycle = ref(0);
    let modelCycle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let previous: HTMLElement | null = null;
    let maskGestureAllowed = true;
    let maskMousedown = true;
    let maskMouseup = true;

    const target = computed(() => {
      if (typeof document === 'undefined') return undefined;
      const value = props.appendTo;
      if (value && typeof value !== 'string') return value;
      if (value && value !== 'body') {
        try {
          return document.querySelector(value) ?? undefined;
        } catch {
          return undefined;
        }
      }
      if (props.appendToBody) return document.body;
      return value === undefined ? host?.value : undefined;
    });
    const theme = useFloatingTheme(target, () => !!target.value);

    const focusable = () =>
      Array.from(root.value?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'
      ) || []);
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
    const beginClose = () => {
      visible.value = false;
    };
    const handleClose = () => {
      if (!visible.value || !props.modelValue) return;
      if (!props.beforeClose) {
        schedule(beginClose, props.closeDelay);
        return;
      }
      const cycle = modelCycle;
      const opened = openCycle.value;
      let settled = false;
      props.beforeClose((cancel) => {
        if (settled) return;
        settled = true;
        if (cancel || cycle !== modelCycle || opened !== openCycle.value || !visible.value) return;
        clearTimer();
        beginClose();
      });
    };
    const requestClose = () => {
      if (props.closable) handleClose();
    };
    const resetPosition = () => dialogContentRef.value?.resetPosition();

    // 记录锚定浮层处理外部 pointerdown 前的层级，避免同一手势继续关闭弹窗。
    const onPointerdown = () => {
      maskGestureAllowed = isTopDialog(token);
    };
    const onFocus = (event: FocusEvent) => {
      if (active && isTopFocusDialog(token) && root.value && !root.value.contains(event.target as Node)) focusFirst();
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (!active) return;
      if (event.key === 'Escape' && isTopDialog(token) && props.closeOnPressEscape && props.closable && visible.value) {
        event.preventDefault();
        requestClose();
      }
      if (event.key !== 'Tab' || !isTopFocusDialog(token)) return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const inContent = current !== root.value && root.value?.contains(current);
      if (!items.length) {
        event.preventDefault();
        root.value?.focus();
      } else if (event.shiftKey && (!inContent || current === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inContent || current === last)) {
        event.preventDefault();
        first.focus();
      }
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
    const retireLeave = () => {
      const done = pendingLeave?.done;
      pendingLeave = undefined;
      done?.();
    };
    const finishClose = () => {
      cleanup();
      emit('closed');
      if (!props.modelValue || timer === undefined) emit('update:modelValue', false);
      if (props.destroyOnClose) rendered.value = false;
    };
    const bringToFront = () => {
      if (!visible.value || !penetrable.value || props.zIndex !== undefined) return;
      if (!isTopDialog(token)) previous = document.activeElement as HTMLElement;
      zIndex.value = Math.max(bringDialogToFront(token), nextZIndex());
    };
    const beginOpen = async () => {
      if (visible.value) return;
      const cycle = ++openCycle.value;
      pendingLeave = undefined;
      rendered.value = true;
      visible.value = true;
      if (!active) {
        previous = document.activeElement as HTMLElement;
        active = true;
        zIndex.value = Math.max(lockDialog(token, props.lockScroll), nextZIndex());
        document.addEventListener('keydown', onKeydown);
        document.addEventListener('focusin', onFocus);
        document.addEventListener('pointerdown', onPointerdown, true);
      }
      emit('open');
      await nextTick();
      if (!active || !visible.value || cycle !== openCycle.value) return;
      if (root.value) {
        root.value.scrollTop = 0;
        const overlay = root.value.parentElement;
        if (overlay) {
          overlay.scrollTop = 0;
          overlay.scrollLeft = 0;
        }
      }
      if (!isTopFocusDialog(token)) return;
      focusFirst();
      emit('open-auto-focus');
    };
    watch(transition, (animation) => {
      if (!pendingLeave || visible.value || sameTransition(pendingLeave.transition, animation, defaultTransition.value)) return;
      retireLeave();
      finishClose();
    }, { flush: 'post' });
    onMounted(() => {
      watch(() => props.modelValue, (open) => {
        modelCycle++;
        clearTimer();
        if (open && !visible.value) schedule(beginOpen, props.openDelay);
        else if (!open && visible.value) schedule(beginClose, props.closeDelay);
      }, { immediate: true });
    });
    onBeforeUnmount(() => {
      clearTimer();
      modelCycle++;
      retireLeave();
      cleanup();
    });
    expose({ visible, dialogContentRef, handleClose, resetPosition });

    return () => {
      const animation = transition.value;
      const options = typeof animation === 'string' ? { name: animation } : animation;
      const cycle = openCycle.value;
      const leaveHooks = options?.onLeave;
      const waitsForDone = [leaveHooks].flat().some((hook) => hook && hook.length > 1);
      const onLeave = (element: Element, done: () => void) => {
        const leave = pendingLeave;
        if (!leave || cycle !== openCycle.value) return;
        leave.done = done;
        callHook(leaveHooks, element, () => {
          if (pendingLeave === leave) done();
        });
      };
      const overlay = h(Transition, {
        ...options,
        name: options?.name || defaultTransition.value,
        persisted: true,
        onAfterEnter: (element: Element) => {
          if (!active || !visible.value || cycle !== openCycle.value) return;
          callHook(options?.onAfterEnter, element);
          emit('opened');
        },
        onBeforeLeave: (element: Element) => {
          if (!active || visible.value || cycle !== openCycle.value) return;
          pendingLeave = { transition: animation };
          callHook(options?.onBeforeLeave, element);
          emit('close');
        },
        // Vue 根据钩子声明的参数数量判断是由 CSS 还是由用户完成过渡。
        onLeave: waitsForDone ? onLeave : (...args: [Element, () => void]) => onLeave(...args),
        onAfterLeave: (element: Element) => {
          if (!active || !pendingLeave || visible.value || cycle !== openCycle.value) return;
          pendingLeave = undefined;
          callHook(options?.onAfterLeave, element);
          finishClose();
        }
      }, {
        default: () => withDirectives(
          <div
            class={[
              theme.value.scopeClass,
              props.modal ? ns.e('mask') : ns.e('wrapper'),
              props.modalClass,
              {
                'is-penetrable': penetrable.value,
                'is-top': !!props.top && !props.fullscreen,
                'is-fullscreen': props.fullscreen,
                'is-align-center': alignCenter.value
              }
            ]}
            data-theme={theme.value.theme}
            style={{ ...theme.value.style, zIndex: props.zIndex ?? zIndex.value }}
            aria-hidden={visible.value ? undefined : 'true'}
            onMousedown={(event: MouseEvent) => { maskMousedown = event.target === event.currentTarget; }}
            onMouseup={(event: MouseEvent) => { maskMouseup = event.target === event.currentTarget; }}
            onClick={(event: MouseEvent) => {
              const sameTarget = maskMousedown && maskMouseup && event.target === event.currentTarget;
              const allowed = maskGestureAllowed && isTopDialog(token);
              maskGestureAllowed = maskMousedown = maskMouseup = true;
              if (sameTarget && allowed && !penetrable.value && props.closeOnClickModal) requestClose();
            }}>
            {rendered.value && (
              <DialogContent
                {...mergeProps(attrs, { onMousedown: bringToFront })}
                ref={content}
                title={props.title}
                width={props.width}
                fullscreen={props.fullscreen}
                top={props.top}
                customClass={props.customClass}
                headerClass={props.headerClass}
                bodyClass={props.bodyClass}
                footerClass={props.footerClass}
                showClose={props.showClose}
                closable={props.closable}
                center={props.center}
                headerAriaLevel={props.headerAriaLevel}
                closeIcon={props.closeIcon}
                titleId={titleId}
                bodyId={bodyId}
                visible={visible.value}
                close={requestClose}
                alignCenter={alignCenter.value}
                draggable={draggable.value}
                overflow={overflow.value}
                v-slots={slots}
              />
            )}
          </div>,
          [[vShow, visible.value]]
        )
      });
      return <Teleport to={target.value ?? 'body'} disabled={!target.value}>{overlay}</Teleport>;
    };
  }
});

type DialogOptions = Omit<typeof Dialog, never>;
type DialogComponent = DialogOptions & (
  new (...args: ConstructorParameters<typeof Dialog>) => Omit<InstanceType<typeof Dialog>, '$slots'> & {
    $slots: DialogSlots;
  }
);

export default (Dialog as DialogOptions) as DialogComponent;
