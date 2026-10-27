import { defineComponent, type PropType } from "vue";
export default defineComponent({
  name: "i-alert",
  props: {
    title: String,
    description: String,
    type: { type: String as PropType<"success" | "warning" | "info" | "error">, default: "info" },
    closable: { type: Boolean, default: true },
    closeText: String,
    showIcon: Boolean,
    center: Boolean
  },
  emits: ["close"],
  setup(props, { slots, emit }) {
    return () => (
      <div class={{ "i-alert": true, [`i-alert--${props.type}`]: true, "is-center": props.center }} role="alert">
        {props.showIcon && <span class="i-alert__icon">●</span>}
        <div>
          <strong>{slots.title?.() ?? props.title}</strong>
          {(props.description || slots.default) && <p>{slots.default?.() ?? props.description}</p>}
        </div>
        {props.closable && (
          <button type="button" onClick={() => emit("close")}>
            {props.closeText ?? "×"}
          </button>
        )}
      </div>
    );
  }
});
