import { defineComponent, type PropType } from "vue";
import { useConfig, type Size } from "../config-provider/context";
export type TagType = "primary" | "success" | "warning" | "danger" | "info";
export default defineComponent({
    name: "i-tag",
    props: {
        type: { type: String as PropType<TagType>, default: "primary" },
        effect: { type: String as PropType<"light" | "plain" | "dark">, default: "light" },
        size: String as PropType<Size>,
        closable: Boolean,
        disabled: Boolean,
        color: String,
        round: Boolean,
        hit: Boolean
    },
    emits: ["click", "close"],
    setup(props, { slots, emit }) {
        const config = useConfig();
        return () => (
            <span
                class={[
                    "i-tag",
                    `i-tag--${props.type}`,
                    `i-tag--${props.effect}`,
                    `i-tag--${props.size || config.value.size}`,
                    { "i-tag--disabled": props.disabled, "i-tag--round": props.round, "i-tag--hit": props.hit }
                ]}
                style={props.color ? { "--i-tag-color": props.color } : undefined}
                onClick={(event: MouseEvent) => {
                    if (!props.disabled) emit("click", event);
                }}>
                {slots.default?.()}
                {props.closable && (
                    <button
                        type="button"
                        aria-label="移除标签"
                        disabled={props.disabled}
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                            if (!props.disabled) emit("close", event);
                        }}>
                        ×
                    </button>
                )}
            </span>
        );
    }
});
