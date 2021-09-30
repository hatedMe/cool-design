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
    watch: {
        // value: function (newVal, oldVal){
        //     if(newVal===oldVal) return;
        //     const _this = this
        //     let clear = document.getElementById('clearvalue')
        //     clear.addEventListener('click',()=>{
        //         _this.value = ""
        //     },true)
        // }
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
            this.value = ""
            console.log('deleteValue');
        }
    },
    render(h) {
        return (
            <div class={bem()} >
                <div onClick={() => this.openSelect()}>
                    <input class={[bem('input')]} placeholder="请选择" readonly value={this.value} />
                    {
                        this.value ?
                            <i-icon id="clearvalue" type="icon-delete" onClick={() => this.deleteValue($event)} />
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
