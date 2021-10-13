import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('radio');
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
                class={bem({'is-disabled': this.$attrs.disabled != undefined})} 
                onClick={() => this.$attrs.disabled !== undefined ? null : this.changeHandle(this.label)}
            >
                <span 
                    class={bem('icon', {
                        'is-checked': this.label == this.$parent.value, 
                        'is-disabled': this.$attrs.disabled != undefined && this.label == this.$parent.value,
                        'is-disabled-not-check': this.$attrs.disabled != undefined && this.label != this.$parent.value
                        })}>
                </span>
                <span class={bem('text', { 'is-disabled': this.$attrs.disabled != undefined })}>{this.$slots.default}</span>
            </div>
        )
    },
});
