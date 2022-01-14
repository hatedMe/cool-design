import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('cascader');
import "./index.scss";

export default createComponent({
    props: {
        value: {
            type: Number,
        },
        data: {
            type: Array,
            default: function () {
                return []
            }
        }
    },
    model: {
        prop: 'value',
        event: 'change'
    },
    data() {
        return {
            open: false,
        }
    },

    methods: {
        openCascader() {
            this.open = !this.open
        }
    },
    render(h) {
        return (
            <div class={bem()} >
                <div onClick={() => this.openCascader()}>
                    <input class={[bem('input')]} placeholder="请选择" readonly value={this.value} />
                    {
                        this.value ?
                            <span onClick={(e) => this.deleteValue(e)} ><i-icon type="icon-delete" /></span>
                            : <i-icon type="icon-packup" class={[bem('icon', { roter: this.open })]} />
                    }
                </div>
                {
                    this.open && this.data.length ? <div class={[bem('data-list')]}>
                        <div class={[bem('data-list-group')]}>
                            {
                                this.data.map((item, index) => {                                   
                                    return <p class={[bem('item', { disabled: item.disabled })]} onClick={() => this.change(index)}>
                                        {item.label}
                                    </p>
                                })
                            }
                        </div>
                        <div class={[bem('data-list-group')]}>
                            {
                                item.children.map((item, index) => {
                                    return <p class={[bem('item', { disabled: item.disabled })]} onClick={() => this.change(index)}>
                                        {item.label}
                                    </p>
                                })
                            }
                        </div>
                    </div> : null
                }
            </div>
        )
    },
});