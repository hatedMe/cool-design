# Popconfirm 气泡确认

### 介绍

在触发按钮附近确认操作，适合停用、移除等简单确认场景。

## API

### 属性

| 参数                 | 说明                              | 类型            | 默认值             |
| -------------------- | --------------------------------- | --------------- | ------------------ |
| modelValue / v-model | 可选受控可见性，省略时内部管理    | boolean         | undefined          |
| title                | 确认问题                          | string          | 确定执行此操作吗？ |
| placement            | 方向：top / bottom / left / right | string          | bottom             |
| confirmButtonText    | 确认按钮文字                      | string          | 确定               |
| cancelButtonText     | 取消按钮文字                      | string          | 取消               |
| disabled             | 禁止打开确认框                    | boolean         | false              |
| confirmButtonType    | 确认按钮类型                      | string          | primary            |
| cancelButtonType     | 取消按钮类型                      | string          | default            |
| hideIcon             | 隐藏标题前图标                    | boolean         | false              |
| width                | 面板宽度                          | number / string | —                  |

### 事件

| 事件名            | 说明                 | 回调参数       |
| ----------------- | -------------------- | -------------- |
| update:modelValue | 可见性更新请求       | value: boolean |
| confirm           | 确认操作             | 无             |
| cancel            | 取消、外部点击或 Esc | 无             |

### 插槽

| 名称    | 说明               |
| ------- | ------------------ |
| default | 一个可聚焦触发按钮 |

## 使用说明

- 可选 `v-model`: 控制可见性；未传时内部管理。
- `title`: 默认“确定执行此操作吗？”。
- `placement`: top/bottom（默认）/left/right。
- `confirmButtonText`、`cancelButtonText`: 默认“确定”“取消”。
- `disabled`: 禁止打开。
- 默认插槽：放一个可聚焦的按钮触发元素。
- `confirm()`、`cancel()`：确认/取消各只触发一次；外部点击、Esc 视为取消。

打开后聚焦取消按钮，Tab 在确认框内循环；按 Esc 或按钮完成操作后恢复触发按钮焦点。浮层定位与主题继承同 Tooltip。确认后立即请求关闭，异步操作的锁定与错误提示由调用者管理；需要确认框内失败重试时使用 MessageBox。
