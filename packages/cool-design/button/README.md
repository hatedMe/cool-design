# Button 按钮

### 介绍

按钮用于触发查询、保存、删除等操作，支持 Element Plus 常用的类型、外观、尺寸、禁用、加载和原生标签能力。

## 基础用法

通过 `type` 区分主要操作、成功操作、警告操作、危险操作和信息操作；默认类型为 `default`。完整交互示例见文档站的“代码演示”。

## API

### 属性

| 参数            | 说明                                                            | 类型    | 默认值       |
| --------------- | --------------------------------------------------------------- | ------- | ------------ |
| type            | 按钮类型：default / primary / success / warning / danger / info | string  | default      |
| size            | 尺寸：small / default / normal / large；normal 等同 default     | string  | 继承全局尺寸 |
| disabled        | 禁用按钮                                                        | boolean | false        |
| loading         | 加载状态，阻止点击                                              | boolean | false        |
| nativeType      | 原生类型：button / submit / reset                               | string  | button       |
| plain           | 朴素按钮                                                        | boolean | false        |
| text            | 文字按钮                                                        | boolean | false        |
| link            | 链接样式按钮                                                    | boolean | false        |
| round           | 圆角按钮                                                        | boolean | false        |
| circle          | 圆形按钮                                                        | boolean | false        |
| dashed          | 虚线边框按钮                                                    | boolean | false        |
| icon            | 内置图标类名，例如 `icon-search`                                | string  | —            |
| color           | 自定义按钮颜色                                                  | string  | —            |
| dark            | 暗色模式兼容标记                                                | boolean | false        |
| loadingIcon     | 加载状态图标类名                                                | string  | —            |
| tag             | 渲染标签：button / a / div                                      | string  | button       |
| autoInsertSpace | 两个中文字符之间自动插入空格                                    | boolean | false        |

### 事件

| 事件名 | 说明               | 回调参数          |
| ------ | ------------------ | ----------------- |
| click  | 可用状态下点击按钮 | event: MouseEvent |

### 插槽

| 名称    | 说明         |
| ------- | ------------ |
| default | 按钮内容     |
| loading | 加载状态内容 |
| icon    | 图标内容     |

## 使用说明

默认插槽为按钮内容，`loading` 插槽用于替换加载提示。属性：`type: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'`（默认 default）、`size?: 'small' | 'default' | 'normal' | 'large'`、`disabled`、`loading`、`nativeType: 'button' | 'submit' | 'reset'`（默认 button）。normal 暂映射 default。

事件 `click(event: MouseEvent)`；禁用、加载时不触发。form、aria-label、href 等原生属性透传。提交表单需显式 `native-type="submit"`；使用 `tag="a"` 时可以渲染链接。

## ButtonGroup 按钮组

`ButtonGroup` 将多个 Button 组合为水平或垂直的一组操作，并可统一设置 `type` 与 `size`。它支持 `direction="horizontal" | "vertical"`。
