import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createNamespace } from '../../../src/utils/create';
import SkeletonItem from './skeleton-item';

const [name, bem] = createNamespace('skeleton');

const toInt = (value: unknown, fallback: number): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.floor(numeric) : fallback;
};

export default defineComponent({
  name,
  props: {
    animated: Boolean,
    /** 渲染多少个骨架块 */
    count: { type: Number, default: 1 },
    rows: { type: Number, default: 3 },
    loading: { type: Boolean, default: true },
    /** 延迟展示骨架屏的毫秒数，避免短暂加载时闪烁 */
    throttle: { type: Number, default: 0 },
    /** 兼容属性：默认模板是否展示标题占位 */
    title: Boolean,
    /** 兼容属性：默认模板是否展示头像占位 */
    avatar: Boolean
  },
  setup(props, { slots }) {
    const count = computed(() => Math.max(1, toInt(props.count, 1)));
    const rows = computed(() => Math.max(0, toInt(props.rows, 3)));
    const throttleMs = computed(() => Math.max(0, toInt(props.throttle, 0)));
    const showSkeleton = ref(props.loading && throttleMs.value <= 0);
    let timer: ReturnType<typeof setTimeout> | undefined;

    const clearTimer = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    const sync = (loading: boolean, throttle: number) => {
      clearTimer();
      if (loading && throttle > 0) {
        timer = setTimeout(() => {
          showSkeleton.value = true;
        }, throttle);
        return;
      }
      showSkeleton.value = loading;
    };

    // 服务端渲染时直接按 loading 输出，避免水合前闪烁由客户端接管
    onMounted(() => sync(props.loading, throttleMs.value));
    watch([() => props.loading, throttleMs], ([loading, throttle]) => sync(loading, throttle));
    onBeforeUnmount(clearTimer);

    const renderDefaultTemplate = () => (
      <>
        {props.avatar && <SkeletonItem variant='circle' class={bem('avatar')} />}
        {props.title && <SkeletonItem variant='h3' class={bem('title')} />}
        {Array.from({ length: rows.value }, (_, index) => (
          <SkeletonItem variant='p' key={index} class={index === 0 ? bem('first-row') : undefined} />
        ))}
      </>
    );

    return () =>
      showSkeleton.value ? (
        <div class={{ [name]: true, 'is-animated': props.animated }} role='status' aria-label='加载中'>
          {Array.from({ length: count.value }, (_, index) => (
            <div class={bem('block')} key={index} aria-hidden='true'>
              {slots.template?.() ?? renderDefaultTemplate()}
            </div>
          ))}
        </div>
      ) : (
        <>{slots.default?.()}</>
      );
  }
});
