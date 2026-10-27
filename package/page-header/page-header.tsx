import { defineComponent } from "vue";
export default defineComponent({
  name: "i-page-header",
  props: {
    title: String,
    content: String,
    icon: { type: String, default: "‹" },
    backText: { type: String, default: "返回" }
  },
  emits: ["back"],
  setup(props, { slots, emit }) {
    return () => (
      <header class="i-page-header">
        <button type="button" onClick={() => emit("back")}>
          {props.icon} {props.backText}
        </button>
        <div class="i-page-header__main">
          <strong>{slots.title?.() ?? props.title}</strong>
          <span>{slots.content?.() ?? props.content}</span>
        </div>
        <div class="i-page-header__extra">{slots.extra?.()}</div>
      </header>
    );
  }
});
