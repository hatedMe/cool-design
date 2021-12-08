import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('avatar');
import "./index.scss";

export default createComponent({
    props: {
        url: {
            type: String,
            default: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
        },
        // circle square
        type: {
            type: String,
            default: 'square'
        },
        // ["large", "medium", "small"]
        size: {
            type: String | Number,
            default: 'large'
        },
        icon: String
    },
    computed: {
        imgStyle: function () {
            let style = {}
            if (this.type === 'circle') {
                style['border-radius'] = '50%'
            } else {
                style['border-radius'] = '4px'
            }
            switch (this.size) {
                case 'large':
                    style['width'] = '40px';
                    style['height'] = '40px';
                    style['line-height'] = '40px';
                    break;
                case 'medium':
                    style['width'] = '36px';
                    style['height'] = '36px';
                    style['line-height'] = '40px';
                    break;
                case 'small':
                    style['width'] = '28px';
                    style['height'] = '28px';
                    style['line-height'] = '40px';
                    break;
                default:
                    style['width'] = this.size + 'px';
                    style['height'] = this.size + 'px';
                    style['line-height'] = this.size + 'px';
            }
            return style;
        }
    },
    render(h) {
        return (
            <div class={bem()} style={this.imgStyle}>
                {this.url ? <img class={bem('img')} src={this.url}></img> : this.icon ? <i-icon type={this.icon}></i-icon> : this.$slots.default}
            </div>
        )
    },
});
