# Notification 通知

源码已修复，尚未加入首版公开入口。

默认导出为函数：`notify({ title, message, type, size, onClick, onClose })`，返回 `{ close() }`；通过 app.use 安装后提供 `$notify`。

- `type`：`primary | success | warning | danger | info`，默认 warning。
- `size`：`large | normal | small`，默认 normal。
- `title`、`message` 按纯文本渲染。
- 关闭按钮和返回的 close 都会卸载实例；重复关闭只回调一次。

内部 Notification 组件提供默认内容插槽及 click/close 事件。尚未实现通知队列、多实例错位、自动消失及 ConfigProvider 浮层主题继承；当前多个通知会位置重叠。
