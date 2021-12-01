import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('badge');
import "./index.scss";

export default createComponent({
  props: {
    value: {
      type: Number | String
    },
    max: {
      type: Number
    },
    // primary / success / warning / danger / info
    type: {
      type: String,
      default: 'primary'
    },
    isDot: [Boolean]
  },

  render(h) {
    return (
      <div class={[bem()]}>
        {this.$slots.default}
        {
          !this.isDot ? <span class={[bem('tag'), `bgc-${this.type}`]}>
            {this.max && this.value > this.max ? this.max + '+' : this.value}</span>
            :
            <span class={[bem('dot'), `bgc-${this.type}`]}></span>
        }
      </div>
    )
  },
});
