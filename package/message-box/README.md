# MessageBox 消息确认框

复用 Dialog 的主题宿主、焦点管理、滚动锁与层级能力。

-   `v-model`: 是否显示。
-   `title`: 默认“操作确认”。
-   `message`: 纯文本，可用默认插槽覆盖。
-   `confirmButtonText`、`cancelButtonText`: 默认“确定”“取消”。
-   `beforeConfirm(): void | boolean | Promise<void | boolean>`: 确认前执行；false 保持窗口，抛出或拒绝 Error 显示错误并允许重试。
-   `confirm()`、`cancel()`、`update:modelValue`：完成操作与关闭请求。

等待 beforeConfirm 时禁止重复确认、取消与 Esc 关闭。点击遮罩不关闭；普通状态下 Esc、关闭按钮和取消按钮均取消。关闭或卸载后旧异步结果不再触发事件。

```ts
import { MessageBox, useMessageBox } from "cool-design";
// 在 setup 中调用，继承 ConfigProvider 配置；作用域销毁时清理未完成弹窗。
const box = useMessageBox();
const action = await box.confirm("确定删除吗？", "删除确认", {
    beforeConfirm: () => api.deleteUser(id)
});
// action 为 'confirm' 或 'cancel'；取消正常 resolve，不需要 catch。
// setup 外独立调用使用默认浅色配置：
await MessageBox.confirm("确定继续吗？");
```

组合式调用需位于 ConfigProvider 的后代 setup 内；在渲染 ConfigProvider 的同一组件 setup 调用无法继承它。各实例独立卸载。本期不提供输入框、HTML 字符串或全局 $confirm 注入。
