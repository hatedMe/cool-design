import { defineComponent, type PropType } from "vue";
export default defineComponent({
    name: "i-divider",
    props: {
        vertical: Boolean,
        contentPosition: { type: String as PropType<"left" | "center" | "right">, default: "center" }
    },
    setup(props, { slots }) {
        return () => (
            <div
                role="separator"
                aria-orientation={props.vertical ? "vertical" : "horizontal"}
                class={["i-divider", { "i-divider--vertical": props.vertical }, `i-divider--${props.contentPosition}`]}>
                {!props.vertical && slots.default && <span>{slots.default()}</span>}
            </div>
        );
    }
});
