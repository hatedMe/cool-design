import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('radio-group');
import "./index.scss";

export default createComponent({
    props: {
        value: {
            type: Number | String | Boolean,
        }
    },
    model: {
        prop: 'value',
        event: 'change'
    },
    methods: {
        changeHandle(value) {
            this.$emit('change', value)
        },
    },
    render(h) {
        return (
            <div class={bem()} >
                {this.$slots.default}
            </div>
        )
    },
});
