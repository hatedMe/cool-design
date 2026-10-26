# Dialog 编辑弹窗

v-model: boolean 控制显示。属性 title: string、closeOnClickModal: boolean（默认 true）、closeOnPressEscape: boolean（默认 true）、closable: boolean（默认 true）。closable=false 阻止关闭按钮、遮罩、Esc 发出关闭请求，父级仍可主动改模型。

默认插槽为内容，footer 插槽放操作按钮。事件 update:modelValue(false) 请求关闭，由父级更新值。使用最近 ConfigProvider 的浮层宿主，没有配置容器时原地渲染。

支持模态焦点循环、Esc、关闭恢复触发元素焦点、滚动锁、多实例清理。校验时保持字段可聚焦，实际请求期间再禁用字段。保存中设置 closable=false。
