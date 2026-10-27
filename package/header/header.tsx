import { defineComponent } from "vue";
export default defineComponent({
  name: "i-header",
  props: { height: { type: [String, Number], default: "60px" } },
  setup(props, { slots }) {
    return () => (
      <header
        class="i-header"
        style={{ height: typeof props.height === "number" ? `${props.height}px` : props.height }}>
        {slots.default?.()}
      </header>
    );
  }
});
