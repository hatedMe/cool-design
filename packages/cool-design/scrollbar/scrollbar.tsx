import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType
} from 'vue';

export type ScrollbarStyle = string | Record<string, string>;

export default defineComponent({
  name: 'i-scrollbar',
  props: {
    height: [String, Number] as PropType<string | number>,
    maxHeight: [String, Number] as PropType<string | number>,
    native: Boolean,
    wrapStyle: [String, Object] as PropType<ScrollbarStyle>,
    wrapClass: [String, Array, Object] as PropType<unknown>,
    viewStyle: [String, Object] as PropType<ScrollbarStyle>,
    viewClass: [String, Array, Object] as PropType<unknown>,
    noresize: Boolean,
    tag: { type: String, default: 'div' },
    always: Boolean,
    minSize: { type: Number, default: 20 }
  },
  emits: ['scroll'],
  setup(props, { slots, emit, expose }) {
    const wrap = ref<HTMLElement>();
    const view = ref<HTMLElement>();
    const thumbY = ref<HTMLElement>();
    const thumbX = ref<HTMLElement>();
    const thumbYStyle = ref<Record<string, string>>({ height: '0px', transform: 'translateY(0px)' });
    const thumbXStyle = ref<Record<string, string>>({ width: '0px', transform: 'translateX(0px)' });
    let resizeObserver: ResizeObserver | undefined;
    let dragging: { axis: 'x' | 'y'; start: number; origin: number } | null = null;

    const toCssSize = (value: string | number | undefined) =>
      typeof value === 'number' ? `${value}px` : value;

    const update = () => {
      const element = wrap.value;
      if (!element || props.native) return;
      const clientHeight = element.clientHeight;
      const scrollHeight = element.scrollHeight;
      const trackY = thumbY.value?.parentElement?.clientHeight ?? clientHeight;
      if (scrollHeight > 0 && trackY > 0) {
        const ratio = clientHeight / scrollHeight;
        const height = Math.max(props.minSize, trackY * ratio);
        const top = (element.scrollTop / scrollHeight) * trackY;
        thumbYStyle.value = {
          height: `${height}px`,
          transform: `translateY(${Math.min(trackY - height, Math.max(0, top))}px)`
        };
      } else {
        thumbYStyle.value = { height: '0px', transform: 'translateY(0px)' };
      }
      const clientWidth = element.clientWidth;
      const scrollWidth = element.scrollWidth;
      const trackX = thumbX.value?.parentElement?.clientWidth ?? clientWidth;
      if (scrollWidth > 0 && trackX > 0 && scrollWidth > clientWidth) {
        const ratio = clientWidth / scrollWidth;
        const width = Math.max(props.minSize, trackX * ratio);
        const left = (element.scrollLeft / scrollWidth) * trackX;
        thumbXStyle.value = {
          width: `${width}px`,
          transform: `translateX(${Math.min(trackX - width, Math.max(0, left))}px)`
        };
      } else {
        thumbXStyle.value = { width: '0px', transform: 'translateX(0px)' };
      }
    };

    const handleScroll = () => {
      const element = wrap.value;
      if (!element) return;
      emit('scroll', { scrollTop: element.scrollTop, scrollLeft: element.scrollLeft });
      update();
    };

    const scrollTo: {
      (options: ScrollToOptions): void;
      (x: number, y: number): void;
    } = (...args: [ScrollToOptions | number, number?]) => {
      const element = wrap.value;
      if (!element) return;
      const options = typeof args[0] === 'object' ? args[0] : { left: args[0], top: args[1] ?? 0 };
      if (typeof element.scrollTo === 'function') element.scrollTo(options);
      else {
        if (options.top !== undefined) element.scrollTop = options.top;
        if (options.left !== undefined) element.scrollLeft = options.left;
      }
    };
    const setScrollTop = (top: number) => {
      if (wrap.value) wrap.value.scrollTop = top;
    };
    const setScrollLeft = (left: number) => {
      if (wrap.value) wrap.value.scrollLeft = left;
    };

    const onThumbMousedown = (axis: 'x' | 'y') => (event: MouseEvent) => {
      event.preventDefault();
      const element = wrap.value;
      if (!element) return;
      dragging = {
        axis,
        start: axis === 'y' ? event.clientY : event.clientX,
        origin: axis === 'y' ? element.scrollTop : element.scrollLeft
      };
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    };
    const onDragMove = (event: MouseEvent) => {
      if (!dragging || !wrap.value) return;
      const element = wrap.value;
      if (dragging.axis === 'y') {
        const track = thumbY.value?.parentElement?.clientHeight ?? 1;
        const scale = element.scrollHeight / Math.max(1, track);
        element.scrollTop = dragging.origin + (event.clientY - dragging.start) * scale;
      } else {
        const track = thumbX.value?.parentElement?.clientWidth ?? 1;
        const scale = element.scrollWidth / Math.max(1, track);
        element.scrollLeft = dragging.origin + (event.clientX - dragging.start) * scale;
      }
    };
    const onDragEnd = () => {
      dragging = null;
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };

    onMounted(() => {
      update();
      if (!props.noresize && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => update());
        if (view.value) resizeObserver.observe(view.value);
      }
    });
    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      onDragEnd();
    });
    watch(() => [props.height, props.maxHeight], () => update());

    expose({ handleScroll, scrollTo, setScrollTop, setScrollLeft, update, wrapRef: wrap });

    const toPx = (value: string | number | undefined) => toCssSize(value);
    return () => (
      <div class={['i-scrollbar', props.always && 'is-always']}>
        <div
          ref={wrap}
          class={['i-scrollbar__wrap', props.wrapClass]}
          style={[
            typeof props.wrapStyle === 'string' ? props.wrapStyle : props.wrapStyle,
            { height: toPx(props.height), maxHeight: toPx(props.maxHeight) }
          ]}
          onScroll={handleScroll}>
          {h(
            props.tag,
            { ref: view, class: ['i-scrollbar__view', props.viewClass], style: props.viewStyle },
            slots.default?.()
          )}
        </div>
        {!props.native && (
          <>
            <div class='i-scrollbar__bar is-vertical'>
              <div ref={thumbY} class='i-scrollbar__thumb' style={thumbYStyle.value} onMousedown={onThumbMousedown('y')} />
            </div>
            <div class='i-scrollbar__bar is-horizontal'>
              <div ref={thumbX} class='i-scrollbar__thumb' style={thumbXStyle.value} onMousedown={onThumbMousedown('x')} />
            </div>
          </>
        )}
      </div>
    );
  }
});
