import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('alert');
import "./index.scss";

export default createComponent({
    props: {
        title: String,
        // success/warning/info/error
        type: {
            type: String,
            default: 'error'
        },
        closeble: {
            type: Boolean,
            default: true
        },
        desc: String,
        closeText: String,
        showIcon: Boolean,
    },
    data() {
        return {
            close: false
        }
    },
    methods: {
        closeAlert() {
            this.close = true
            this.$emit('close')
        }
    },

    render(h) {
        return (
            <div class={[bem(), bem(this.type), bem({ 'hide': this.close })]}>
                <p>
                    <span class={bem('title', { 'wight': !!this.desc })}>{this.title}</span>
                    <span class={bem('close')} onClick={() => this.closeAlert()}>
                        {
                            this.closeText || <i-icon type="icon-close"></i-icon>
                        }
                    </span>
                </p>
                {
                    this.desc ? <p class={bem('desc')}>
                        {this.desc}
                    </p> : null
                }
            </div>
        )
    },
});
