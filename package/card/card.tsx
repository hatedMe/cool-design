import { defineComponent, type PropType } from "vue";
export default defineComponent({
  name: "i-card",
  props: {
    header: String,
    bodyStyle: Object as PropType<Record<string, string>>,
    shadow: { type: String as PropType<"always" | "hover" | "never">, default: "always" },
    border: { type: Boolean, default: true }
  },
  setup(props, { slots }) {
    return () => (
      <section class={{ "i-card": true, "is-bordered": props.border, [`is-shadow-${props.shadow}`]: true }}>
        {(props.header || slots.header) && <header>{slots.header?.() ?? props.header}</header>}
        <div class="i-card__body" style={props.bodyStyle}>
          {slots.default?.()}
        </div>
        {slots.footer && <footer>{slots.footer()}</footer>}
      </section>
    );
  }
});
