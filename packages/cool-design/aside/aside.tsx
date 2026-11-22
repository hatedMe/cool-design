import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-aside',
  props: { width: { type: [String, Number], default: undefined } },
  setup(props, { slots }) {
    const ns = useNamespace('aside');
    return () => (
      <aside
        class={ns.b()}
        style={props.width === undefined ? undefined : { width: typeof props.width === 'number' ? `${props.width}px` : props.width }}
      >
        {slots.default?.()}
      </aside>
    );
  }
});
