import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('select');
import "./index.scss";

export default createComponent({
    props: {
        data: {
            type: Array,
            default: function () {
                return []
            }
        },
    },
    data() {
        return {
            value: "",
            open: false,
        }
    },
    methods: {
        change(index) {
            if (this.data[index].disabled) return;
            this.value = this.data[index].label
            this.open = false
            this.$emit('change', this.data[index].value)
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
            this.value = ""
        }
    },
    render(h) {
        return (
            <div class={bem()} >
                <div onClick={() => this.openSelect()}>
                    <input class={[bem('input')]} placeholder="请选择" readonly value={this.value} />
                    {
                        this.value ?
                            <span onClick={(e) => this.deleteValue(e)} ><i-icon type="icon-delete" /></span>
                            : <i-icon type="icon-packup" class={[bem('icon', { roter: this.open })]} />
                    }
                </div>
                {
                    this.open && this.data.length ? <div class={[bem('data')]}>
                        {
                            this.data.map((item, index) => {
                                return <p class={[bem('item', { disabled: item.disabled })]} onClick={() => this.change(index)}>{item.label}</p>
                            })
                        }
                    </div> : null
                }
            </div>
        )
    },
});
