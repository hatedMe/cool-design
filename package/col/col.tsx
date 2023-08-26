import { type CSSProperties, computed, defineComponent , inject } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("col");
import { rowKeys } from "../row";

export default defineComponent({
    name,
    props: {
        span: {
            type: Number,
            default: 24,
        },
        tag: {
            type: String,
            default: "div",
        },
        offset: Number,
        pull: Number,
        push: Number,
        xs: [Number, Object],
        sm: [Number, Object],
        md: [Number, Object],
        lg: [Number, Object],
        xl: [Number, Object],
    },
    setup(props, { slots }) {
        const { tag , span , offset} = props;
        const { gutter } = inject(rowKeys, { gutter: computed(() => 0) });
        const style = computed(() => {
            const styles : CSSProperties = {};
            if( gutter.value ){
                styles.paddingLeft = `${gutter.value / 2}px`;
            }
        });
        
        return () => (
            <tag class={bem({ [span] : span , [`offset-${offset}`]: offset })} style={style.value}>
                {slots.default?.()}
            </tag>
        );
    },
});
