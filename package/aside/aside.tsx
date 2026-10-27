import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-aside',
  props: { width: { type: [String, Number], default: '300px' } },
  setup(props, { slots }) {
    return () => (
      <aside class='i-aside' style={{ width: typeof props.width === 'number' ? `${props.width}px` : props.width }}>
        {slots.default?.()}
      </aside>
    );
  }
});
