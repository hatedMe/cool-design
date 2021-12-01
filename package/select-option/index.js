import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('select-option');
import "./index.scss";

export default createComponent({
    props: {
        label: {
            type: String
        },
        value: {
            type: String | Number | Boolean
        },
        disabled: []
    },
    data() {
        return {
            parentValue: this.$parent.value
        }
    },
    mounted() {
        if (this.parentValue && this.parentValue === this.value) {
            this.$parent.setValueLabel(this.label)
        }
    },
    methods: {
        itemClickHandle() {
            this.$parent.setValueLabel(this.label)
            this.$parent.setModalVal(this.value)
            this.$parent.openSelect()
        }
    },
    render(h) {
        return (
            <div class={bem()} >
                <p
                    class={[bem('item', { 'disabled': this.disabled === "", 'active': this.value === this.parentValue })]}
                    onClick={() => this.itemClickHandle()}
                >{this.label}</p>
            </div>
        )
    },
});
