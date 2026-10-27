# Checkbox 复选框

### 介绍

用于开启独立选项或勾选记录，支持选中、半选、禁用、边框和 CheckboxGroup。

## API

### 属性

| 参数                 | 说明                       | 类型    | 默认值 |
| -------------------- | -------------------------- | ------- | ------ |
| modelValue / v-model | 是否勾选                   | boolean | false  |
| disabled             | 是否禁用                   | boolean | false  |
| indeterminate        | 是否显示半选，不改变模型值 | boolean | false  |
| value                | 分组中的选项值 | string / number / boolean | — |
| border               | 显示边框 | boolean | false |

### 事件

| 事件名            | 说明         | 回调参数         |
| ----------------- | ------------ | ---------------- |
| update:modelValue | 用户改变勾选 | checked: boolean |
| change            | 用户改变勾选 | checked: boolean |

## CheckboxGroup

使用 `CheckboxGroup` 管理数组值，可通过 `min`、`max` 限制最少和最多选项；子项通过 `value` 指定数组成员。

### 插槽

| 名称    | 说明     |
| ------- | -------- |
| default | 勾选标签 |

## 使用说明

v-model: boolean，默认 false。属性 disabled、indeterminate。默认插槽为标签；无可见标签时提供 aria-label。事件 update:modelValue(checked: boolean)、change(checked: boolean)，仅用户改变时触发，禁用时不触发。indeterminate 只影响视觉状态。支持键盘空格切换。
