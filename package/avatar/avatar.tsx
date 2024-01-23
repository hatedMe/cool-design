import { PropType, computed, defineComponent } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("avatar");


export type AvatarShape = "circle" | "square";
export type AvatarSize = "large" | "medium" | "small" | number;
export type AvatarFit = "fill" | "contain" | "cover" | "none" | "scale-down"

const isNumber = (value: unknown): boolean => typeof value === "number";

export default defineComponent({
    name,
    props: {
        url: {
            type: String,
            default: "",
        },
        /**
         * @description 形状
         * - `circle` 圆形
         * - `square` 方形
         */
        shape: {
            type: String as PropType<AvatarShape>,
            default: "square",
        },
        size: {
            type: [String, Number] as PropType<AvatarSize>,
            default: "large",
        },
        icon: String,
        fit: {
            type: String as PropType<AvatarFit>,
            default: "cover",
        }
    },
    setup(props, { slots }) {
        const { size, url, icon , shape , fit } = props;
        const style = computed(() => {
            if (isNumber(size)) {
                return {
                    width: `${size}px`,
                    height: `${size}px`,
                };
            }
        });

        const classLists = bem({ 
            [shape] : !0 , 
            [fit] : !0 ,
            [size] : !isNumber(size),
        })

        return () => (
            <div class={classLists} style={style.value}>
                { url && <img class={bem("img")} src={url}></img> }
                { icon && <i-icon type={icon}></i-icon> }
                { slots.default?.() }
            </div>
        );
    },
});
