import {
    computed,
    defineComponent,
    provide,
    type CSSProperties,
    type PropType,
    type InjectionKey,
    type ComputedRef,
} from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("col");

export const rowValues = [
    "start",
    "end",
    "center",
    "space-around",
    "space-between",
] as const;
export const columnValues = ["top", "bottom", "center"] as const;

export const rowKeys: InjectionKey<{
    gutter: ComputedRef<number>;
}> = Symbol("rowKeys");

export default defineComponent({
    name,
    props: {
        tag: {
            type: String,
            default: "div",
        },
        gutter: {
            type: Number,
            default: 0,
        },
        justify: {
            type: String as PropType<(typeof rowValues)[number]>,
            values: rowValues,
            default: "center",
        },
        align: {
            type: String as PropType<(typeof columnValues)[number]>,
            values: rowValues,
            default: "center",
        },
    },
    setup(props, ctx) {
        const { tag, gutter, justify, align } = props;
        const style = computed(() => {
            const ret: CSSProperties = {};
            if (gutter) {
                ret.marginLeft = `-${gutter / 2}px`;
            }
            return ret;
        });

        const classes = bem({
            [`justify-${props.justify}`]: justify,
            [`align-${props.align}`]: align,
        });

        provide(rowKeys, {
            gutter : computed(() => gutter),
        });

        return () => (
            <tag class={classes} style={style.value}>
                {ctx.slots.default?.()}
            </tag>
        );
    },
});
