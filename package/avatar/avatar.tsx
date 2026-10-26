import { PropType, computed, defineComponent } from "vue";
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
    setup(props, { slots }) {
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
                {props.url && <img class={[bem("img"), bem("img", { [props.fit]: true })]} src={props.url} alt="" />}
                {props.icon && <Icon type={props.icon} />}
                {slots.default?.()}
            </div>
        );
    }
});
