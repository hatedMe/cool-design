import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('row');
import "./index.scss";
export default createComponent({
    props: {
        tag: {
            type: String,
            default: 'div'
        },
        gutter: Number,
        type: String,
        justify: {
            type: String,
            default: 'center'
        },
        align: {
            type: String,
            default: 'center'
        }
    },

    computed: {
        style() {
            const ret = {};
            if (this.gutter) {
                ret.marginLeft = `-${this.gutter / 2}px`;
                ret.marginRight = ret.marginLeft;
            }
            return ret;
        }
    },

    render(h) {
        return h(this.tag, {
            'class': [
                bem(),
                { [bem({ flex: true, justify: this.justify, align: this.align })]: this.type === 'flex' }
            ],
            style: this.style
        }, this.$slots.default);
    }
});
