import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType
} from 'vue';
import IImageViewer from './image-viewer';

export type ImageFit = '' | 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
export type ImageLoading = 'eager' | 'lazy';

const resolveContainer = (value: string | HTMLElement | undefined): HTMLElement | null => {
  if (!value || typeof document === 'undefined') return null;
  if (value instanceof HTMLElement) return value;
  try {
    return document.querySelector(value);
  } catch {
    return null;
  }
};

export type ImageReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

export default defineComponent({
  name: 'i-image',
  props: {
    src: { type: String, default: '' },
    fit: { type: String as PropType<ImageFit>, default: '' },
    hideOnClickModal: Boolean,
    loading: { type: String as PropType<ImageLoading>, default: undefined },
    lazy: Boolean,
    scrollContainer: { type: [String, Object] as PropType<string | HTMLElement>, default: undefined },
    alt: { type: String, default: undefined },
    referrerpolicy: { type: String as PropType<ImageReferrerPolicy>, default: undefined },
    crossorigin: { type: String as PropType<'' | 'anonymous' | 'use-credentials'>, default: undefined },
    previewSrcList: { type: Array as PropType<string[]>, default: () => [] },
    zIndex: { type: Number, default: undefined },
    initialIndex: { type: Number, default: 0 },
    closeOnPressEscape: { type: Boolean, default: true },
    previewTeleported: { type: Boolean, default: false },
    infinite: { type: Boolean, default: true },
    zoomRate: { type: Number, default: 1.2 },
    scale: { type: Number, default: 1 },
    minScale: { type: Number, default: 0.2 },
    maxScale: { type: Number, default: 7 },
    showProgress: { type: Boolean, default: false },
    fallback: { type: String, default: undefined }
  },
  emits: ['load', 'error', 'show', 'switch', 'close'],
  setup(props, { emit, slots, expose }) {
    const root = ref<HTMLElement>();
    const inView = ref(!props.lazy);
    const loaded = ref(false);
    const error = ref(false);
    const currentSrc = ref(props.src);
    const triedFallback = ref(false);
    const previewVisible = ref(false);
    let observer: IntersectionObserver | undefined;

    const cleanupObserver = () => {
      observer?.disconnect();
      observer = undefined;
    };
    const observe = () => {
      cleanupObserver();
      if (!props.lazy || inView.value || typeof IntersectionObserver === 'undefined') {
        inView.value = true;
        return;
      }
      const rootEl = resolveContainer(props.scrollContainer);
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            inView.value = true;
            cleanupObserver();
          }
        },
        { root: rootEl }
      );
      if (root.value) observer.observe(root.value);
    };

    watch(
      () => props.src,
      (value) => {
        currentSrc.value = value;
        triedFallback.value = false;
        loaded.value = false;
        error.value = false;
      }
    );
    watch([() => props.lazy, () => props.scrollContainer], () => {
      inView.value = !props.lazy;
      observe();
    });

    // 挂载后开始观察，确保 root 已就绪；测试或 SSR 缺少布局时直接显示。
    onMounted(() => observe());

    onBeforeUnmount(cleanupObserver);

    const onLoad = (event: Event) => {
      loaded.value = true;
      emit('load', event);
    };
    const onError = (event: Event) => {
      if (props.fallback && !triedFallback.value && currentSrc.value !== props.fallback) {
        triedFallback.value = true;
        currentSrc.value = props.fallback;
        emit('error', event);
        return;
      }
      error.value = true;
      emit('error', event);
    };
    const showPreview = () => {
      if (!props.previewSrcList.length) return;
      previewVisible.value = true;
      emit('show');
    };
    const closePreview = () => {
      previewVisible.value = false;
      emit('close');
    };
    const onSwitch = (index: number) => emit('switch', index);

    expose({ showPreview });

    return () => (
      <div ref={root} class='i-image'>
        {(!inView.value || (!loaded.value && !error.value)) &&
          slots.placeholder &&
          !error.value && <div class='i-image__placeholder'>{slots.placeholder()}</div>}
        {inView.value &&
          (!error.value || !slots.error) && (
            <img
              src={currentSrc.value}
              alt={props.alt}
              loading={props.loading ?? (props.lazy ? 'lazy' : 'eager')}
              referrerpolicy={props.referrerpolicy}
              crossorigin={props.crossorigin}
              style={props.fit ? { objectFit: props.fit } : undefined}
              onLoad={onLoad}
              onError={onError}
              onClick={() => {
                if (props.previewSrcList.length) showPreview();
              }}
            />
          )}
        {error.value && slots.error && <div class='i-image__error'>{slots.error()}</div>}
        {previewVisible.value &&
          props.previewSrcList.length > 0 &&
          (slots.viewer?.({
            urlList: props.previewSrcList,
            close: closePreview
          }) ?? (
            <IImageViewer
              urlList={props.previewSrcList}
              initialIndex={props.initialIndex}
              infinite={props.infinite}
              zoomRate={props.zoomRate}
              scale={props.scale}
              minScale={props.minScale}
              maxScale={props.maxScale}
              showProgress={props.showProgress}
              zIndex={props.zIndex}
              closeOnPressEscape={props.closeOnPressEscape}
              hideOnClickModal={props.hideOnClickModal}
              teleported={props.previewTeleported}
              onClose={closePreview}
              onSwitch={onSwitch}>
              {{
                default: slots.default as never,
                progress: slots.progress as never,
                toolbar: slots.toolbar as never,
                placeholder: slots['viewer-placeholder'] as never,
                error: slots['viewer-error'] as never
              }}
            </IImageViewer>
          ))}
      </div>
    );
  }
});
