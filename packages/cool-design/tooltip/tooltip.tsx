import {
  Teleport,
  Transition,
  cloneVNode,
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  normalizeStyle,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  shallowRef,
  vShow,
  watch,
  withDirectives,
  type ComponentPublicInstance,
  type CSSProperties,
  type PropType,
  type TransitionProps,
  type VNode
} from 'vue';
import type { Placement, PositioningStrategy } from '@popperjs/core';
import { useFloating, type FloatingReference, type PopperOptions } from '../../../src/utils/use-floating';

import { useId } from '../../hooks/use-id';
import { defaultNamespace, useNamespace } from '../../hooks/use-namespace';
import { configKey, getThemeStyle, overlayKey } from '../config-provider/context';

type Trigger = 'hover' | 'focus' | 'click' | 'contextmenu';
type AppendTo = string | HTMLElement;
export type TooltipVirtualRef = FloatingReference;

const normalizeTriggerKey = (key: string) => {
  if (key.toLowerCase() === 'enter') return 'Enter';
  if (key === ' ' || key.toLowerCase() === 'space' || key === 'Spacebar') return 'Space';
  return key;
};

const callTransitionHook = (hook: TransitionProps['onBeforeEnter'], element: Element) => {
  if (Array.isArray(hook)) hook.forEach((callback) => callback(element));
  else hook?.(element);
};

const idTokens = (value: unknown) => value == null ? [] : String(value).split(/\s+/).filter(Boolean);
const addId = (value: unknown, id: string) => idTokens(value).includes(id)
  ? String(value) : value ? `${value} ${id}` : id;

export const tooltipProps = {
  content: { type: String, default: '' },
  rawContent: Boolean,
  placement: { type: String as PropType<Placement>, default: 'bottom' },
  disabled: Boolean,
  canOpen: Function as PropType<(reference: FloatingReference) => boolean>,
  trigger: { type: [String, Array] as PropType<Trigger | Trigger[]>, default: 'hover' },
  triggerKeys: { type: Array as PropType<string[]>, default: () => ['Enter', 'Space'] },
  transition: [String, Object] as PropType<string | TransitionProps>,
  persistent: Boolean,
  eager: Boolean,
  ariaLabel: String,
  contentRole: { type: String, default: 'tooltip' },
  closeOnOutside: { type: Boolean, default: undefined },
  triggerClass: String,
  arrowClass: String,
  showAfter: { type: Number, default: 0 },
  hideAfter: { type: Number, default: 200 },
  autoClose: { type: Number, default: 0 },
  enterable: { type: Boolean, default: true },
  focusOnTarget: Boolean,
  hoverOnFocus: { type: Boolean, default: true },
  showArrow: { type: Boolean, default: true },
  arrowOffset: { type: Number, default: 5 },
  effect: { type: String, default: 'dark' },
  offset: { type: Number, default: 12 },
  fallbackPlacements: { type: Array as PropType<Placement[]>, default: undefined },
  strategy: String as PropType<PositioningStrategy>,
  gpuAcceleration: { type: Boolean, default: true },
  popperOptions: Object as PropType<PopperOptions>,
  visible: { type: Boolean as PropType<boolean | null>, default: null },
  teleported: { type: Boolean, default: true },
  appendTo: { type: [String, Object] as PropType<AppendTo>, default: undefined },
  popperClass: { type: [String, Array, Object] as PropType<string | Array<string | Record<string, boolean> | string[] | undefined> | Record<string, boolean>>, default: undefined },
  popperStyle: { type: [String, Array, Object] as PropType<string | CSSProperties | CSSProperties[]>, default: undefined },
  zIndex: { type: Number, default: undefined },
  virtualTriggering: Boolean,
  virtualRef: { type: Object as PropType<TooltipVirtualRef>, default: undefined }
};

export default defineComponent({
  name: 'i-tooltip',
  props: {
    ...tooltipProps,
    trapFocus: Boolean,
    onDismiss: Function as PropType<(event: Event) => void>,
    onControlledClose: Function as PropType<() => void>
  },
  emits: ['update:visible', 'before-show', 'show', 'before-hide', 'hide', 'open', 'close', 'visible-change'],
  setup(props, { slots, emit, expose }) {
    const ns = useNamespace('tooltip');
    const themeScope = useNamespace('theme-scope');
    const provider = inject(configKey, undefined);
    const host = inject(overlayKey, undefined);
    const owner = getCurrentInstance();
    // Vue 水合会在执行 setup 前将服务端节点关联到组件 VNode。
    const hydrating = owner?.vnode.el != null;
    const triggerWrapper = shallowRef<HTMLElement>();
    const triggerElement = shallowRef<HTMLElement>();
    const floating = shallowRef<HTMLElement>();
    const arrow = shallowRef<HTMLElement>();
    const internalVisible = ref(false);
    const inactive = ref(false);
    const rendered = ref(false);
    const virtualTarget = computed(() => props.virtualTriggering && !inactive.value ? props.virtualRef : undefined);
    const reference = computed(() => props.virtualTriggering ? virtualTarget.value : triggerElement.value);
    const mounted = ref(false);
    const mountedReference = computed(() => mounted.value ? reference.value : undefined);
    const mountedVirtualTarget = computed(() => mounted.value ? virtualTarget.value : undefined);
    const virtualReferenceReady = computed(() => {
      const target = virtualTarget.value;
      return !!target && (!hydrating || mounted.value || typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement));
    });
    // 水合后再使用只在浏览器可取得的元素锚点。
    onMounted(() => { mounted.value = true; });
    const referenceId = ref('');
    const virtualDescription = ref('');
    let addedDescription: { element: HTMLElement; id: string } | undefined;
    const baseId = useId();
    const getTooltipId = (children: VNode[] = []) => {
      const reserved = new Set([referenceId.value, ...idTokens(virtualDescription.value)]);
      for (const child of children) {
        reserved.add(child.props?.id);
        idTokens(child.props?.['aria-describedby']).forEach((id) => reserved.add(id));
        if (props.trapFocus) idTokens(child.props?.['aria-controls']).forEach((id) => reserved.add(id));
      }
      let id = `${baseId.value}-tooltip`;
      while (reserved.has(id)) id += '-fallback';
      return id;
    };
    watch([mountedReference, () => props.virtualTriggering], ([target, virtual], _, onCleanup) => {
      const element = typeof HTMLElement !== 'undefined' && target instanceof HTMLElement ? target : undefined;
      const syncReference = () => {
        referenceId.value = element?.id ?? '';
        const ids = virtual ? idTokens(element?.getAttribute('aria-describedby')) : [];
        virtualDescription.value = ids.filter((id) => element !== addedDescription?.element || id !== addedDescription?.id).join(' ');
      };
      syncReference();
      if (element && typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver((records) => {
          syncReference();
          if (records.some(({ attributeName }) => attributeName === 'aria-describedby')) syncVirtualDescription();
        });
        observer.observe(element, { attributeFilter: virtual ? ['id', 'aria-describedby'] : ['id'] });
        onCleanup(() => observer.disconnect());
      }
    }, { immediate: true });
    let timer: ReturnType<typeof setTimeout> | undefined;
    let autoCloseTimer: ReturnType<typeof setTimeout> | undefined;
    let pending: boolean | undefined;
    let hovered = false;
    let focused = false;
    let restoringFocus = false;
    let showReason: Event | undefined;
    let hideReason: Event | undefined;
    let controlledRequest: { visible: boolean; event?: Event } | undefined;

    const triggers = computed(() => (Array.isArray(props.trigger) ? props.trigger : [props.trigger]));
    const legacyPosition = computed(() => (normalizeStyle([props.popperStyle]) as CSSProperties | undefined)?.position);
    const isControlled = () => typeof props.visible === 'boolean' && !owner?.vnode.props?.['onUpdate:visible'];
    const open = computed(() => !inactive.value && !props.disabled && (props.visible ?? internalVisible.value) &&
      !!(props.content || slots.content) && (!props.virtualTriggering || virtualReferenceReady.value));
    const position = useFloating({
      open,
      reference,
      floating,
      placement: () => props.placement,
      fallbackPlacements: () => props.fallbackPlacements,
      offset: () => props.offset,
      appendTo: () => props.appendTo,
      zIndex: () => props.zIndex,
      closeOnEscape: () => !isControlled(),
      closeOnOutside: () => !isControlled() && (props.closeOnOutside ??
        (!props.virtualTriggering || triggers.value.every((trigger) => trigger === 'click' || trigger === 'contextmenu'))),
      close: (event) => dismiss(event),
      trapFocus: props.trapFocus,
      focusOnOpen: false,
      popper: {
        options: () => props.popperOptions,
        strategy: () => props.strategy ?? (legacyPosition.value === 'fixed' ? 'fixed' : 'absolute'),
        gpuAcceleration: () => props.gpuAcceleration,
        roundOffsets: () => legacyPosition.value !== 'absolute',
        arrow: () => arrow.value,
        arrowOffset: () => props.arrowOffset,
        eventListeners: () => rendered.value && !inactive.value,
        teleported: () => props.teleported
      }
    });

    // Vue retains the previous target while Teleport is disabled.
    const teleportTarget = shallowRef(position.target.value);
    const initiallyInline = !props.teleported;
    watch([position.target, () => props.teleported], ([target, enabled]) => {
      if (enabled) teleportTarget.value = target;
    });
    const detachedTheme = computed(() =>
      props.teleported && position.target.value !== host?.value ? provider?.value : undefined
    );

    const clearTimer = () => {
      clearTimeout(timer);
      timer = undefined;
      pending = undefined;
    };
    const setReason = (value: boolean, event?: Event) => {
      if (value) showReason = event;
      else hideReason = event;
    };
    const setVisible = (value: boolean, event?: Event) => {
      if (isControlled() || value === open.value || (value && (props.disabled || inactive.value))) return;
      if (props.visible == null) {
        setReason(value, event);
        internalVisible.value = value;
        emit('update:visible', value);
        return;
      }
      const request = { visible: value, event };
      controlledRequest = request;
      emit('update:visible', value);
      void nextTick(() => {
        if (controlledRequest === request) controlledRequest = undefined;
      });
    };
    watch(() => props.visible, (value) => {
      clearTimer();
      if (typeof value === 'boolean') setReason(value, controlledRequest?.visible === value ? controlledRequest.event : undefined);
      controlledRequest = undefined;
    }, { flush: 'sync' });
    const schedule = (value: boolean, event?: Event, closeControlled?: () => void) => {
      const controlled = isControlled();
      if (controlled && !closeControlled) return;
      clearTimer();
      if (inactive.value || props.disabled || value === open.value) return;
      const toggle = () => {
        clearTimer();
        const trigger = triggerWrapper.value ?? reference.value;
        if (value && props.canOpen && (!trigger || !props.canOpen(trigger))) return;
        if (controlled) {
          if (isControlled()) closeControlled?.();
        } else setVisible(value, event);
      };
      const delay = value ? props.showAfter : props.hideAfter;
      if (delay > 0) {
        pending = value;
        timer = setTimeout(toggle, delay);
      } else toggle();
    };
    const onOpen = (event?: Event) => schedule(true, event);
    const onClose = (event?: Event) => schedule(false, event);
    const dismiss = (event: Event) => {
      if (props.onDismiss) props.onDismiss(event);
      else onClose(event);
    };
    const toggle = (event: Event) => {
      if (isControlled()) return;
      if (props.onDismiss && open.value) dismiss(event);
      else schedule(!(pending ?? open.value), event);
    };
    const onMouseenter = (event: MouseEvent) => {
      if (!triggers.value.includes('hover')) return;
      if (props.focusOnTarget && !props.disabled) {
        const target = reference.value;
        if (target instanceof HTMLElement) target.focus({ preventScroll: true });
      }
      hovered = true;
      onOpen(event);
    };
    const onMouseleave = (event: MouseEvent) => {
      if (!triggers.value.includes('hover')) return;
      hovered = false;
      if (props.enterable && event.relatedTarget instanceof Node && floating.value?.contains(event.relatedTarget)) return;
      if (!focused) onClose(event);
    };
    const onFocusin = (event: FocusEvent) => {
      if (restoringFocus || (!triggers.value.includes('focus') && !(props.hoverOnFocus && triggers.value.includes('hover')))) return;
      focused = true;
      onOpen(event);
    };
    const onFocusout = (event: FocusEvent) => {
      if (!focused) return;
      const nextTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
      const trigger = triggerWrapper.value ?? reference.value;
      if ((trigger instanceof HTMLElement && trigger.contains(nextTarget)) || floating.value?.contains(nextTarget)) return;
      focused = false;
      if (!hovered) onClose(event);
    };
    const onClick = (event: MouseEvent) => {
      if (event.button === 0 && triggers.value.includes('click')) toggle(event);
    };
    const onContextmenu = (event: MouseEvent) => {
      if (props.disabled || isControlled() || !triggers.value.includes('contextmenu')) return;
      event.preventDefault();
      toggle(event);
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (props.disabled || isControlled() || event.isComposing || event.defaultPrevented) return;
      const code = !event.code || event.code === 'Unidentified' ? event.key : event.code;
      if (!props.triggerKeys.some((key) => normalizeTriggerKey(key) === normalizeTriggerKey(code))) return;
      event.preventDefault();
      toggle(event);
    };
    const onPanelEnter = (event: MouseEvent) => {
      if (triggers.value.includes('hover') && props.enterable) {
        hovered = true;
        if (open.value || hideReason?.type === 'mouseleave') onOpen(event);
      }
    };
    const onPanelLeave = (event: MouseEvent) => {
      if (triggers.value.includes('hover') && props.enterable) {
        hovered = false;
        const anchor = triggerWrapper.value ?? reference.value;
        if (anchor instanceof HTMLElement && event.relatedTarget instanceof Node && anchor.contains(event.relatedTarget)) return;
        onClose(event);
      }
    };
    watch(virtualTarget, (target, _, onCleanup) => {
      if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return;
      const listeners = {
        mouseenter: onMouseenter, mouseleave: onMouseleave, focusin: onFocusin, focusout: onFocusout,
        click: onClick, contextmenu: onContextmenu, keydown: onKeydown
      };
      for (const [event, handler] of Object.entries(listeners)) {
        target.addEventListener(event, handler as EventListener);
      }
      onCleanup(() => {
        for (const [event, handler] of Object.entries(listeners)) {
          target.removeEventListener(event, handler as EventListener);
        }
        hovered = false;
        focused = false;
        clearTimer();
      });
    }, { immediate: true });
    const syncVirtualDescription = () => {
      const target = virtualTarget.value;
      if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement) || !open.value) return;
      const id = getTooltipId();
      if (floating.value?.id !== id) return;
      const description = target.getAttribute('aria-describedby');
      const linked = addId(description, id);
      if (linked !== description) {
        addedDescription = { element: target, id };
        target.setAttribute('aria-describedby', linked);
      }
    };
    watch([mountedVirtualTarget, open, floating, () => getTooltipId()], ([target, visible, panel, id], _, onCleanup) => {
      if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement) || !visible || !panel) return;
      syncVirtualDescription();
      onCleanup(() => {
        if (addedDescription?.element !== target || addedDescription.id !== id) return;
        addedDescription = undefined;
        const ids = idTokens(target.getAttribute('aria-describedby')).filter((value) => value !== id);
        if (ids.length) target.setAttribute('aria-describedby', ids.join(' '));
        else target.removeAttribute('aria-describedby');
      });
    }, { flush: 'post' });
    watch(open, (value, oldValue) => {
      if (!value && oldValue === undefined) return;
      if (value) rendered.value = true;
      clearTimeout(autoCloseTimer);
      if (value && props.autoClose > 0) autoCloseTimer = setTimeout(onClose, props.autoClose);
      emit(value ? 'open' : 'close', value);
      emit('visible-change', value);
    }, { immediate: true });
    watch(() => props.disabled, (disabled) => {
      if (!disabled) return;
      clearTimer();
      internalVisible.value = false;
      hovered = false;
      focused = false;
    });
    onBeforeUnmount(() => {
      clearTimer();
      clearTimeout(autoCloseTimer);
    });
    onActivated(() => { inactive.value = false; });
    onDeactivated(() => {
      clearTimer();
      clearTimeout(autoCloseTimer);
      if (open.value && isControlled()) props.onControlledClose?.();
      else setVisible(false);
      inactive.value = true;
      rendered.value = false;
      hovered = false;
      focused = false;
      showReason = undefined;
      hideReason = undefined;
    });

    const isFocusInsideContent = (event?: FocusEvent) => {
      const active = event?.relatedTarget ?? floating.value?.ownerDocument.activeElement;
      return active instanceof Node && !!floating.value?.contains(active);
    };
    const transition = computed<TransitionProps>(() => {
      const custom = typeof props.transition === 'string' ? { name: props.transition } : props.transition;
      const beforeEnter = () => {
        void position.update();
        emit('before-show', showReason);
      };
      const afterEnter = () => {
        if (props.trapFocus) floating.value?.focus({ preventScroll: true });
        emit('show', showReason);
        showReason = undefined;
      };
      return {
        name: ns.namespace.value === defaultNamespace ? 'el-fade-in-linear' : `${ns.namespace.value}-fade-in-linear`,
        appear: props.trapFocus || !props.persistent,
        ...custom,
        onBeforeEnter(el) {
          callTransitionHook(custom?.onBeforeEnter, el);
          beforeEnter();
        },
        onAfterEnter(el) {
          callTransitionHook(custom?.onAfterEnter, el);
          afterEnter();
        },
        onBeforeAppear(el) {
          callTransitionHook(custom?.onBeforeAppear ?? custom?.onBeforeEnter, el);
          beforeEnter();
        },
        onAfterAppear(el) {
          callTransitionHook(custom?.onAfterAppear ?? custom?.onAfterEnter, el);
          afterEnter();
        },
        onBeforeLeave(el) {
          callTransitionHook(custom?.onBeforeLeave, el);
          emit('before-hide', hideReason);
          if (hideReason instanceof KeyboardEvent && hideReason.key === 'Escape' && el.contains(el.ownerDocument.activeElement)) {
            restoringFocus = true;
            position.restoreFocus();
            restoringFocus = false;
          }
        },
        onAfterLeave(el) {
          callTransitionHook(custom?.onAfterLeave, el);
          emit('hide', hideReason);
          hideReason = undefined;
          if (!open.value) rendered.value = false;
        }
      };
    });

    expose({
      popperRef: {
        get triggerRef() { return reference.value; },
        get contentRef() { return floating.value ?? undefined; },
        get popperInstanceRef() { return position.instance.value; }
      },
      contentRef: computed(() => floating.value ? {
        popperContentRef: floating.value,
        isFocusInsideContent,
        updatePopper: position.update
      } : undefined),
      isFocusInsideContent,
      onOpen,
      onClose: (event?: Event) => schedule(false, event, props.onControlledClose),
      show: () => {
        if (props.visible != null) return;
        clearTimer();
        setVisible(true);
      },
      hide: (event?: Event) => {
        clearTimer();
        setVisible(false, event);
      },
      update: position.update,
      updatePopper: position.update
    });

    const setTriggerWrapper = (node: Element | ComponentPublicInstance | null) => {
      const wrapper = node instanceof HTMLElement ? node : undefined;
      triggerWrapper.value = wrapper;
      const child = wrapper?.firstElementChild;
      triggerElement.value = child instanceof HTMLElement && wrapper?.childElementCount === 1 ? child : wrapper;
    };
    const updateTriggerRoot = (vnode: VNode) => {
      const wrapper = triggerWrapper.value;
      if (wrapper && vnode.el?.parentNode === wrapper) setTriggerWrapper(wrapper);
    };

    return () => {
      const renderPanel = !inactive.value && (open.value || props.persistent || rendered.value);
      const panelContent = renderPanel
        ? slots.content?.() ?? (props.rawContent ? <span innerHTML={props.content} /> : props.content)
        : undefined;
      const children = props.virtualTriggering ? [] : slots.default?.() ?? [];
      const tooltipId = getTooltipId(children);
      const panel = renderPanel ? (
        <div
          {...position.attributes.value.popper}
          id={tooltipId}
          ref={floating}
          class={[ns.b(), ns.m(props.effect), detachedTheme.value && themeScope.b(), props.popperClass]}
          data-theme={detachedTheme.value?.theme}
          role={props.contentRole}
          tabindex={props.trapFocus ? -1 : undefined}
          aria-label={props.ariaLabel}
          aria-hidden={open.value ? undefined : 'true'}
          style={[detachedTheme.value ? getThemeStyle(detachedTheme.value, ns.cssVarName) : {}, position.style.value, props.popperStyle ?? {}]}
          data-placement={position.placement.value}
          onMouseenter={onPanelEnter}
          onMouseleave={onPanelLeave}
          onFocusout={onFocusout}>
          {props.showArrow && (
            <span
              {...position.attributes.value.arrow}
              ref={arrow}
              class={[ns.e('arrow'), props.arrowClass]}
              style={position.arrowStyle.value}
              data-horizontal={position.placement.value.split('-')[0] === 'top' || position.placement.value.split('-')[0] === 'bottom' ? 'center' : position.placement.value.split('-')[0]}
              data-vertical={position.placement.value.split('-')[0] === 'top' || position.placement.value.split('-')[0] === 'bottom' ? position.placement.value.split('-')[0] : position.placement.value.split('-')[1] || 'center'}
            />
          )}
          <div class={ns.e('content')}>
            {panelContent}
          </div>
        </div>
      ) : null;
      const transitioned = (
        <Transition {...transition.value} persisted>
          {panel ? withDirectives(panel, [[vShow, open.value]]) : panel}
        </Transition>
      );
      // Vue 3.2 会把内联 Teleport 的结束标记当作 Transition 的组件边界。
      const content = (
        <Teleport to={teleportTarget.value} disabled={!props.teleported}>
          {initiallyInline ? <>{transitioned}</> : transitioned}
        </Teleport>
      );
      if (props.virtualTriggering) return <>{content}</>;
      return (
        <>
          <span
            class={[ns.e('trigger'), props.triggerClass]}
            ref={setTriggerWrapper}
            onMouseenter={onMouseenter}
            onMouseleave={onMouseleave}
            onClick={onClick}
            onContextmenu={onContextmenu}
            onFocusin={onFocusin}
            onFocusout={onFocusout}
            onKeydown={onKeydown}>
            {children.map((vnode) =>
              cloneVNode(vnode, {
                onVnodeUpdated: updateTriggerRoot,
                ...(props.trapFocus ? {
                  'aria-haspopup': props.contentRole,
                  'aria-expanded': open.value,
                  'aria-controls': open.value
                    ? addId(vnode.props?.['aria-controls'], tooltipId)
                    : vnode.props?.['aria-controls']
                } : undefined),
                'aria-describedby': open.value
                  ? addId(vnode.props?.['aria-describedby'], tooltipId)
                  : vnode.props?.['aria-describedby']
              })
            )}
          </span>
          {content}
        </>
      );
    };
  }
});
