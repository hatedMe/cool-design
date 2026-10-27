import { defineComponent, ref, type PropType } from "vue";
export default defineComponent({
  name: "i-popover",
  props: {
    content: String,
    title: String,
    trigger: { type: String as PropType<"click" | "hover" | "focus" | "contextmenu">, default: "click" },
    placement: { type: String, default: "bottom" },
    disabled: Boolean,
    width: [String, Number]
  },
  emits: ["show", "hide", "after-enter", "after-leave"],
  setup(props, { slots, emit }) {
    const open = ref(false);
    const toggle = () => {
      if (props.disabled) return;
      open.value = !open.value;
      emit(open.value ? "show" : "hide");
    };
    return () => (
      <span
        class="i-popover"
        onMouseenter={() => props.trigger === "hover" && (open.value = true)}
        onMouseleave={() => props.trigger === "hover" && (open.value = false)}>
        <span
          onClick={() => props.trigger === "click" && toggle()}
          onFocus={() => props.trigger === "focus" && (open.value = true)}
          onContextmenu={(e) => {
            if (props.trigger === "contextmenu") {
              e.preventDefault();
              toggle();
            }
          }}>
          {slots.reference?.() ?? slots.default?.()}
        </span>
        {open.value && (
          <div
            class={["i-popover__content", `is-${props.placement}`]}
            style={{ width: typeof props.width === "number" ? `${props.width}px` : props.width }}>
            {props.title && <strong>{props.title}</strong>}
            {slots.content?.() ?? props.content}
          </div>
        )}
      </span>
    );
  }
});
