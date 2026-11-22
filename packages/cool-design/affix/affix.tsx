import {
  Teleport,
  computed,
  defineComponent,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  shallowRef,
  watch,
  type CSSProperties,
  type PropType
} from 'vue';

export type AffixPosition = 'top' | 'bottom';
export type AffixTargetContainer = string | HTMLElement;

export interface AffixScrollEvent {
  scrollTop: number;
  fixed: boolean;
}

export default defineComponent({
  name: 'i-affix',
  props: {
    offset: Number,
    offsetTop: { type: Number, default: 0 },
    offsetBottom: Number,
    position: {
      type: String as PropType<AffixPosition>,
      default: 'top',
      validator: (value: string) => value === 'top' || value === 'bottom'
    },
    target: { type: String, default: '' },
    targetContainer: [String, Object] as PropType<AffixTargetContainer>,
    zIndex: { type: [Number, String], default: 100 },
    teleported: Boolean,
    appendTo: { type: [String, Object] as PropType<string | HTMLElement>, default: 'body' }
  },
  emits: {
    change: (fixed: boolean) => typeof fixed === 'boolean',
    scroll: (value: AffixScrollEvent) =>
      typeof value.scrollTop === 'number' && typeof value.fixed === 'boolean'
  },
  setup(props, { slots, emit, expose }) {
    const root = ref<HTMLElement>();
    const fixed = ref(false);
    const measuring = ref(false);
    const geometry = shallowRef<{ rect: DOMRect; translation: number }>();
    const positioned = computed(() => fixed.value && !measuring.value);
    // 保留未传 offset 与显式传入 0 的区别，兼容旧偏移属性。
    const offset = computed(
      () => props.offset ?? (props.position === 'bottom' ? props.offsetBottom : props.offsetTop) ?? 0
    );
    const rootStyle = computed<CSSProperties>(() => {
      const rect = geometry.value?.rect;
      return positioned.value && rect ? { width: `${rect.width}px`, height: `${rect.height}px` } : {};
    });
    const fixedStyle = computed<CSSProperties>(() => {
      if (!positioned.value || !geometry.value) return {};
      const { rect, translation } = geometry.value;
      return {
        ...rootStyle.value,
        position: 'fixed',
        left: `${rect.left}px`,
        [props.position]: `${offset.value}px`,
        transform: translation ? `translateY(${translation}px)` : undefined,
        zIndex: props.zIndex
      };
    });

    let scrollContainer: HTMLElement | Window | undefined;
    let pendingUpdate: Promise<void> | undefined;

    const resolveScrollContainer = (): HTMLElement | Window => {
      const override = props.targetContainer;
      if (typeof override === 'string') return document.querySelector<HTMLElement>(override) ?? window;
      if (override) return override;

      let parent = root.value?.parentElement;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        if (/auto|scroll|overlay/.test(window.getComputedStyle(parent).overflowY)) return parent;
        parent = parent.parentElement;
      }
      return window;
    };

    const setFixed = (value: boolean) => {
      if (fixed.value === value) return;
      fixed.value = value;
      emit('change', value);
    };

    const update = () => {
      if (!scrollContainer || !root.value || measuring.value) return;
      const rect = root.value.getBoundingClientRect();
      const boundary = props.target ? document.querySelector(props.target)?.getBoundingClientRect() : undefined;
      const distance = offset.value;
      const height = window.innerHeight;
      let shouldFix: boolean;
      let translation = 0;

      if (props.position === 'bottom') {
        shouldFix = rect.bottom > height - distance && (!boundary || boundary.top < height);
        if (boundary) translation = Math.max(0, boundary.top - (height - distance - rect.height));
      } else {
        shouldFix = rect.top < distance && (!boundary || boundary.bottom > 0);
        if (boundary) translation = Math.min(0, boundary.bottom - distance - rect.height);
      }

      if (shouldFix) geometry.value = { rect, translation };
      setFixed(shouldFix);
    };

    const updateRoot = (): Promise<void> => {
      if (!scrollContainer) return Promise.resolve();
      if (pendingUpdate) return pendingUpdate;
      measuring.value = true;
      const refresh: Promise<void> = nextTick().then(async () => {
        if (pendingUpdate !== refresh) return;
        pendingUpdate = undefined;
        measuring.value = false;
        update();
        await nextTick();
      });
      pendingUpdate = refresh;
      return refresh;
    };

    const onScroll = () => {
      const container = scrollContainer;
      if (!container) return;
      update();
      if (scrollContainer !== container) return;
      const scrollTop = container instanceof HTMLElement
        ? container.scrollTop
        : window.scrollY || document.documentElement.scrollTop || 0;
      emit('scroll', { scrollTop, fixed: fixed.value });
    };
    const onResize = () => {
      void updateRoot();
    };
    const bindScrollContainer = () => {
      scrollContainer?.removeEventListener('scroll', onScroll);
      scrollContainer = resolveScrollContainer();
      scrollContainer.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
    };
    const start = () => {
      if (scrollContainer) return;
      bindScrollContainer();
      window.addEventListener('resize', onResize);
      update();
    };
    const stop = () => {
      scrollContainer?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      scrollContainer = undefined;
      pendingUpdate = undefined;
      measuring.value = false;
    };
    onMounted(start);
    onActivated(start);
    onDeactivated(() => {
      if (!scrollContainer) return;
      stop();
      setFixed(false);
    });
    onBeforeUnmount(stop);

    watch(
      () => props.targetContainer,
      () => {
        if (scrollContainer) bindScrollContainer();
      },
      { flush: 'post' }
    );
    watch(
      () => [props.targetContainer, props.target, props.position, offset.value],
      update,
      { flush: 'post' }
    );

    expose({ update, updateRoot });

    return () => {
      let target: Element | null | undefined;
      if (props.teleported && positioned.value) {
        const { appendTo } = props;
        target = typeof appendTo === 'string' ? root.value?.ownerDocument.querySelector(appendTo) : appendTo;
      }
      // 原位渲染时使用稳定的宿主，固定后再解析同批挂载的选择器。
      return (
        <div ref={root} class='i-affix' style={rootStyle.value}>
          <Teleport to={target ?? 'body'} disabled={!target}>
            <div
              class={['i-affix__content', positioned.value && 'is-fixed']}
              style={fixedStyle.value}>
              {slots.default?.()}
            </div>
          </Teleport>
        </div>
      );
    };
  }
});
