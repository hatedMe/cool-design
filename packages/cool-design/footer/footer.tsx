import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-footer',
  props: { height: { type: [String, Number], default: undefined } },
  setup(props, { slots }) {
    return () => (
      <footer
        class='i-footer'
        style={props.height === undefined ? undefined : { height: typeof props.height === 'number' ? `${props.height}px` : props.height }}>
        {slots.default?.()}
      </footer>
    );
  }
});
