# Popconfirm 气泡确认

-   可选 `v-model`: 控制可见性；未传时内部管理。
-   `title`: 默认“确定执行此操作吗？”。
-   `placement`: top/bottom（默认）/left/right。
-   `confirmButtonText`、`cancelButtonText`: 默认“确定”“取消”。
-   `disabled`: 禁止打开。
-   默认插槽：放一个可聚焦的按钮触发元素。
-   `confirm()`、`cancel()`：确认/取消各只触发一次；外部点击、Esc 视为取消。

打开后聚焦取消按钮，Tab 在确认框内循环；按 Esc 或按钮完成操作后恢复触发按钮焦点。浮层定位与主题继承同 Tooltip。确认后立即请求关闭，异步操作的锁定与错误提示由调用者管理；需要确认框内失败重试时使用 MessageBox。
