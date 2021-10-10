import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('radio-button');
import "./index.scss";

export default createComponent({
    props: {
        label: {
            type: String | Number,
        },
    },
    methods: {
        changeHandle(label) {
            this.$parent.changeHandle(label)
        }
    },
    render(h) {
        return (
            <div
                class={bem({
                    'is-checked': this.label == this.$parent.value,
                    'is-disabled': this.$attrs.disabled != undefined && this.label == this.$parent.value,
                    'is-disabled-not-check': this.$attrs.disabled != undefined && this.label != this.$parent.value
                })}
                onClick={() => this.$attrs.disabled !== undefined ? null : this.changeHandle(this.label)}
            >

                {this.$slots.default}
            </div>
        )
    },
});
