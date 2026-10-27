import { defineComponent } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("cascader");

// 占位组件：尚未实现级联数据、选择交互及模型绑定，不进入公开入口。
export default defineComponent({
  name,
  setup(_, { slots }) {
    return () => <div class={bem()}>{slots.default?.()}</div>;
  }
});
