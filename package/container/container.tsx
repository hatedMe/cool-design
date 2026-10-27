import { Fragment, defineComponent, isVNode, type PropType } from "vue";
function hasVerticalRegion(children: unknown[]): boolean {
  return children.some(
    (child) =>
      isVNode(child) &&
      (child.type === Fragment
        ? hasVerticalRegion(Array.isArray(child.children) ? child.children : [])
        : typeof child.type === "object" &&
          ["i-header", "i-footer"].includes((child.type as { name?: string }).name || ""))
  );
}
export default defineComponent({
  name: "i-container",
  props: { direction: String as PropType<"horizontal" | "vertical"> },
  setup(props, { slots }) {
    return () => {
      const children = slots.default?.() || [];
      const direction = props.direction || (hasVerticalRegion(children) ? "vertical" : "horizontal");
      return <section class={["i-container", `i-container--${direction}`]}>{children}</section>;
    };
  }
});
