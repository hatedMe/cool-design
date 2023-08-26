import { PropType, computed, defineComponent } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("avatar");

export type AvatarShape = "circle" | "square";
export type AvatarSize = "large" | "medium" | "small" | number;

export default defineComponent({
    name,
    props: {
        url: {
            type: String,
            default: "",
        },
        shape: {
            type: String as PropType<AvatarShape>,
            default: "square",
        },
        size: {
            type: [String, Number] as PropType<AvatarSize>,
            default: "large",
        },
        icon: String,
    },
    setup(props, { slots }) {
        const { size, url, icon } = props;
        const style = computed(() => {
            if (typeof size === "number") {
                return {
                    width: `${size}px`,
                    height: `${size}px`,
                    lineHeight: `${size}px`,
                    fontSize: `${size / 2}px`,
                };
            }
        });

        return () => (
            <div class={bem()} style={style.value}>
                {url ? (
                    <img class={bem("img")} src={url}></img>
                ) : icon ? (
                    <i-icon type={icon}></i-icon>
                ) : (
                    slots.default?.()
                )}
            </div>
        );
    },
});
