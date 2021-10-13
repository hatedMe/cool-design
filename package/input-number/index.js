import { createNamespace, operationTwoNumber } from "@/utils/index";
const [createComponent, bem] = createNamespace('input-number');
import "./index.scss";

export default createComponent({
    props: {
        value: {
            type: Number,
            default: 0
        },
        max: Number,
        min: Number,
        step: {
            type: Number,
            default: 3
        }
    },
    model: {
        prop: 'value',
        event: 'change'
    },
    data() {
        return {
            val: this.value,
        }
    },
    watch: {
        value: function (n, o) {
            this.val = n
        }
    },
    mounted() {
        if (this.$attrs.strictly != undefined) {
            this.changeValue(this.step)
        }
    },
    methods: {
        add() {
            const val = operationTwoNumber(this.val, this.step, 0)
            if (this.max != undefined && val > this.max || this.$attrs.disabled != undefined) return;
            this.changeValue(val)
        },
        reduce() {
            const val = operationTwoNumber(this.val, this.step, 1)
            if (this.min != undefined && val < this.min || this.$attrs.disabled != undefined) return;
            this.changeValue(val)
        },
        changeValue(val) {
            this.$emit('change', val)
        },
        changeInputValue(e) {
            const val = Number(e.target.value)
            if (typeof e.target.value !== Number || this.min != undefined && val < this.min || this.max != undefined && val > this.max) return;
            this.changeValue(val)
        },
        inputBlurHandle(e) {
            let val = Number(e.target.value)
            if (this.min != undefined && val < this.min) {
                val = this.min
            }
            if (this.max != undefined && val > this.max) {
                if (this.$attrs.strictly != undefined) {
                    val = this.step * (Math.floor(this.max / this.step))
                } else {
                    val = this.max
                }
            }
            this.changeValue(val)
        }
    },
    render(h) {
        const isMinNum = this.min != undefined && this.val - this.step < this.min
        const isMaxNum = this.max != undefined && this.val + this.step > this.max
        return (
            <div class={[bem({ 'disable': this.$attrs.disabled != undefined })]}>
                <span class={bem('action', { 'disable': isMinNum })} onClick={() => this.reduce()}>-</span>
                <input
                    class={bem('input', { 'disable': this.$attrs.disabled != undefined })}
                    type="string"
                    value={this.value}
                    readonly={this.$attrs.disabled != undefined}
                    onInput={(e) => this.changeInputValue(e)}
                    onBlur={(e) => this.inputBlurHandle(e)}
                />
                <span class={bem('action', { 'disable': isMaxNum })} onClick={() => this.add()}>+</span>
            </div>
        )
    },
});