import { defineComponent, onBeforeUnmount, watch, type PropType } from "vue";
export default defineComponent({
  name: "i-message",
  props: {
    type: { type: String as PropType<"success" | "warning" | "info" | "error">, default: "success" },
    message: { type: String, required: true },
    duration: { type: Number, default: 4000 },
    showClose: { type: Boolean, default: true }
  },
  emits: ["close"],
  setup(props, { emit }) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clear = () => {
      if (timer) clearTimeout(timer);
    };
    watch(
      () => [props.message, props.duration],
      () => {
        clear();
        if (props.duration > 0) timer = setTimeout(() => emit("close"), props.duration);
      },
      { immediate: true }
    );
    onBeforeUnmount(clear);
    return () => (
      <div class={["i-message", `i-message--${props.type}`]} role={props.type === "error" ? "alert" : "status"}>
        <span>{props.message}</span>
        {props.showClose && (
          <button
            type="button"
            aria-label="关闭提示"
            onClick={() => {
              clear();
              emit("close");
            }}>
            ×
          </button>
        )}
      </div>
    );
  }
});
