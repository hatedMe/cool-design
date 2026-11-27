import { defineComponent, type PropType } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';

export default defineComponent({
  name: 'i-overlay',
  props: {
    mask: { type: Boolean, default: true },
    customMaskEvent: Boolean,
    overlayClass: [String, Array, Object, Boolean] as PropType<unknown>,
    zIndex: [String, Number]
  },
  emits: { click: (event: MouseEvent) => event instanceof MouseEvent },
  setup(props, { slots, emit }) {
    const ns = useNamespace('overlay');
    let down = false;
    let up = false;
    return () => <div
      class={[props.mask && ns.b(), props.overlayClass]}
      style={{ zIndex: props.zIndex, ...(!props.mask ? { position: 'fixed' as const, inset: '0px' } : {}) }}
      onMousedown={(event: MouseEvent) => { down = event.target === event.currentTarget; }}
      onMouseup={(event: MouseEvent) => { up = event.target === event.currentTarget; }}
      onClick={(event: MouseEvent) => {
        if (props.mask && !props.customMaskEvent && down && up && event.target === event.currentTarget) emit('click', event);
        down = up = false;
      }}>{slots.default?.()}</div>;
  }
});
