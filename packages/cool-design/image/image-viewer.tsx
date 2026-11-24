import {
  Teleport,
  computed,
  defineComponent,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType
} from 'vue';
import { isTopOverlay } from '../../../src/utils/overlay-stack';
import { useFloatingTheme } from '../../../src/utils/use-floating';
import { useNamespace } from '../../hooks/use-namespace';
import { lockDialog, unlockDialog } from '../dialog/stack';

export interface ImageViewerToolbarActions {
  index: number;
  activeIndex: number;
  total: number;
  scale: number;
  rotation: number;
  actions: {
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
    rotate: (clockwise?: boolean) => void;
    prev: () => void;
    next: () => void;
    close: () => void;
    setActiveItem: (index: number) => void;
  };
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  rotate: (clockwise?: boolean) => void;
  prev: () => void;
  next: () => void;
  close: () => void;
  setActiveItem: (index: number) => void;
}

export default defineComponent({
  name: 'i-image-viewer',
  inheritAttrs: false,
  props: {
    urlList: { type: Array as PropType<string[]>, default: () => [] },
    initialIndex: { type: Number, default: 0 },
    infinite: { type: Boolean, default: true },
    zoomRate: { type: Number, default: 1.2 },
    scale: { type: Number, default: 1 },
    minScale: { type: Number, default: 0.2 },
    maxScale: { type: Number, default: 7 },
    showProgress: { type: Boolean, default: false },
    zIndex: { type: Number, default: undefined },
    closeOnPressEscape: { type: Boolean, default: true },
    hideOnClickModal: { type: Boolean, default: false },
    teleported: { type: Boolean, default: false }
  },
  emits: ['close', 'switch'],
  setup(props, { attrs, emit, slots, expose }) {
    const ns = useNamespace('image-viewer');
    const target = computed(() => props.teleported ? 'body' : undefined);
    const theme = useFloatingTheme(target, () => !!target.value);
    const token = Symbol('image-viewer');
    const stackZIndex = ref(2000);
    const index = ref(0);
    const scaleValue = ref(props.scale);
    const rotation = ref(0);
    const translateX = ref(0);
    const translateY = ref(0);
    const loading = ref(true);
    const error = ref(false);
    const dragging = ref(false);
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOriginX = 0;
    let dragOriginY = 0;

    const total = computed(() => props.urlList.length);
    const currentUrl = computed(() => props.urlList[index.value] ?? '');
    const zIndexValue = computed(() => props.zIndex ?? stackZIndex.value);

    const clampIndex = (value: number) => {
      if (total.value <= 0) return 0;
      if (props.infinite) return ((value % total.value) + total.value) % total.value;
      return Math.min(Math.max(value, 0), total.value - 1);
    };
    const clampScale = (value: number) => Math.min(Math.max(value, props.minScale), props.maxScale);

    const resetMedia = () => {
      scaleValue.value = props.scale;
      rotation.value = 0;
      translateX.value = 0;
      translateY.value = 0;
      loading.value = true;
      error.value = false;
    };
    const go = (next: number) => {
      if (total.value <= 0) return;
      const clamped = clampIndex(next);
      if (clamped === index.value) return;
      index.value = clamped;
      resetMedia();
      emit('switch', clamped);
    };
    const prev = () => go(index.value - 1);
    const next = () => go(index.value + 1);
    const setActiveItem = (value: number) => go(value);
    const zoomIn = () => {
      scaleValue.value = clampScale(scaleValue.value * props.zoomRate);
    };
    const zoomOut = () => {
      scaleValue.value = clampScale(scaleValue.value / props.zoomRate);
    };
    const reset = () => {
      scaleValue.value = props.scale;
      rotation.value = 0;
      translateX.value = 0;
      translateY.value = 0;
    };
    const rotate = (clockwise = true) => {
      rotation.value = (rotation.value + (clockwise ? 90 : -90)) % 360;
    };
    const close = () => emit('close');

    // 滚轮缩放：向上放大、向下缩小，跟随 zoomRate 步进。
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? props.zoomRate : 1 / props.zoomRate;
      scaleValue.value = clampScale(scaleValue.value * factor);
    };
    // 拖拽平移：按住图片移动，document 级监听避免快速移出图外丢事件。
    const onDragMove = (event: MouseEvent) => {
      if (!dragging.value) return;
      translateX.value = dragOriginX + (event.clientX - dragStartX);
      translateY.value = dragOriginY + (event.clientY - dragStartY);
    };
    const onDragEnd = () => {
      dragging.value = false;
      document.removeEventListener('mousemove', onDragMove, true);
      document.removeEventListener('mouseup', onDragEnd, true);
    };
    const onDragStart = (event: MouseEvent) => {
      if (event.button !== 0) return;
      dragging.value = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragOriginX = translateX.value;
      dragOriginY = translateY.value;
      document.addEventListener('mousemove', onDragMove, true);
      document.addEventListener('mouseup', onDragEnd, true);
    };

    expose({
      prev,
      next,
      setActiveItem,
      zoomIn,
      zoomOut,
      reset,
      rotate,
      close,
      index: computed(() => index.value),
      activeIndex: computed(() => index.value)
    });

    watch(
      () => props.initialIndex,
      (value) => {
        index.value = clampIndex(value);
        resetMedia();
      }
    );
    watch(
      () => props.urlList.length,
      () => {
        index.value = clampIndex(index.value);
      }
    );
    watch(currentUrl, () => {
      loading.value = true;
      error.value = false;
    });

    const onKeydown = (event: KeyboardEvent) => {
      if (!isTopOverlay(token)) return;
      if (event.key === 'Escape' && props.closeOnPressEscape) {
        event.preventDefault();
        close();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }
    };

    onMounted(() => {
      index.value = clampIndex(props.initialIndex);
      scaleValue.value = props.scale;
      // 复用 Dialog 浮层栈，保证与 Dialog/Drawer 共享滚动锁与层级，多实例计数不互相覆盖。
      stackZIndex.value = lockDialog(token, true);
      document.addEventListener('keydown', onKeydown, true);
    });
    onBeforeUnmount(() => {
      onDragEnd();
      unlockDialog(token);
      document.removeEventListener('keydown', onKeydown, true);
    });

    const toolbarActions = (): ImageViewerToolbarActions => {
      const actions = { zoomIn, zoomOut, reset, rotate, prev, next, close, setActiveItem };
      return {
        index: index.value,
        activeIndex: index.value,
        total: total.value,
        scale: scaleValue.value,
        rotation: rotation.value,
        actions,
        zoomIn,
        zoomOut,
        reset,
        rotate,
        prev,
        next,
        close,
        setActiveItem
      };
    };

    const content = () => {
      const placeholderSlot = slots.placeholder ?? slots['viewer-placeholder'];
      const errorSlot = slots.error ?? slots['viewer-error'];
      const maskProps = mergeProps({
        class: [ns.e('mask'), theme.value.scopeClass],
        style: { ...theme.value.style, zIndex: zIndexValue.value },
        'data-theme': theme.value.theme,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': '图片预览',
        onWheel,
        onClick: (event: MouseEvent) => {
          if (event.target === event.currentTarget && props.hideOnClickModal) close();
        }
      }, attrs);
      return (
        <div {...maskProps}>
          <div class={ns.e('content')}>
            <button type='button' class={ns.e('close')} aria-label='关闭预览' onClick={close}>
              ×
            </button>
            {total.value > 1 && (
              <button
                type='button'
                class={ns.e('prev')}
                aria-label='上一张'
                disabled={!props.infinite && index.value <= 0}
                onClick={prev}>
                ‹
              </button>
            )}
            <div class={ns.e('stage')}>
              {slots.default?.({
                url: currentUrl.value,
                src: currentUrl.value,
                index: index.value,
                activeIndex: index.value
              }) ??
                (error.value && errorSlot ? (
                  <div class={ns.e('error')}>
                    {errorSlot({ activeIndex: index.value, src: currentUrl.value, url: currentUrl.value, index: index.value })}
                  </div>
                ) : (
                  <>
                    <img
                      key={currentUrl.value}
                      src={currentUrl.value}
                      alt=''
                      draggable={false}
                      style={{
                        transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scaleValue.value}) rotate(${rotation.value}deg)`,
                        cursor: dragging.value ? 'grabbing' : 'grab'
                      }}
                      onMousedown={onDragStart}
                      onLoad={() => {
                        loading.value = false;
                      }}
                      onError={() => {
                        loading.value = false;
                        error.value = true;
                      }}
                    />
                    {loading.value &&
                      !error.value &&
                      placeholderSlot && (
                        <div class={ns.e('placeholder')}>
                          {placeholderSlot({
                            activeIndex: index.value,
                            src: currentUrl.value,
                            url: currentUrl.value,
                            index: index.value
                          })}
                        </div>
                      )}
                  </>
                ))}
            </div>
            {total.value > 1 && (
              <button
                type='button'
                class={ns.e('next')}
                aria-label='下一张'
                disabled={!props.infinite && index.value >= total.value - 1}
                onClick={next}>
                ›
              </button>
            )}
            {props.showProgress &&
              (slots.progress?.({ activeIndex: index.value, index: index.value, total: total.value }) ?? (
                <div class={ns.e('progress')}>
                  {index.value + 1} / {total.value}
                </div>
              ))}
            {slots.toolbar?.(toolbarActions()) ?? (
              <div class={ns.e('toolbar')} role='toolbar' aria-label='预览操作'>
                <button type='button' aria-label='缩小' onClick={zoomOut}>
                  −
                </button>
                <button type='button' aria-label='放大' onClick={zoomIn}>
                  ＋
                </button>
                <button type='button' aria-label='重置' onClick={reset}>
                  ⟲
                </button>
                <button type='button' aria-label='逆时针旋转' onClick={() => rotate(false)}>
                  ↺
                </button>
                <button type='button' aria-label='顺时针旋转' onClick={() => rotate(true)}>
                  ↻
                </button>
              </div>
            )}
          </div>
        </div>
      );
    };

    return () => {
      if (!total.value) return null;
      return target.value ? <Teleport to={target.value}>{content()}</Teleport> : content();
    };
  }
});
