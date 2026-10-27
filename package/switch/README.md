# Switch 开关

### 介绍

在开启与关闭两种状态之间切换，适合账号状态和功能设置。

## 基础用法

`v-model` 默认使用 Boolean，也支持通过 `activeValue` 和 `inactiveValue` 使用自定义值。

## 尺寸与文字

支持 `small`、`default`、`large`，并可用 `activeText`、`inactiveText` 显示状态说明。

## 异步变更

`beforeChange` 可返回 Boolean 或 Promise；返回 false 或拒绝时保持原值。

## API

### 属性

| 参数                 | 说明     | 类型    | 默认值 |
| -------------------- | -------- | ------- | ------ |
| modelValue / v-model | 是否开启 | boolean | false  |
| disabled             | 是否禁用 | boolean | false  |
| loading              | 加载中并阻止操作 | boolean | false |
| size                 | small / default / large | string | default |
| activeValue / inactiveValue | 开启/关闭时的模型值 | boolean / string / number | true / false |
| activeText / inactiveText | 状态文字 | string | — |
| inlinePrompt         | 在轨道内显示文字 | boolean | false |
| activeColor / inactiveColor | 开启/关闭颜色 | string | — |
| beforeChange         | 变更前守卫 | `() => boolean \| Promise<boolean>` | — |

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
