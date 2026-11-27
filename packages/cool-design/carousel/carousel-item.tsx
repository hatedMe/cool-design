import { computed, defineComponent, getCurrentInstance, inject, onBeforeUnmount, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import { carouselKey } from './context';

export default defineComponent({
  name: 'i-carousel-item',
  props: {
    name: { type: [String, Number] as PropType<string | number>, default: undefined },
    label: { type: [String, Number] as PropType<string | number>, default: '' }
  },
  setup(props, { slots }) {
    const ns = useNamespace('carousel');
    const context = inject(carouselKey);
    if (!context) throw new Error('CarouselItem must be used inside Carousel.');
    const uid = getCurrentInstance()!.uid;
    context.register(uid, props);
    onBeforeUnmount(() => context.unregister(uid));

    const index = computed(() => context.order.value.indexOf(uid));
    const isActive = computed(() => context.active.value === index.value);

    return () => (
      <div
        class={[ns.e('item'), { 'is-active': isActive.value }]}
        style={
          context.card.value
            ? {
                transform: `scale(${isActive.value ? 1 : context.cardScale.value})`,
                zIndex: isActive.value ? 2 : 1
              }
            : undefined
        }
        role='group'
        aria-roledescription='slide'
        aria-label={props.label !== '' ? String(props.label) : `第 ${index.value + 1} 张`}
        aria-hidden={isActive.value ? undefined : 'true'}>
        {slots.default?.()}
      </div>
    );
  }
});
