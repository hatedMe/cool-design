import { createNamespace } from "../../src/utils/index";
const [createComponent, bem] = createNamespace('switch');
import "./index.scss";

export default createComponent({
    props: {
        value: {
            type: String | Number | Boolean,
            default: false
        },
        closeText: String,
        openText: String,
    },
    methods: {
        change() {
            this.$emit('change')
        }
    },
    render(h) {
        return (
            <span class={[bem({ active: this.value, check: this.value })]} onClick={() => this.change()}></span>
        )
    },
});
