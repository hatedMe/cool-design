import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';

export interface AutoResizerSize {
  width: number;
  height: number;
}

export default defineComponent({
  name: 'i-auto-resizer',
  props: { disableWidth: Boolean, disableHeight: Boolean },
  emits: { resize: (size: AutoResizerSize) => Number.isFinite(size.width) && Number.isFinite(size.height) },
  setup(props, { emit, slots }) {
    const root = ref<HTMLElement>();
    const measurement = ref<AutoResizerSize>({ width: 0, height: 0 });
    const width = computed(() => props.disableWidth ? 0 : measurement.value.width);
    const height = computed(() => props.disableHeight ? 0 : measurement.value.height);
    let observer: ResizeObserver | undefined;
    onMounted(() => {
      if (!root.value || typeof ResizeObserver === 'undefined') return;
      observer = new ResizeObserver(([entry]) => {
        if (!observer || !entry) return;
        const { width, height } = entry.contentRect;
        measurement.value = { width, height };
      });
      observer.observe(root.value);
    });
    onBeforeUnmount(() => {
      observer?.disconnect();
      observer = undefined;
    });
    watch([width, height], ([width, height]) => emit('resize', { width, height }));
    return () => <div ref={root} class='i-auto-resizer'>{slots.default?.({ width: width.value, height: height.value })}</div>;
  }
});
