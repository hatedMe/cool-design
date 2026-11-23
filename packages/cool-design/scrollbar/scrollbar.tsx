import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  watch,
  type PropType
} from 'vue';
import { useNamespace } from '../../hooks/use-namespace';

export type ScrollbarStyle = string | Record<string, string>;
export type ScrollbarDirection = 'top' | 'bottom' | 'left' | 'right';

const oppositeDirection = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
} as const;

// 浏览器计算滚动位置时可能有亚像素误差，与 Element Plus 的边界容差一致。
const edgeTolerance = 0.03;

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
    minSize: { type: Number, default: 20 },
    distance: { type: Number, default: 0 },
    tabindex: [String, Number]
  },
  emits: {
    scroll: ({ scrollTop, scrollLeft }: { scrollTop: number; scrollLeft: number }) =>
      typeof scrollTop === 'number' && typeof scrollLeft === 'number',
    'end-reached': (direction: ScrollbarDirection) =>
      Object.prototype.hasOwnProperty.call(oppositeDirection, direction)
  },
  setup(props, { slots, emit, expose }) {
    const ns = useNamespace('scrollbar');
    const wrap = ref<HTMLElement>();
    const view = ref<HTMLElement>();
    const thumbY = ref<HTMLElement>();
    const thumbX = ref<HTMLElement>();
    const thumbYStyle = ref<Record<string, string>>({ height: '0px', transform: 'translateY(0px)' });
    const thumbXStyle = ref<Record<string, string>>({ width: '0px', transform: 'translateX(0px)' });
    let resizeObserver: ResizeObserver | undefined;
    let dragging: { axis: 'x' | 'y'; start: number; origin: number } | null = null;
    let previousTop = 0;
    let previousLeft = 0;
    let direction: ScrollbarDirection | undefined;
    const reached = { top: false, bottom: false, left: false, right: false };
    let scrollDimensions: number[] = [];

    const toCssSize = (value: string | number | undefined) =>
      typeof value === 'number' ? `${value}px` : value;

    const measureScrollDimensions = (element: HTMLElement) =>
      [element.clientWidth, element.clientHeight, element.scrollWidth, element.scrollHeight];

    const updateThumbs = () => {
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

    const update = () => {
      const element = wrap.value;
      if (!element) return;
      scrollDimensions = measureScrollDimensions(element);
      updateThumbs();
      if (direction) reached[direction] = false;
    };

    const handleScroll = () => {
      const element = wrap.value;
      if (!element) return;
      const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = element;
      const movedHorizontally = scrollLeft !== previousLeft;
      const distance = props.distance;
      const arrived = {
        top: scrollTop <= distance && previousTop !== 0,
        bottom: scrollHeight - distance - (clientHeight + scrollTop) <= edgeTolerance,
        left: scrollLeft <= distance && previousLeft !== 0,
        right: movedHorizontally && scrollWidth - distance - (clientWidth + scrollLeft) <= edgeTolerance
      };
      if (scrollTop !== previousTop) direction = scrollTop > previousTop ? 'bottom' : 'top';
      if (movedHorizontally) direction = scrollLeft > previousLeft ? 'right' : 'left';
      previousTop = scrollTop;
      previousLeft = scrollLeft;

      emit('scroll', { scrollTop, scrollLeft });
      updateThumbs();

      if (!direction) return;
      if (distance > 0) {
        if (reached[direction]) return;
        const opposite = oppositeDirection[direction];
        if (!arrived[opposite]) reached[opposite] = false;
        reached[direction] = arrived[direction];
      }
      if (arrived[direction]) emit('end-reached', direction);
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
        resizeObserver = new ResizeObserver(update);
        if (view.value) resizeObserver.observe(view.value);
        if (wrap.value) resizeObserver.observe(wrap.value);
      }
    });
    onUpdated(() => {
      const element = wrap.value;
      if (!element) return;
      // 插槽可能改变溢出范围，而 ResizeObserver 观察的盒子尺寸保持原样。
      if (measureScrollDimensions(element).some((size, index) => size !== scrollDimensions[index])) update();
    });
    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      onDragEnd();
    });
    watch(() => [props.height, props.maxHeight, props.distance], update, { flush: 'post' });

    expose({ handleScroll, scrollTo, setScrollTop, setScrollLeft, update, wrapRef: wrap });

    const toPx = (value: string | number | undefined) => toCssSize(value);
    return () => (
      <div class={[ns.b(), props.always && 'is-always']}>
        <div
          ref={wrap}
          class={[ns.e('wrap'), props.wrapClass]}
          tabindex={props.tabindex}
          style={[
            typeof props.wrapStyle === 'string' ? props.wrapStyle : props.wrapStyle,
            { height: toPx(props.height), maxHeight: toPx(props.maxHeight) }
          ]}
          onScroll={handleScroll}>
          {h(
            props.tag,
            { ref: view, class: [ns.e('view'), props.viewClass], style: props.viewStyle },
            slots.default?.()
          )}
        </div>
        {!props.native && (
          <>
            <div class={[ns.e('bar'), 'is-vertical']}>
              <div ref={thumbY} class={ns.e('thumb')} style={thumbYStyle.value} onMousedown={onThumbMousedown('y')} />
            </div>
            <div class={[ns.e('bar'), 'is-horizontal']}>
              <div ref={thumbX} class={ns.e('thumb')} style={thumbXStyle.value} onMousedown={onThumbMousedown('x')} />
            </div>
          </>
        )}
      </div>
    );
  }
});
