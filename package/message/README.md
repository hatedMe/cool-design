# Message 消息反馈

声明式属性 type: 'success' | 'error'（默认 success）、message: string（必填，按文本渲染）、duration: number（默认 4000ms，0 表示不自动关闭）。

计时结束或关闭按钮触发 close，由父级通过 v-if 移除。卸载清理计时器，消息或时长改变重新计时。在 ConfigProvider 内声明以继承主题。首版不提供全局函数 API 或消息队列。
