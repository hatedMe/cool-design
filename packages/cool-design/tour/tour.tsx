import {
  Teleport,
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type PropType
} from 'vue';
import { useFloating, type Placement } from '../../../src/utils/use-floating';
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
    arrow: { type: Boolean, default: true },
    placement: { type: String as PropType<TourPlacement>, default: 'bottom' },
    showClose: { type: Boolean, default: true },
    closeIcon: [String, Object],
    nextButtonText: String,
    prevButtonText: String,
    zIndex: { type: Number, default: 2000 },
    gap: { type: Number, default: 10 },
    scrollIntoViewOptions: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
    target: [String, Object, Function] as PropType<TourTarget>
  },
  emits: ['update:modelValue', 'update:current', 'change', 'prev', 'next', 'finish', 'close'],
  setup(props, { emit, expose, slots }) {
    const floating = ref<HTMLElement>();
    const reference = ref<HTMLElement>();
    const spotlight = ref<{ top: number; left: number; width: number; height: number }>();

    const innerCurrent = ref(props.current);
    watch(
      () => props.current,
      (value) => {
        innerCurrent.value = value;
      }
    );
    const step = computed<TourStep>(() => props.steps[innerCurrent.value] ?? {});
    const isLast = computed(() => innerCurrent.value >= props.steps.length - 1);
    const resolvedPlacement = computed(() => step.value.placement ?? props.placement);
    const isCenter = computed(() => resolvedPlacement.value === 'center');

    const resolveTarget = (): HTMLElement | null => {
      const value = step.value.target ?? props.target ?? null;
      if (!value) return null;
      if (typeof value === 'string') return document.querySelector<HTMLElement>(value);
      if (typeof value === 'function') return value();
      return value;
    };

    const position = useFloating({
      open: computed(() => props.modelValue && !isCenter.value),
      reference,
      floating,
      placement: () => resolvedPlacement.value as Placement,
      close: () => close(),
      closeOnOutside: () => false,
      options: () => ({ offset: 12 })
    });

    const syncTarget = () => {
      const target = resolveTarget();
      reference.value = target ?? undefined;
      if (target) {
        const scrollOptions = step.value.scrollIntoViewOptions ?? props.scrollIntoViewOptions;
        target.scrollIntoView?.(scrollOptions === true ? undefined : scrollOptions ?? undefined);
        const rect = target.getBoundingClientRect();
        // 聚光框向四周扩张 gap，让遮罩与目标之间留出呼吸空间。
        const gap = Math.max(0, props.gap);
        spotlight.value = {
          top: rect.top - gap,
          left: rect.left - gap,
          width: rect.width + gap * 2,
          height: rect.height + gap * 2
        };
      } else {
        spotlight.value = undefined;
      }
    };
    const refresh = () => {
      syncTarget();
      position.update();
    };

    watch(
      () => [props.modelValue, props.current, props.steps, props.gap],
      () => {
        if (props.modelValue) nextTick(() => refresh());
      },
      { deep: true, immediate: true }
    );
    const onScroll = () => refresh();
    const onResize = () => refresh();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    onBeforeUnmount(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    });

    const close = () => {
      emit('close', innerCurrent.value);
      emit('update:modelValue', false);
    };
    const go = (index: number) => {
      const next = Math.min(props.steps.length - 1, Math.max(0, index));
      if (next === innerCurrent.value) return;
      innerCurrent.value = next;
      emit('update:current', next);
      emit('change', next);
    };
    const prev = () => {
      emit('prev', innerCurrent.value - 1);
      go(innerCurrent.value - 1);
    };
    const next = () => {
      if (isLast.value) {
        emit('finish');
        close();
        return;
      }
      emit('next', innerCurrent.value + 1);
      go(innerCurrent.value + 1);
    };
    expose({ go, prev, next });

    return () => {
      if (!props.modelValue) return null;
      const currentStep = step.value;
      const maskValue = currentStep.mask ?? props.mask;
      const maskConfig = typeof maskValue === 'object' ? maskValue : undefined;
      const showMask = maskValue !== false;
      const maskColor = maskConfig?.color ?? 'rgba(0, 0, 0, 0.5)';
      const maskStyle = maskConfig?.style;
      const showClose = currentStep.showClose ?? props.showClose;
      const showArrow = (currentStep.arrow ?? props.arrow) && !isCenter.value && !!spotlight.value;
      return (
        <Teleport to='body'>
          {showMask &&
            (spotlight.value ? (
              <div
                class='i-tour__spotlight'
                style={{
                  top: `${spotlight.value.top}px`,
                  left: `${spotlight.value.left}px`,
                  width: `${spotlight.value.width}px`,
                  height: `${spotlight.value.height}px`,
                  boxShadow: `0 0 0 9999px ${maskColor}`,
                  zIndex: props.zIndex,
                  ...maskStyle
                }}
              />
            ) : (
              <div class='i-tour__mask' style={{ background: maskColor, zIndex: props.zIndex, ...maskStyle }} />
            ))}
          <div
            ref={floating}
            class={['i-tour', `i-tour--${props.type}`]}
            style={[
              isCenter.value
                ? {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: props.zIndex + 1
                  }
                : [position.style.value, { zIndex: props.zIndex + 1 }],
              maskStyle
            ]}
            role='dialog'
            aria-modal='true'>
            {showArrow && <div class='i-tour__arrow' style={position.arrowStyle.value} />}
            {showClose && (
              <button type='button' class='i-tour__close' aria-label='关闭引导' onClick={close}>
                {slots.close?.({ current: innerCurrent.value }) ??
                  (props.closeIcon ? <Icon icon={props.closeIcon} aria-hidden='true' /> : '×')}
              </button>
            )}
            {slots.default ? (
              slots.default({ current: innerCurrent.value })
            ) : (
              <>
                {currentStep.title && <div class='i-tour__title'>{currentStep.title}</div>}
                {currentStep.description && <div class='i-tour__description'>{currentStep.description}</div>}
              </>
            )}
            <div class='i-tour__footer'>
              {slots.indicator?.({ current: innerCurrent.value, total: props.steps.length })}
              {innerCurrent.value > 0 && (
                <button type='button' class='i-tour__prev' onClick={prev}>
                  {slots['prev-btn']?.({ current: innerCurrent.value }) ??
                    (currentStep.prevButtonText ?? props.prevButtonText ?? '上一步')}
                </button>
              )}
              <button type='button' class='i-tour__next' onClick={next}>
                {slots['next-btn']?.({ current: innerCurrent.value }) ??
                  (currentStep.nextButtonText ?? props.nextButtonText ?? (isLast.value ? '完成' : '下一步'))}
              </button>
            </div>
          </div>
        </Teleport>
      );
    };
  }
});
