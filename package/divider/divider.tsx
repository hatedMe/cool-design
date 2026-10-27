import { defineComponent, type PropType } from "vue";
export default defineComponent({
    name: "i-divider",
    props: {
        vertical: Boolean,
        direction: { type: String as PropType<"horizontal" | "vertical">, default: "horizontal" },
        contentPosition: { type: String as PropType<"left" | "center" | "right">, default: "center" },
        borderStyle: { type: String as PropType<"solid" | "dashed">, default: "solid" }
    },
    setup(props, { slots }) {
        const isVertical = () => props.vertical || props.direction === "vertical";
        return () => (
            <div
                role="separator"
                aria-orientation={isVertical() ? "vertical" : "horizontal"}
                class={["i-divider", { "i-divider--vertical": isVertical() }, `i-divider--${props.contentPosition}`]}
                style={{ "--i-divider-border-style": props.borderStyle }}>
                {!isVertical() && slots.default && <span>{slots.default()}</span>}
            </div>
        );
    }
});
