import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('rate');
import "./index.scss";

export default createComponent({
    props: {
        value: {
            type: Number,
        },
        max: {
            type: Number,
            default: 5
        },
        iconType: {
            type: String,
            default: 'icon-collection_fill'
        },
        emptyColor: {
            type: String,
            default: '#ffffff'
        },
        fillColor: {
            type: String,
            default: '#f7ba2a'
        },
        texts: {
            type: Array,
            default: function () {
                return []
                // return ['极差', '失望', '一般', '满意', '惊喜']
            }
        },
        color: {
            type: String,
            default: '#3c3c3c'
        }
    },
    model: {
        prop: 'value',
        event: 'change'
    },
    data() {
        return {
            arr: [],
            count: 0,
            currIndex: this.value
        }
    },
    mounted() {
        this.arr = new Array(this.max).fill(0)
        this.hoverChange(this.value)
    },
    methods: {
        hoverChange(index) {
            if (this.$attrs.disabled != undefined && this.count === 1) return;
            for (let i = 0; i < this.arr.length; i++) {
                this.$set(this.arr, i, 0)
            }
            for (let i = 1; i <= index; i++) {
                this.$set(this.arr, i - 1, 1)
            }
            this.currIndex = index
            this.count++
        },
        clearHover() {
            if (this.$attrs.disabled != undefined) return;
            if (this.value) {
                this.hoverChange(this.value)
                return
            }
            for (let i = 0; i < this.arr.length; i++) {
                this.$set(this.arr, i, 0)
            }
        },
        clickRate(index) {
            if (this.$attrs.disabled != undefined) return;
            this.currIndex = index
            this.hoverChange(index)
            this.$emit('change', index)
        }
    },
    render(h) {
        return (
            <div class={bem({ 'disabled': this.$attrs.disabled != undefined })} onMouseout={() => this.clearHover()}>
                {
                    this.arr.map((item, index) => {
                        return <span class={[bem('item')]}
                            onMouseover={() => this.hoverChange(index + 1)}
                            onClick={() => this.clickRate(index + 1)}
                        >
                            <i-icon
                                type={this.iconType}
                                class={[bem('icon')]}
                                style={{ '-webkit-text-fill-color': item !== 0 ? this.fillColor : this.emptyColor }}
                            ></i-icon>
                        </span>
                    }
                    )
                }
                <span style={{ 'color': this.color }}>{this.texts[this.currIndex - 1]}</span>
            </div>
        )
    },
});