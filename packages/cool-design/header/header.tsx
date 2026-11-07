import { defineComponent } from 'vue';
export default defineComponent({
  name: 'i-header',
  props: { height: { type: [String, Number], default: undefined } },
  setup(props, { slots }) {
    return () => (
      <header
        class='i-header'
        style={props.height === undefined ? undefined : { height: typeof props.height === 'number' ? `${props.height}px` : props.height }}>
        {slots.default?.()}
      </header>
    );
  }
});
