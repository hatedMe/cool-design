import { defineComponent, type PropType } from "vue";
import { createNamespace } from "../../src/utils/create";
import type { NotificationType } from "./types";
const [name, bem] = createNamespace("notification");

export default defineComponent({
  name,
  props: {
    title: String,
    message: String,
    size: { type: String as PropType<"large" | "normal" | "small">, default: "normal" },
    type: { type: String as PropType<NotificationType>, default: "warning" }
  },
  emits: ["click", "close"],
  setup(props, { emit, slots }) {
    return () => (
      <section
        class={[bem(), bem({ [props.type]: true, [props.size]: true })]}
        role="status"
        onClick={(event: MouseEvent) => emit("click", event)}>
        <div class={bem("content")}>
          {props.title && <h3 class={bem("title")}>{props.title}</h3>}
          <div class={bem("message")}>{slots.default?.() ?? props.message}</div>
        </div>
        <button
          type="button"
          aria-label="关闭通知"
          onClick={(event: MouseEvent) => {
            event.stopPropagation();
            emit("close");
          }}>
          ×
        </button>
      </section>
    );
  }
});
