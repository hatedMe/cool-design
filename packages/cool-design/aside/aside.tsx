import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-aside',
  props: { width: { type: [String, Number], default: undefined } },
  setup(props, { slots }) {
    return () => (
      <aside
        class='i-aside'
        style={props.width === undefined ? undefined : { width: typeof props.width === 'number' ? `${props.width}px` : props.width }}
      >
        {slots.default?.()}
      </aside>
    );
  }
});
