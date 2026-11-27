import {
  Teleport,
  Fragment,
  camelize,
  getCurrentInstance,
  isVNode,
  onUpdated,
  type VNode,
  computed,
  defineComponent,
  nextTick,
  ref,
  watch,
  type CSSProperties,
  type PropType
} from 'vue';
import { useFloating, useFloatingTheme, type Placement } from '../../../src/utils/use-floating';
import { useNamespace } from '../../hooks/use-namespace';
import { useConfig } from '../config-provider/context';
import TourStepComponent from '../tour-step';
import Button from '../button';
import Icon from '../icon';
import type { TourPlacement, TourStep, TourTarget, TourType } from './types';

export default defineComponent({
  name: 'i-tour',
  props: {
    modelValue: Boolean,
    current: { type: Number, default: 0 },
    steps: { type: Array as PropType<TourStep[]>, default: () => [] },
    mask: {
      type: [Boolean, Object] as PropType<boolean | { style?: Record<string, string>; color?: string }>,
      default: true
    },
    type: { type: String as PropType<TourType>, default: 'default' },
    showArrow: { type: Boolean, default: undefined },
    arrow: { type: Boolean, default: true },
    placement: { type: String as PropType<TourPlacement>, default: 'bottom' },
    showClose: { type: Boolean, default: true },
    closeIcon: [String, Object],
    contentStyle: Object as PropType<CSSProperties>,
    nextButtonText: String,
    prevButtonText: String,
    zIndex: { type: Number, default: 2000 },
    gap: { type: [Number, Object] as PropType<number | { offset?: number | [number, number]; radius?: number }>, default: 10 },
    appendTo: [String, Object] as PropType<string | HTMLElement>,
    closeOnPressEscape: { type: Boolean, default: true },
    targetAreaClickable: { type: Boolean, default: true },
    scrollIntoViewOptions: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
    target: [String, Object, Function] as PropType<TourTarget>
  },
  emits: ['update:modelValue', 'update:current', 'change', 'prev', 'next', 'finish', 'close'],
  setup(props, { emit, expose, slots }) {
    const ns = useNamespace('tour');
    const config = useConfig();
    const floating = ref<HTMLElement>();
    const reference = ref<HTMLElement>();
    const spotlight = ref<{ top: number; left: number; width: number; height: number }>();

    const instance = getCurrentInstance();
    const innerCurrent = ref(props.current);
    watch(
      () => props.current,
      (value) => {
        if (innerCurrent.value === value) return;
        innerCurrent.value = value;
        if (props.modelValue) emit('change', value);
      }
    );
    let declared: VNode[] = [];
    const findSteps = (nodes: unknown[]): VNode[] => nodes.flatMap((node) => {
      if (!isVNode(node)) return [];
      if (node.type === TourStepComponent) return [node];
      return node.type === Fragment && Array.isArray(node.children) ? findSteps(node.children) : [];
    });
    const stepCount = () => declared.length || props.steps.length;
    const activeIndex = () => Math.max(0, Math.min(innerCurrent.value, stepCount() - 1));
    const currentNode = () => declared[activeIndex()];
    const step = (): TourStep => {
      const node = currentNode();
      if (!node) return props.steps[activeIndex()] ?? {};
      return Object.fromEntries(Object.entries(node.props ?? {}).map(([key, value]) => [
        camelize(key), value === '' && ['mask', 'show-arrow', 'show-close'].includes(key) ? true : value
      ])) as TourStep;
    };
    const isLast = () => activeIndex() >= stepCount() - 1;
    const resolvedPlacement = () => step().placement ?? props.placement;
    const isCenter = () => resolvedPlacement() === 'center' || !reference.value;

    const resolveTarget = (): HTMLElement | null => {
      const value = step().target ?? props.target ?? null;
      if (!value) return null;
      if (typeof value === 'string') return document.querySelector<HTMLElement>(value);
      if (typeof value === 'function') return value();
      return value;
    };

    const position = useFloating({
      open: computed(() => props.modelValue),
      appendTo: () => props.appendTo,
      trapFocus: true,
      closeOnEscape: () => props.closeOnPressEscape,
      reference,
      floating,
      placement: () => resolvedPlacement() as Placement,
      close: () => close(),
      closeOnOutside: () => false,
      options: () => ({ offset: 12 })
    });
    const floatingTheme = useFloatingTheme(position.target, () => true);

    const syncTarget = (scroll = true) => {
      if (typeof document === 'undefined') return;
      const target = resolveTarget();
      reference.value = target ?? undefined;
      if (target) {
        const scrollOptions = step().scrollIntoViewOptions ?? props.scrollIntoViewOptions;
        if (scroll && scrollOptions !== false) target.scrollIntoView?.(scrollOptions === true ? undefined : scrollOptions);
        const rect = target.getBoundingClientRect();
        // 聚光框向四周扩张 gap，让遮罩与目标之间留出呼吸空间。
        const gap = typeof props.gap === 'number' ? props.gap : props.gap.offset ?? 10;
        const [horizontal, vertical] = Array.isArray(gap) ? gap : [gap, gap];
        spotlight.value = {
          top: rect.top - vertical,
          left: rect.left - horizontal,
          width: rect.width + horizontal * 2,
          height: rect.height + vertical * 2
        };
      } else {
        spotlight.value = undefined;
      }
    };
    const refresh = (scroll = true) => {
      syncTarget(scroll);
      position.update();
    };

    watch(
      [ns.namespace, position.target, () => config.value.theme, () => config.value.size],
      () => { if (props.modelValue) refresh(false); },
      { flush: 'post' }
    );
    watch(
      () => [props.modelValue, innerCurrent.value, props.steps, props.gap, step().target, props.target],
      () => {
        if (props.modelValue) nextTick(() => refresh());
      },
      { deep: true, immediate: true }
    );
    onUpdated(() => {
      if (props.modelValue && (resolveTarget() ?? undefined) !== reference.value) refresh();
    });
    const onScroll = () => refresh(false);
    const onResize = () => refresh();
    watch(() => props.modelValue, (visible, previouslyVisible, cleanup) => {
      if (!visible) {
        if (previouslyVisible && innerCurrent.value !== 0) {
          emit('update:current', 0);
          if (!instance?.vnode.props?.['onUpdate:current']) innerCurrent.value = 0;
        }
        return;
      }
      if (typeof window === 'undefined') return;
      const previousFocus = document.activeElement;
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      const observer = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(() => {
        if ((resolveTarget() ?? undefined) !== reference.value) refresh();
      });
      observer?.observe(document.body, { childList: true, subtree: true });
      cleanup(() => {
        observer?.disconnect();
        if (previousFocus instanceof HTMLElement) nextTick(() => previousFocus.focus());
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
      });
    }, { immediate: true });

    const close = (notifyStep = false) => {
      emit('update:modelValue', false);
      emit('close', activeIndex());
      if (notifyStep) (currentNode()?.props?.onClose as (() => void) | undefined)?.();
    };
    const go = (index: number) => {
      const next = Math.min(Math.max(0, stepCount() - 1), Math.max(0, index));
      if (next === innerCurrent.value) return;
      emit('update:current', next);
      if (!instance?.vnode.props?.['onUpdate:current']) {
        innerCurrent.value = next;
        emit('change', next);
      }
    };
    const prev = () => {
      emit('prev', activeIndex() - 1);
      const callback = step().prevButtonProps?.onClick;
      go(activeIndex() - 1);
      callback?.();
    };
    const next = () => {
      if (isLast()) {
        close(true);
        emit('finish');
        step().nextButtonProps?.onClick?.();
        return;
      }
      emit('next', activeIndex() + 1);
      const callback = step().nextButtonProps?.onClick;
      go(activeIndex() + 1);
      callback?.();
    };
    const buttonAttributes = (settings: TourStep['nextButtonProps']) => {
      if (!settings) return undefined;
      const { onClick, children, ...attributes } = settings;
      void onClick;
      void children;
      return attributes;
    };
    expose({ go, prev, next });

    return () => {
      const provided = slots.default?.({ current: activeIndex() }) ?? [];
      const nodes = findSteps(provided);
      declared = nodes;
      if (!props.modelValue) return null;
      const stepSlots = currentNode()?.children as Record<string, (() => VNode[]) | undefined> | null;
      const currentStep = step();
      const maskValue = currentStep.mask ?? props.mask;
      const maskConfig = typeof maskValue === 'object' ? maskValue : undefined;
      const showMask = maskValue !== false;
      const maskColor = maskConfig?.color ?? 'rgba(0, 0, 0, 0.5)';
      const maskStyle = maskConfig?.style;
      const { scopeClass, theme, style: themeStyle } = floatingTheme.value;
      const showClose = currentStep.showClose ?? props.showClose;
      const showArrow = (currentStep.showArrow ?? currentStep.arrow ?? props.showArrow ?? props.arrow) && !isCenter() && !!spotlight.value;
      return (
        <Teleport to={position.target.value}>
          {showMask &&
            (spotlight.value ? (
              <div
                class={[ns.e('spotlight'), scopeClass]}
                data-theme={theme}
                style={[themeStyle ?? {}, {
                  top: `${spotlight.value.top}px`,
                  left: `${spotlight.value.left}px`,
                  width: `${spotlight.value.width}px`,
                  height: `${spotlight.value.height}px`,
                  boxShadow: `0 0 0 9999px ${maskColor}`,
                  zIndex: props.zIndex,
                  pointerEvents: props.targetAreaClickable ? 'none' : 'auto',
                  borderRadius: typeof props.gap === 'object' ? `${props.gap.radius ?? 2}px` : undefined,
                  ...maskStyle
                }]}
              />
            ) : (
              <div
                class={[ns.e('mask'), scopeClass]}
                data-theme={theme}
                style={[themeStyle ?? {}, { background: maskColor, zIndex: props.zIndex, ...maskStyle }]}
              />
            ))}
          <div
            ref={floating}
            class={[ns.b(), ns.m(currentStep.type ?? props.type), scopeClass]}
            data-theme={theme}
            style={[
              themeStyle ?? {},
              isCenter()
                ? {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: props.zIndex + 1
                  }
                : [position.style.value, { zIndex: props.zIndex + 1 }],
              maskStyle ?? {},
              currentStep.contentStyle ?? props.contentStyle ?? {}
            ]}
            tabindex={-1}
            role='dialog'
            aria-modal='true'>
            {showArrow && <div class={ns.e('arrow')} style={position.arrowStyle.value} />}
            {showClose && (
              <button type='button' class={ns.e('close')} aria-label='关闭引导' onClick={() => close(true)}>
                {slots.close?.({ current: activeIndex() }) ??
                  ((currentStep.closeIcon ?? props.closeIcon) ? <Icon icon={currentStep.closeIcon ?? props.closeIcon} aria-hidden='true' /> : '×')}
              </button>
            )}
            {slots.default && !nodes.length ? (
              provided
            ) : (
              <>
                {(stepSlots?.header || currentStep.title) && <div class={ns.e('title')}>{stepSlots?.header?.() ?? currentStep.title}</div>}
                {(stepSlots?.default || currentStep.description) && <div class={ns.e('description')}>{stepSlots?.default?.() ?? currentStep.description}</div>}
              </>
            )}
            <div class={ns.e('footer')}>
              {(slots.indicators ?? slots.indicator)?.({ current: activeIndex(), total: stepCount() }) ?? (
                <span class={ns.e('indicators')} aria-hidden='true'>
                  {Array.from({ length: stepCount() }, (_, index) =>
                    <span key={index} class={[ns.e('dot'), ns.is('active', index === activeIndex())]} />)}
                </span>
              )}
              {activeIndex() > 0 && (
                <Button {...buttonAttributes(currentStep.prevButtonProps)} class={ns.e('prev')} onClick={prev}>
                  {slots['prev-btn']?.({ current: activeIndex() }) ??
                    (currentStep.prevButtonProps?.children ?? currentStep.prevButtonText ?? props.prevButtonText ?? '上一步')}
                </Button>
              )}
              <Button {...buttonAttributes(currentStep.nextButtonProps)} class={ns.e('next')} onClick={next}>
                {slots['next-btn']?.({ current: activeIndex() }) ??
                  (currentStep.nextButtonProps?.children ?? currentStep.nextButtonText ?? props.nextButtonText ?? (isLast() ? '完成' : '下一步'))}
              </Button>
            </div>
          </div>
        </Teleport>
      );
    };
  }
});
