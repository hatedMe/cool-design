import { defineComponent, type PropType } from "vue";
import { useConfig } from "../config-provider/context";
import type { ButtonType, ButtonSize } from "./types";
export type { ButtonType } from "./types";
export default defineComponent({
    name: "i-button",
    props: {
        size: String as PropType<ButtonSize>,
        type: { type: String as PropType<ButtonType>, default: "default" },
        disabled: Boolean,
        loading: Boolean,
        nativeType: { type: String as PropType<"button" | "submit" | "reset">, default: "button" }
    },
    emits: ["click"],
    setup(props, { slots, emit }) {
        const config = useConfig();
        return () => (
            <button
                class={[
                    "i-button",
                    `i-button--${props.size === "normal" ? "default" : props.size || config.value.size}`,
                    `i-button--${props.type}`
                ]}
                type={props.nativeType}
                disabled={props.disabled || props.loading}
                aria-busy={props.loading}
                onClick={(event: MouseEvent) => {
                    if (!props.disabled && !props.loading) emit("click", event);
                }}>
                {props.loading && <span aria-hidden="true">...</span>}
                {slots.default?.()}
            </button>
        );
    }
});
