# CheckboxButton 复选框按钮

### 介绍

用于按钮样式的复选项，支持独立使用，也可以放在 CheckboxGroup 中。

## API

### 属性

| 参数                 | 说明                       | 类型                         | 默认值 |
| -------------------- | -------------------------- | ---------------------------- | ------ |
| modelValue / v-model | 是否选中或绑定模型值       | string / number / boolean    | false  |
| value                | 分组中的选项值             | string / number / boolean / object | — |
| label                | 选项文本                   | string                       | —      |
| trueValue            | 选中时的模型值             | string / number / boolean    | true   |
| falseValue           | 未选中时的模型值           | string / number / boolean    | false  |
| disabled             | 是否禁用                   | boolean                      | false  |
| size                 | 尺寸：`small` / `default` / `large` | string | — |

### 事件

| 事件名            | 说明         | 回调参数             |
| ----------------- | ------------ | -------------------- |
| update:modelValue | 模型值变化   | value: string / number / boolean |
| change            | 用户改变选中 | value: string / number / boolean |

### 插槽

| 名称    | 说明     |
| ------- | -------- |
| default | 按钮文本 |

## 使用说明

CheckboxButton 可独立使用，也可作为 CheckboxGroup 的子项；在 Group 中使用 `value` 作为数组成员。
