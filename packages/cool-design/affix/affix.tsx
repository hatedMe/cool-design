import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType
} from 'vue';

export type AffixPosition = 'top' | 'bottom';
export type AffixTargetContainer = string | HTMLElement;

export default defineComponent({
  name: 'i-affix',
  props: {
    /** 偏移距离，适用于 top/bottom 两种 position */
    offset: { type: Number, default: undefined },
    /** 兼容别名：position=top 时的偏移，offset 优先 */
    offsetTop: { type: Number, default: 0 },
    /** 兼容别名：position=bottom 时的偏移，offset 优先 */
    offsetBottom: { type: Number, default: undefined },
    position: { type: String as PropType<AffixPosition>, default: 'top' },
    /** 固定判定边界容器的选择器 */
    target: String,
    /** 监听滚动的容器，默认 window */
    targetContainer: [String, Object] as PropType<AffixTargetContainer>,
    zIndex: { type: Number, default: 100 }
  },
  emits: ['change', 'scroll'],
  setup(props, { slots, emit, expose }) {
    const placeholder = ref<HTMLElement>();
    const content = ref<HTMLElement>();
    const fixed = ref(false);
    const fixedStyle = ref<Record<string, string>>();
    const placeholderHeight = ref<string>();

    const resolveTarget = () => {
      if (!props.target) return undefined;
      return document.querySelector<HTMLElement>(props.target) ?? undefined;
    };

    const resolveScrollContainer = (): HTMLElement | Window => {
      const value = props.targetContainer;
      if (value instanceof HTMLElement) return value;
      if (typeof value === 'string') return document.querySelector<HTMLElement>(value) ?? window;
      return window;
    };

    const resolvedOffset = () =>
      props.offset ?? (props.position === 'bottom' ? props.offsetBottom : props.offsetTop) ?? 0;

    const update = () => {
      const ph = placeholder.value;
      const ct = content.value;
      if (!ph || !ct) return;
      const target = resolveTarget();
      const boundary = target
        ? target.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };
      const rect = ph.getBoundingClientRect();
      const offset = resolvedOffset();
      const shouldFix =
        props.position === 'bottom'
          ? rect.bottom > boundary.bottom - offset
          : rect.top < boundary.top + offset;
      if (shouldFix !== fixed.value) {
        fixed.value = shouldFix;
        emit('change', shouldFix);
      }
      if (shouldFix) {
        placeholderHeight.value = `${ct.getBoundingClientRect().height}px`;
        fixedStyle.value = {
          position: 'fixed',
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          zIndex: `${props.zIndex}`,
          ...(props.position === 'bottom' ? { bottom: `${offset}px` } : { top: `${offset}px` })
        };
      } else {
        fixedStyle.value = undefined;
        placeholderHeight.value = undefined;
      }
    };

    const scrollTopOf = (container: HTMLElement | Window) =>
      container === window
        ? window.scrollY || document.documentElement.scrollTop || 0
        : (container as HTMLElement).scrollTop;

    let scrollContainer: HTMLElement | Window = window;
    const onScroll = () => {
      update();
      emit('scroll', { scrollTop: scrollTopOf(scrollContainer), fixed: fixed.value });
    };
    const onResize = () => update();
    const bindScrollContainer = () => {
      scrollContainer.removeEventListener('scroll', onScroll);
      scrollContainer = resolveScrollContainer();
      scrollContainer.addEventListener('scroll', onScroll, { passive: true });
      // 滚动容器不是 window 时，window 滚动同样会改变元素位置，仍需监听
      if (scrollContainer !== window) window.addEventListener('scroll', onScroll, { passive: true });
    };
    const unbindAll = () => {
      scrollContainer.removeEventListener('scroll', onScroll);
      if (scrollContainer !== window) window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
    onMounted(() => {
      bindScrollContainer();
      window.addEventListener('resize', onResize);
      nextTick(() => update());
    });
    onBeforeUnmount(unbindAll);
    watch(
      () => [
        props.offset,
        props.offsetTop,
        props.offsetBottom,
        props.position,
        props.target,
        props.targetContainer,
        props.zIndex
      ],
      () => {
        bindScrollContainer();
        nextTick(() => update());
      }
    );

    expose({ update });

    return () => (
      <div ref={placeholder} class='i-affix' style={{ height: placeholderHeight.value }}>
        <div
          ref={content}
          class={['i-affix__content', fixed.value && 'is-fixed']}
          style={fixedStyle.value}>
          {slots.default?.()}
        </div>
      </div>
    );
  }
});
