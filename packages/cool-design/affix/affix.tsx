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

export default defineComponent({
  name: 'i-affix',
  props: {
    offsetTop: { type: Number, default: 0 },
    offsetBottom: Number,
    position: { type: String as PropType<AffixPosition>, default: 'top' },
    target: String,
    zIndex: { type: Number, default: 100 }
  },
  emits: ['change'],
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

    const update = () => {
      const ph = placeholder.value;
      const ct = content.value;
      if (!ph || !ct) return;
      const target = resolveTarget();
      const boundary = target
        ? target.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };
      const rect = ph.getBoundingClientRect();
      const shouldFix =
        props.position === 'bottom'
          ? rect.bottom > boundary.bottom - (props.offsetBottom ?? 0)
          : rect.top < boundary.top + props.offsetTop;
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
          ...(props.position === 'bottom'
            ? { bottom: `${props.offsetBottom ?? 0}px` }
            : { top: `${props.offsetTop}px` })
        };
      } else {
        fixedStyle.value = undefined;
        placeholderHeight.value = undefined;
      }
    };

    const onScroll = () => update();
    const onResize = () => update();
    onMounted(() => {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      nextTick(() => update());
    });
    onBeforeUnmount(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    });
    watch(
      () => [props.offsetTop, props.offsetBottom, props.position, props.target, props.zIndex],
      () => {
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
