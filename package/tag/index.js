import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('tag');
import "./index.scss";

export default createComponent({
  props: {
    type: {
      type: String,
      default: 'parimary'
    },
    effect: {
      type: String,
      default: ''
    },
    closable: [Boolean],
    hit: [Boolean],
    color: [String]

  },
  computed: {
    iconStyle: function () {
      let color = ''
      switch (this.type) {
        case 'success':
          color = '#67c23a';
          break;
        case 'warning':
          color = '#f4984e';
          break;
        case 'exception':
          color = '#F86868';
          break;
        default:
          color = '#20aeff'
      }
      return {
        '--text-color': 'white',
        '--bg-color': color,
      }
    },
    text: function(){
      return this.$slots.default[0].text
    }
  },
  methods: {
    deleteTagEle(e) {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      } else {
        window.e.cancelBubble
      }
      this.$emit('close')
    },
    onClick(){
      this.$emit('click')
    }
  },
  render(h) {
    return (
      <span class={[bem(), bem() + '__' + this.type]} onClick={()=> this.onClick()}>
        {this.text}
        {
          this.closable ? <span class={bem('icon')} onClick={(e) => this.deleteTagEle(e)}>
            <i-icon type="icon-close" style={this.iconStyle} /> 
          </span> : null
        }
      </span>
    )
  },
});
