# SelectOption 选项

### 介绍

在 Select 中定义选项的值、显示文字和禁用状态。

## API

### 属性

| 参数     | 说明                         | 类型            | 默认值 |
| -------- | ---------------------------- | --------------- | ------ |
| value    | 选项值，必填，不可为空字符串 | string / number | —      |
| label    | 显示文字                     | string          | value  |
| disabled | 禁用当前选项                 | boolean         | false  |

### 插槽

| 名称    | 说明                   |
| ------- | ---------------------- |
| default | 选项文字，优先于 label |

## 使用说明

在 Select 内使用。属性 value: string | number（必填，不能为空字符串）、label?: string、disabled。默认插槽优先于 label，均省略时显示 value。不独立管理选中状态。
