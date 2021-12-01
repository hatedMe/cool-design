import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('pagination');
import "./index.scss";

export default createComponent({
  props: {
    total: {
      type: Number,
      default: 150
    },
    pageSize: {
      type: Number,
      default: 5
    },
    //暂时没实现 最大页数
    pageCount: {
      type: Number,
      default: 7
    },
    pageSizeData: {
      type: Array,
      default: function () {
        return [5]
      }
    },
    showTotal: [],
    background: [],

  },
  data() {
    return {
      currIndex: 1,
      pagesList: [],
      centerList: [],
      pageSizeDataList: this.pageSizeData,
      currPageSize: this.pageSize
    }
  },
  watch: {
    currIndex: function (n, o) {
      this.$emit('currPageChange', n)
      if (n > 4) {
        const reduceVal = this.maxPage - n
        this.centerList = [n - 2, n - 1, n, n + 1, n + 2]
        if (reduceVal <= 2) {
          let arr = this.centerList
          arr.splice(reduceVal - 2, -(reduceVal - 2))
          if (reduceVal === 1) {
            arr.unshift(n - 3)
          }
          if (reduceVal === 0) {
            arr.unshift(n - 3)
            arr.unshift(n - 4)
          }
          this.pagesList = [1, '...', ...arr]
          return;
        }
        this.pagesList = [1, '...', ...this.centerList, '...', this.maxPage]
      } else {
        this.initPageList()
      }
    },
    currPageSize: function (n, o) {
      this.$emit('pageSizeChange', n)
      this.initPageList()
    }
  },
  computed: {
    maxPage: function () {
      return Math.ceil(this.total / this.currPageSize)
    }
  },
  methods: {
    checkCurrIndex(item, index) {
      if (item === '...') {
        if (index > 5 && this.currIndex + 5 <= this.maxPage) {
          this.currIndex += 5
        } else if (index < 5) {
          this.currIndex -= 5
        }
        return;
      }
      if (item === 'prev' || item === 'next') {
        if (item === 'prev' && this.currIndex !== 1) {
          this.currIndex--;
        }
        if (item === 'next' && this.currIndex !== this.maxPage) {
          this.currIndex++;
        }
      } else {
        this.currIndex = item
      }

    },
    initPageList() {
      let arr = Array.from({ length: this.maxPage }, (v, k) => k + 1)
      if (this.maxPage > this.pageCount) {
        const len = arr.length
        arr[6] = '...'
        arr.splice(6, len, '...')
        arr.push(len)
      }
      this.pagesList = arr;
    },
    changeCurrPageSize(val) {
      this.currPageSize = val
      this.currIndex = 1
    }
  },
  mounted() {
    this.initPageList()
  },
  render(h) {
    return (
      <div class={[bem()]}>
        {
          this.showTotal === "" ? <p class={[bem('total')]}>共：{this.total}条</p> : null
        }
        {
          this.pageSizeDataList.length > 1 ? <span class={[bem('page-size')]}><i-select value={this.currPageSize} on-change={(val) => this.changeCurrPageSize(val)}>
            {
              this.pageSizeDataList.map((item, index) => {
                return <i-select-option label={`${item}条/页`} value={item}></i-select-option>
              })
            }
          </i-select></span> : null
        }
        <p class={{ 'action': true, 'disabled': this.currIndex === 1 }} onClick={() => this.checkCurrIndex('prev')}><i-icon type="icon-return"></i-icon></p>
        <ul class={[bem(this.background === "" ? 'list-full' : 'list')]}>
          {
            this.pagesList.map((item, index) => {
              return <li class={[bem(this.background === "" ? 'list-full' : 'list', { 'item': true, 'active': this.currIndex === item, 'hover': this.currIndex !== item })]}
                onClick={() => this.checkCurrIndex(item, index)}
              >
                {item}
              </li>
            })
          }
        </ul>
        <p class={{ 'action': true, 'disabled': this.currIndex === this.maxPage }} onClick={() => this.checkCurrIndex('next')}><i-icon type="icon-enter"></i-icon></p>
      </div>
    )
  },
});
