import { defineComponent, inject, onBeforeUnmount } from 'vue';
import { useNamespace } from '../../hooks/use-namespace';
import { popperContentKey } from './context';

export default defineComponent({
  name: 'i-popper-arrow',
  inheritAttrs: false,
  props: { arrowOffset: { type: Number, default: 5 } },
  setup(_, { expose }) {
    const { arrowRef, arrowStyle } = inject(popperContentKey)!;
    const ns = useNamespace('popper');
    expose({ arrowRef });
    onBeforeUnmount(() => { arrowRef.value = undefined; });
    return () => <span ref={arrowRef} class={ns.e('arrow')} style={arrowStyle.value} data-popper-arrow />;
  }
});
