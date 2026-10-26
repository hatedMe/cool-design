# Switch 开关

### 介绍

在开启与关闭两种状态之间切换，适合账号状态和功能设置。

## API

### 属性

| 参数                 | 说明     | 类型    | 默认值 |
| -------------------- | -------- | ------- | ------ |
| modelValue / v-model | 是否开启 | boolean | false  |
| disabled             | 是否禁用 | boolean | false  |

### 事件

| 事件名            | 说明         | 回调参数         |
| ----------------- | ------------ | ---------------- |
| update:modelValue | 用户改变开关 | checked: boolean |
| change            | 用户改变开关 | checked: boolean |

### 插槽

| 名称    | 说明     |
| ------- | -------- |
| default | 开关说明 |

## 使用说明

v-model: boolean，默认 false；属性 disabled。默认插槽为说明，原生 checkbox 使用 switch 角色。事件 update:modelValue(checked: boolean)、change(checked: boolean)；禁用时不触发。可用 aria-label 提供无文本时的名称。
