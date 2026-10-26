# Dialog 对话框

### 介绍

通过桌面模态窗口展示编辑表单或其他内容，提供页脚操作区与焦点管理。

## API

### 属性

| 参数                 | 说明                             | 类型    | 默认值 |
| -------------------- | -------------------------------- | ------- | ------ |
| modelValue / v-model | 是否显示                         | boolean | false  |
| title                | 弹窗标题                         | string  | 对话框 |
| closeOnClickModal    | 点击遮罩请求关闭                 | boolean | true   |
| closeOnPressEscape   | 按 Esc 请求关闭                  | boolean | true   |
| closable             | 允许关闭按钮、遮罩、Esc 请求关闭 | boolean | true   |

### 事件

| 事件名            | 说明                   | 回调参数     |
| ----------------- | ---------------------- | ------------ |
| update:modelValue | 请求关闭，父级更新模型 | value: false |

### 插槽

| 名称    | 说明       |
| ------- | ---------- |
| default | 窗口内容   |
| footer  | 底部操作区 |

## 使用说明

v-model: boolean 控制显示。属性 title: string、closeOnClickModal: boolean（默认 true）、closeOnPressEscape: boolean（默认 true）、closable: boolean（默认 true）。closable=false 阻止关闭按钮、遮罩、Esc 发出关闭请求，父级仍可主动改模型。

默认插槽为内容，footer 插槽放操作按钮。事件 update:modelValue(false) 请求关闭，由父级更新值。使用最近 ConfigProvider 的浮层宿主，没有配置容器时原地渲染。

支持模态焦点循环、Esc、关闭恢复触发元素焦点、滚动锁、多实例清理。校验时保持字段可聚焦，实际请求期间再禁用字段。保存中设置 closable=false。
