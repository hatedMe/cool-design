import { defineComponent, type PropType } from "vue";
import { useConfig, type Size } from "../config-provider/context";
export default defineComponent({
  name: "i-space",
  props: {
    size: [Number, String, Array] as PropType<number | Size | [number, number]>,
    direction: { type: String as PropType<"horizontal" | "vertical">, default: "horizontal" },
    align: { type: String as PropType<"start" | "end" | "center" | "baseline" | "stretch">, default: "center" },
    wrap: { type: Boolean, default: true }
  },
  setup(props, { slots }) {
    const config = useConfig();
    return () => {
      const size = props.size ?? config.value.size;
      const gap = Array.isArray(size)
        ? size.map((v) => `${v}px`).join(" ")
        : typeof size === "number"
          ? `${size}px`
          : `${{ small: 4, default: 8, large: 12 }[size]}px`;
      return (
        <div
          class="i-space"
          style={{
            gap,
            flexDirection: props.direction === "vertical" ? "column" : "row",
            alignItems: props.align,
            flexWrap: props.wrap ? "wrap" : "nowrap"
          }}>
          {slots.default?.()}
        </div>
      );
    };
  }
});
