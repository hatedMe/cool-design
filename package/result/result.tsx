import { defineComponent, type PropType } from "vue";
export default defineComponent({
  name: "i-result",
  props: {
    title: String,
    subTitle: String,
    status: {
      type: String as PropType<"success" | "warning" | "info" | "error" | "404" | "403" | "500">,
      default: "info"
    }
  },
  setup(props, { slots }) {
    return () => (
      <section class={["i-result", `i-result--${props.status}`]}>
        <div class="i-result__icon">
          {slots.icon?.() ?? (props.status === "success" ? "✓" : props.status === "error" ? "!" : "i")}
        </div>
        <h2>{slots.title?.() ?? props.title}</h2>
        <p>{slots.subTitle?.() ?? props.subTitle}</p>
        {slots.extra && <div class="i-result__extra">{slots.extra()}</div>}
      </section>
    );
  }
});
