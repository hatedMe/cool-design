import { computed, defineComponent, h, provide, type InjectionKey, type ComputedRef, type PropType } from "vue";
export const rowValues = ["start", "end", "center", "space-around", "space-between"] as const;
export const columnValues = ["top", "bottom", "center"] as const;
export const rowKeys: InjectionKey<{ gutter: ComputedRef<number> }> = Symbol("row");
export default defineComponent({
    name: "i-row",
    props: {
        tag: { type: String, default: "div" },
        gutter: { type: Number, default: 0 },
        justify: { type: String as PropType<(typeof rowValues)[number]>, default: "start" },
        align: { type: String as PropType<(typeof columnValues)[number]>, default: "top" }
    },
    setup(props, { slots }) {
        provide(rowKeys, { gutter: computed(() => props.gutter) });
        return () =>
            h(
                props.tag,
                {
                    class: "i-row",
                    style: {
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: props.justify,
                        alignItems: { top: "flex-start", bottom: "flex-end", center: "center" }[props.align],
                        marginLeft: `${-props.gutter / 2}px`,
                        marginRight: `${-props.gutter / 2}px`
                    }
                },
                slots.default?.()
            );
    }
});
