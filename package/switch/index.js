import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('switch');
import "./index.scss";

export default createComponent({
    props: {
        value: {
            type: String | Number | Boolean,
            default: false
        },
        width: {
            type: Number,
            default: 40
        },
        disabled: {
            type: Boolean,
            default: false
        },
        activeColor: {
            type: String
        },
        inactiveColor: {
            type: String,
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
            <div class={bem()}>
                {
                    this.closeText ? <span class={[bem('text-left', { 'active': !this.value })]}>{this.closeText}</span> : null
                }
                <span class={[bem('beal', { active: this.value, disabled: this.disabled })]} style={{ width: this.width + 'px' }} onClick={() => this.disabled ? null : this.change()}></span>
                {
                    this.openText ? <span class={[bem('text-right', { 'active': this.value })]}>{this.openText}</span> : null
                }
            </div>
        )
    },
});
