import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-footer',
  props: { height: { type: [String, Number], default: '60px' } },
  setup(props, { slots }) {
    return () => (
      <footer
        class='i-footer'
        style={{ height: typeof props.height === 'number' ? `${props.height}px` : props.height }}>
        {slots.default?.()}
      </footer>
    );
  }
});
