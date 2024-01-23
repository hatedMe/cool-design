import { computed, defineComponent } from "vue";
import type { PropType } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("badge");

export type Type =
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info";

const props = {
    value : {
        type: [ String, Number ] as PropType<string | number>,
        default: "",
    },
    /** @description 最大值 */
    max : {
        type: Number as PropType<number>,
        default: 99,
    },
    type: {
        type: String as PropType<Type>,
        default: "warning",
    },
    isDot: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
};


const isNumber = (value: unknown): boolean => typeof value === "number";

export default defineComponent({
    name,
    props,
    setup(props, { slots }) {

        const content = computed<string>(() => {
            const { max , value , isDot } = props;
            if(isDot ) return ''
            if ( isNumber(value) && isNumber(max) ) {
                return max < Number(value) ? `${max}+` : `${value}`;
            }
            return `${value}`;
        });

        const classes = [
            bem(props.type , { dot: !props.value }),
        ];

        return () => (
            <div class={bem()}>
                { slots.default?.() }
                <transiton>
                    <span class={classes}>
                        { content }
                    </span>
                </transiton>
            </div>
        );
    }
});
