import { useNamespace } from '../../hooks/use-namespace';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-main',
  setup(_, { slots }) {
    const ns = useNamespace('main');
    return () => <main class={ns.b()}>{slots.default?.()}</main>;
  }
});
