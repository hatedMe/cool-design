import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('empty');
import "./index.scss";

export default createComponent({
    props: {
        url: {
            type: String,
            default: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
        },
        desc: {
            type: String,
            default: '暂无数据'
        },
        imgSize: {
            type: Number
        }
    },
    computed: {
        imgStyle: function () {
            const size = {
                'width': this.imgSize + 'px',
                'height': this.imgSize + 'px',
            }
            return this.imgSize ? size : null
        }
    },
    render(h) {
        return (
            <div class={bem()}>
                <img src={this.url} style={this.imgStyle} />
                {
                    this.desc ? <div class={bem('desc')}>
                        {this.desc}
                    </div> : null
                }
                <div class={bem('action')}>
                    {this.$slots.default}
                </div>
            </div>
        )
    },
});
