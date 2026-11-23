import {
  Comment,
  Fragment,
  computed,
  defineComponent,
  onBeforeUnmount,
  provide,
  reactive,
  ref,
  watch,
  type PropType,
  type VNode
} from 'vue';
import { createBEM } from '../../../src/utils/create';
import { useNamespace } from '../../hooks/use-namespace';
import { carouselKey } from './context';

export type CarouselTrigger = 'hover' | 'click';
export type CarouselArrow = 'always' | 'hover' | 'never';
export type CarouselIndicatorPosition = '' | 'outside' | 'none';
export type CarouselType = '' | 'card';
export type CarouselDirection = 'horizontal' | 'vertical';

const flatten = (nodes: VNode[]): VNode[] => {
  const result: VNode[] = [];
  nodes.forEach((node) => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      result.push(...flatten(node.children as VNode[]));
    } else if (node.type !== Comment) {
      result.push(node);
    }
  });
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isItemVNode = (node: VNode): boolean => (node.type as any)?.name === 'i-carousel-item';

export default defineComponent({
  name: 'i-carousel',
  props: {
    height: { type: String, default: '' },
    initialIndex: { type: Number, default: 0 },
    trigger: { type: String as PropType<CarouselTrigger>, default: 'hover' },
    autoplay: { type: Boolean, default: true },
    interval: { type: Number, default: 3000 },
    indicatorPosition: { type: String as PropType<CarouselIndicatorPosition>, default: '' },
    arrow: { type: String as PropType<CarouselArrow>, default: 'hover' },
    type: { type: String as PropType<CarouselType>, default: '' },
    cardScale: { type: Number, default: 0.83 },
    loop: { type: Boolean, default: true },
    direction: { type: String as PropType<CarouselDirection>, default: 'horizontal' },
    pauseOnHover: { type: Boolean, default: true },
    motionBlur: Boolean
  },
  emits: ['change'],
  setup(props, { slots, emit, expose }) {
    const bem = createBEM(useNamespace('carousel').b);
    const active = ref(0);
    const paused = ref(false);
    const timer = ref<ReturnType<typeof setInterval>>();
    const order = ref<number[]>([]);
    const states = reactive(new Map<number, { name?: string | number; label?: string | number }>());
    let initialized = false;

    const items = computed(() =>
      order.value.map((uid, index) => {
        const state = states.get(uid);
        return { uid, index, name: state?.name ?? index, label: state?.label ?? '' };
      })
    );
    const count = computed(() => items.value.length);
    const vertical = computed(() => props.direction === 'vertical');
    const card = computed(() => props.type === 'card');

    const clampIndex = (index: number, value: number) => Math.min(Math.max(index, 0), Math.max(value - 1, 0));
    watch(
      count,
      (value) => {
        if (value <= 0) return;
        if (!initialized) {
          initialized = true;
          active.value = clampIndex(props.initialIndex, value);
          return;
        }
        if (active.value > value - 1) active.value = value - 1;
      },
      { immediate: true }
    );

    const stop = () => {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = undefined;
      }
    };
    const start = () => {
      stop();
      if (!props.autoplay || props.interval <= 0 || paused.value || count.value <= 1) return;
      timer.value = setInterval(() => go(active.value + 1), props.interval);
    };
    watch([() => props.autoplay, () => props.interval, count, paused], start, { immediate: true });
    onBeforeUnmount(stop);

    const go = (index: number) => {
      const value = count.value;
      if (value <= 1) return;
      const next = props.loop ? ((index % value) + value) % value : clampIndex(index, value);
      if (next === active.value) return;
      const prevIndex = active.value;
      active.value = next;
      emit('change', next, prevIndex);
      start();
    };
    const prev = () => go(active.value - 1);
    const next = () => go(active.value + 1);
    const setActiveItem = (target: number | string) => {
      const byName = items.value.findIndex((item) => item.name === target);
      if (byName >= 0) {
        go(byName);
        return;
      }
      if (typeof target === 'number') go(target);
    };

    expose({ activeIndex: computed(() => active.value), setActiveItem, prev, next });
    provide(carouselKey, {
      active,
      order,
      states,
      card,
      cardScale: computed(() => props.cardScale),
      register: (uid, itemProps) => {
        if (!order.value.includes(uid)) order.value.push(uid);
        states.set(uid, itemProps);
      },
      unregister: (uid) => {
        order.value = order.value.filter((item) => item !== uid);
        states.delete(uid);
      }
    });

    const onKeydown = (event: KeyboardEvent) => {
      const prevKey = vertical.value ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = vertical.value ? 'ArrowDown' : 'ArrowRight';
      if (event.key === prevKey) {
        event.preventDefault();
        prev();
      } else if (event.key === nextKey) {
        event.preventDefault();
        next();
      }
    };

    return () => {
      const offset = card.value ? `calc(25% - ${active.value * 50}%)` : `${-active.value * 100}%`;
      const trackStyle = vertical.value
        ? { transform: `translateY(${offset})` }
        : { transform: `translateX(${offset})` };
      const showPrev = props.arrow !== 'never' && count.value > 1 && (props.loop || active.value > 0);
      const showNext = props.arrow !== 'never' && count.value > 1 && (props.loop || active.value < count.value - 1);
      const children = slots.default ? flatten(slots.default()).filter(isItemVNode) : [];
      return (
        <div
          class={[
            bem({ [`arrow-${props.arrow}`]: true, 'indicator-outside': props.indicatorPosition === 'outside' }),
            { 'is-vertical': vertical.value, 'is-card': card.value, 'is-motion-blur': props.motionBlur }
          ]}
          tabindex={0}
          role='region'
          aria-roledescription='carousel'
          onMouseenter={() => props.pauseOnHover && (paused.value = true)}
          onMouseleave={() => props.pauseOnHover && (paused.value = false)}
          onKeydown={onKeydown}>
          <div class={bem('stage')} style={props.height ? { height: props.height } : undefined}>
            <div class={bem('track')} style={trackStyle}>
              {children}
            </div>
            {showPrev && (
              <button
                type='button'
                class={bem('arrow', { left: true })}
                aria-label='上一张'
                onClick={prev}>
                ‹
              </button>
            )}
            {showNext && (
              <button
                type='button'
                class={bem('arrow', { right: true })}
                aria-label='下一张'
                onClick={next}>
                ›
              </button>
            )}
          </div>
          {props.indicatorPosition !== 'none' && count.value > 0 && (
            <ul class={bem('indicators')}>
              {items.value.map((item) => (
                <li key={item.name} class={{ 'is-active': item.index === active.value }}>
                  <button
                    type='button'
                    class={bem('indicator')}
                    aria-label={`切换到第 ${item.index + 1} 张`}
                    aria-current={item.index === active.value ? 'true' : undefined}
                    onClick={() => props.trigger === 'click' && go(item.index)}
                    onMouseenter={() => props.trigger === 'hover' && go(item.index)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    };
  }
});
