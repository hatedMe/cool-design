import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-header',
  props: { height: { type: [String, Number], default: undefined } },
  setup(props, { slots }) {
    const ns = useNamespace('header');
    return () => (
      <header
        class={ns.b()}
        style={props.height === undefined ? undefined : { height: typeof props.height === 'number' ? `${props.height}px` : props.height }}>
        {slots.default?.()}
      </header>
    );
  }
});
