import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('switch');
import "./index.scss";

export default createComponent({
    props: {
        value: {
            type: String | Number | Boolean,
            default: false
        },
        activeValue: String,
        inactiveValue: String,
        width: {
            type: Number,
            default: 40
        },
        disabled: {
            type: Boolean,
            default: false
        },
        activeColor: String,
        inactiveColor: String,
        closeText: String,
        openText: String,
    },
    data() {
        return {
            currStatus: this.value
        }
    },
    methods: {
        change() {
            this.currStatus = !this.currStatus
            this.$emit('change', this.currStatus ? this.activeValue || true : this.inactiveValue || false)
        }
    },
    render(h) {
        return (
            <div class={bem()}>
                {
                    this.closeText ? <span class={[bem('text-left', { 'active': !this.currStatus })]}>{this.closeText}</span> : null
                }
                <span class={[bem('beal', { active: this.currStatus, disabled: this.disabled })]} style={{ width: this.width + 'px' }} onClick={() => this.disabled ? null : this.change()}></span>
                {
                    this.openText ? <span class={[bem('text-right', { 'active': this.currStatus })]}>{this.openText}</span> : null
                }
            </div>
        )
    },
});
