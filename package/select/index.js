import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('select');
import "./index.scss";

export default createComponent({
    props: {
        value: [],
        clearable: []
    },
    data() {
        return {
            valueText: '',
            open: false,
            randomN: 1
        }
    },
    model: {
        prop: 'value',
        event: 'change'
    },
    watch: {
        value: function () {
            this.randomN = Math.random()
        }
    },
    methods: {
        setModalVal(val) {
            this.$emit('change', val)
        },
        setValueLabel(label) {
            this.valueText = label
        },
        openSelect() {
            this.open = !this.open
        },
        deleteValue(e) {
            if (e && e.stopPropagation) {
                e.stopPropagation();
            } else {
                window.e.cancelBubble
            }
            this.valueText = ""
            this.$emit('change', '')
        }
    },
    render(h) {
        return (
            <div class={bem()} >
                <div onClick={() => this.openSelect()}>
                    <input class={[bem('input')]} placeholder="请选择" readonly value={this.valueText} />
                    {
                        this.valueText && this.clearable === "" ?
                            <span onClick={(e) => this.deleteValue(e)} ><i-icon type="icon-delete" /></span>
                            : <i-icon type="icon-packup" class={[bem('icon', { roter: this.open })]} />
                    }
                </div>
                <div class={[bem('data'), { 'hide': !this.open }]} key={this.randomN}>
                    {this.$slots.default}
                </div>
            </div>
        )
    },
});
