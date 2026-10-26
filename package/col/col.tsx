import { computed, defineComponent, h, inject } from "vue";
import { rowKeys } from "../row/row";
export default defineComponent({
    name: "i-col",
    props: {
        span: { type: Number, default: 24 },
        tag: { type: String, default: "div" },
        offset: { type: Number, default: 0 },
        pull: Number,
        push: Number,
        xs: [Number, Object],
        sm: [Number, Object],
        md: [Number, Object],
        lg: [Number, Object],
        xl: [Number, Object]
    },
    setup(props, { slots }) {
        const { gutter } = inject(rowKeys, { gutter: computed(() => 0) });
        return () =>
            h(
                props.tag,
                {
                    class: "i-col",
                    style: {
                        flex: `0 0 ${(props.span / 24) * 100}%`,
                        maxWidth: `${(props.span / 24) * 100}%`,
                        marginLeft: `${(props.offset / 24) * 100}%`,
                        paddingLeft: `${gutter.value / 2}px`,
                        paddingRight: `${gutter.value / 2}px`
                    }
                },
                slots.default?.()
            );
    }
});
