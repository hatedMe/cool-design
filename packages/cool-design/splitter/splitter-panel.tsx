import { defineComponent, inject, onBeforeUnmount, ref, type PropType } from 'vue';
import { splitterKey, type SplitterSize } from './context';

export default defineComponent({
  name: 'i-splitter-panel',
  props: {
    size: [String, Number] as PropType<SplitterSize>,
    min: [String, Number] as PropType<SplitterSize>,
    max: [String, Number] as PropType<SplitterSize>,
    resizable: { type: Boolean, default: true },
    collapsible: Boolean
  },
  emits: ['update:size'],
  setup(props, { slots, emit, expose }) {
    const splitter = inject(splitterKey, undefined);
    const element = ref<HTMLElement>();
    const index =
      splitter?.register(
        () => ({
          size: props.size,
          min: props.min,
          max: props.max,
          resizable: props.resizable,
          collapsible: props.collapsible
        }),
        (size) => emit('update:size', size),
        {
          start: () => slots['start-collapsible']?.(),
          end: () => slots['end-collapsible']?.()
        },
        () => element.value
      ) ?? -1;
    onBeforeUnmount(() => splitter?.unregister(index));
    expose({ splitterPanelRef: element });
    return () => (
      <div ref={element} class='i-splitter__panel' style={index >= 0 ? splitter?.sizeStyle(index) : undefined}>
        {slots.default?.()}
      </div>
    );
  }
});
