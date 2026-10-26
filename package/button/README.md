# Button 按钮

### 介绍

按钮用于触发查询、保存、删除等操作，支持类型、尺寸、禁用和加载状态。

## API

### 属性

| 参数       | 说明                                                        | 类型    | 默认值       |
| ---------- | ----------------------------------------------------------- | ------- | ------------ |
| type       | 按钮类型：default / primary / success / warning / danger    | string  | default      |
| size       | 尺寸：small / default / normal / large；normal 等同 default | string  | 继承全局尺寸 |
| disabled   | 禁用按钮                                                    | boolean | false        |
| loading    | 加载状态，阻止点击                                          | boolean | false        |
| nativeType | 原生类型：button / submit / reset                           | string  | button       |

### 事件

| 事件名 | 说明               | 回调参数          |
| ------ | ------------------ | ----------------- |
| click  | 可用状态下点击按钮 | event: MouseEvent |

### 插槽

| 名称    | 说明     |
| ------- | -------- |
| default | 按钮内容 |

## 使用说明

默认插槽为按钮内容。属性：`type: 'default' | 'primary' | 'success' | 'warning' | 'danger'`（默认 default）、`size?: 'small' | 'default' | 'normal' | 'large'`、`disabled`、`loading`、`nativeType: 'button' | 'submit' | 'reset'`（默认 button）。normal 暂映射 default。

事件 `click(event: MouseEvent)`；禁用、加载时不触发。form、aria-label 等原生属性透传。提交表单需显式 `native-type="submit"`。
