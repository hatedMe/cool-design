import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('progress');
import "./index.scss";

export default createComponent({
  props: {
    value: {
      type: Number | String,
      require: true
    },
    type: {
      type: String,
      default: 'line'
    },
    width: {
      type: Number,
      default: 130
    },
    textInside: {
      type: Boolean,
      default: false
    },
    strokeWidth: [Number],
    strokeHeight: [Number],
    formatText: [Function],
    status: [String],
    color: [String, Function],
    showText: [Boolean]
  },
  data() {
    return {
      lineValue: 0,
    }
  },
  watch: {
    value: {
      handler(val){
        this.lineValue = Number(val)
      }
    }
  },
  computed: {
    widthText: function () {
      this.lineValue = this.lineValue > 100 ? 100 : this.lineValue
      return this.lineValue + '%'
    },

    describeText: function () {
      this.lineValue = this.lineValue > 100 ? 100 : this.lineValue
      if (this.formatText) {
        return this.formatText(this.lineValue)
      }
      return this.widthText
    },

    fullColor: function () {
      let color = ''
      if (this.color instanceof Function) {
        return this.color(this.lineValue)
      } else {
        switch (this.status) {
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
        return this.color || color;
      }
    }
  },
  mounted() {
    this.lineValue = Number(this.value)
    if (this.type === 'circle') {
      this.setCircleCanvas()
    }
  },
  methods: {
    setCircleCanvas() {
      let options = {
        color: this.fullColor,
        lineWidth: 10,
      }
      let circle = document.getElementById('circle');
      let sCircle = circle.width / 2;
      let ctx = circle.getContext('2d');
      let nBegin = Math.PI * 2 * (this.lineValue >= 100 ? 1 : 1 - this.lineValue * 0.01);
      let nEnd = 0;
      ctx.lineWidth = options.lineWidth
      ctx.clearRect(0, 0, circle.width, circle.height);

      //底色圆
      ctx.beginPath();
      ctx.arc(sCircle, sCircle, (sCircle - options.lineWidth), -Math.PI / 2, Math.PI * 2)
      ctx.closePath()
      ctx.strokeStyle = '#E9E9E9FF'
      ctx.stroke()

      //进度圆
      ctx.beginPath();
      ctx.arc(sCircle, sCircle, (sCircle - options.lineWidth), nBegin, nEnd)
      ctx.strokeStyle = options.color
      ctx.textAlign = 'center'
      if(this.showText){
         ctx.fillText(this.widthText, sCircle, sCircle)//文本
      }     
      ctx.stroke()
    },
    fullProgressHandle() {
      // this.lineValue += 10
      // this.setCircleCanvas()
    }
  },
  render(h) {
    return (
      <div class={bem()} onClick={() => this.fullProgressHandle()}>
        {
          this.type === 'line' ? <div><p class={bem('line')} style={{ 'height': `${this.strokeHeight || 8}px`, 'width': `${this.strokeWidth || 380}px` }}>
            <span
              class={bem('line', { 'full': true })}
              style={{ 'width': this.widthText, 'background-color': this.fullColor }}
            >
              {
                this.type === 'line' && this.textInside && this.showText ? <p class={bem('describe', { 'inside': true })}>{this.describeText}</p> : null
              }
            </span>
          </p>
            {
              this.textInside ? null : this.status ? <i-icon type={`icon-${this.status}`} style={{ 'color': this.fullColor }} /> : <p class={bem('describe')}>{this.describeText}</p>
            }
          </div> : <canvas class={bem('circle')} id='circle' height={this.width} width={this.width} ></canvas>
        }
      </div>
    )
  },
});
