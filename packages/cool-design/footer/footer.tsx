import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-footer',
  props: { height: { type: [String, Number], default: undefined } },
  setup(props, { slots }) {
    const ns = useNamespace('footer');
    return () => (
      <footer
        class={ns.b()}
        style={props.height === undefined ? undefined : { height: typeof props.height === 'number' ? `${props.height}px` : props.height }}>
        {slots.default?.()}
      </footer>
    );
  }
});
