import { PropType, computed, defineComponent, ref } from "vue";
import { createNamespace } from "../../src/utils/create";
import Icon from "../icon";
const [name, bem] = createNamespace("avatar");

export type AvatarShape = "circle" | "square";
export type AvatarSize = "large" | "medium" | "small" | number;
export type AvatarFit = "fill" | "contain" | "cover" | "none" | "scale-down";

const isNumber = (value: unknown): boolean => typeof value === "number";

export default defineComponent({
    name,
    props: {
        url: {
            type: String,
            default: ""
        },
        src: String,
        srcSet: String,
        alt: { type: String, default: "" },
        /**
         * @description 形状
         * - `circle` 圆形
         * - `square` 方形
         */
        shape: {
            type: String as PropType<AvatarShape>,
            default: "square"
        },
        size: {
            type: [String, Number] as PropType<AvatarSize>,
            default: "large"
        },
        icon: String,
        fit: {
            type: String as PropType<AvatarFit>,
            default: "cover"
        }
    },
    emits: ["error"],
    setup(props, { slots, emit }) {
        const imageError = ref(false);
        const style = computed(() => {
            if (isNumber(props.size)) {
                return {
                    width: `${props.size}px`,
                    height: `${props.size}px`
                };
            }
        });

        const classLists = computed(() =>
            bem({
                [props.shape]: true,
                [props.size]: !isNumber(props.size)
            })
        );

        return () => (
            <div class={classLists.value} style={style.value}>
                {!imageError.value && (props.url || props.src) && (
                    <img
                        class={[bem("img"), bem("img", { [props.fit]: true })]}
                        src={props.url || props.src}
                        srcset={props.srcSet}
                        alt={props.alt}
                        onError={(event: Event) => {
                            imageError.value = true;
                            emit("error", event);
                        }}
                    />
                )}
                {imageError.value ? slots.fallback?.() : props.icon ? <Icon type={props.icon} /> : slots.default?.()}
            </div>
        );
    }
});
