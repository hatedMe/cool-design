# TimePicker 时间选择器

## 介绍

TimePicker 用于选择时间，支持单值、时间范围、格式化、清空和禁用时间规则。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { TimePicker } from 'cool-design';

const time = ref(null);
</script>

<template>
  <TimePicker v-model="time" clearable placeholder="选择时间" />
</template>
```

## 时间范围

```vue
<TimePicker v-model="range" is-range range-separator="-" />
```

范围默认返回两个 `Date` 值。设置 `value-format` 后按端点格式化，启用 `show-confirm` 时在确认后提交两个端点。

`DateModelValue` 为 `string` / `number` / `Date` / `null` 或由这些值组成的数组。

## API

### 属性

| 参数                | 说明                                     | 类型                                   | 默认值         |
| ------------------- | ---------------------------------------- | -------------------------------------- | -------------- |
| model-value | 绑定值，布尔值按空值处理 | `DateModelValue \| boolean` | `null` |
| format              | 显示格式：`HH:mm` / `HH:mm:ss`           | `string`                               | `HH:mm:ss`     |
| value-format         | 绑定值格式，未设置时返回 `Date`          | `string`                               | —              |
| placeholder         | 占位文本                                 | `string`                               | —              |
| start-placeholder   | 范围开始占位                             | `string`                               | —              |
| end-placeholder     | 范围结束占位                             | `string`                               | —              |
| range-separator     | 范围分隔符                               | `string`                               | `'-'`          |
| is-range            | 是否为范围选择                           | `boolean`                              | `false`        |
| disabled            | 禁用                                     | `boolean`                              | `false`        |
| readonly            | 只读                                     | `boolean`                              | `false`        |
| editable            | 是否允许手动输入                         | `boolean`                              | `true`         |
| clearable           | 是否可清空                               | `boolean`                              | `true` |
| size                | 尺寸：`large` / `default` / `small`      | `string`                               | 继承 FormItem、Form 或 ConfigProvider   |
| disabled-hours       | 禁用小时列表                             | `() => number[]`                       | —              |
| disabled-minutes    | 禁用分钟列表                             | `(hour: number) => number[]`           | —              |
| disabled-seconds    | 禁用秒列表                               | `(hour: number, minute: number) => number[]` | —         |
| arrow-control       | 面板方向键选择                           | `boolean`                              | `false`        |
| show-confirm        | 草稿确认扩展                             | `boolean`                              | `false`        |
| save-on-blur        | 失焦时保存草稿                           | `boolean`                              | `true`         |
| default-value | 无选中值时面板的初始时间 | `DateModelValue` | `null` |
| empty-values | 视为空的模型值 | `unknown[]` | 继承 ConfigProvider |
| value-on-clear | 清空时的回退值 | `DateModelValue \| boolean \| (() => unknown)` | 继承 ConfigProvider |
| id | 原生输入元素 ID，范围模式可指定两个 | `string \| string[]` | — |
| validate-event | 值变化时触发表单校验 | `boolean` | `true` |
| name                | 原生名称                                 | `string`                               | —              |
| tabindex            | Tab 顺序                                 | `string` / `number`                    | —              |
| aria-label          | 无障碍名称                               | `string`                               | —              |
| prefix-icon         | 前置图标                                 | `string` / `Component`                 | —              |
| clear-icon          | 清空图标                                 | `string` / `Component`                 | —              |
| teleported          | 弹层是否传送到 body                      | `boolean`                              | `true`         |
| placement           | 弹层位置                                 | `string`                               | `bottom` |
| popper-class        | 弹层自定义类名                           | `string`                               | —              |
| popper-style        | 弹层自定义样式                           | `string` / `CSSProperties`             | —              |
| popper-options      | 浮层参数覆盖                             | `object`                               | —              |
| fallback-placements | 候选位置                                 | `string[]`                             | —              |

### 事件

| 事件名            | 说明           | 回调参数            |
| ----------------- | -------------- | ------------------- |
| update:modelValue | 绑定值变化     | `value`             |
| change            | 值确认变化     | `value`             |
| focus             | 聚焦           | `event: FocusEvent` |
| blur              | 失焦           | `event: FocusEvent` |
| clear             | 点击清空       | —                   |
| visible-change    | 弹层显隐变化   | `visible: boolean`  |

### 实例方法

| 方法              | 说明         |
| ----------------- | ------------ |
| `focus()`         | 聚焦输入框   |
| `blur()`          | 取消聚焦     |
| `handleOpen()`     | 手动打开面板 |
| `handleClose()`    | 手动关闭面板 |

本组件不包含 TimeSelect 的 `start` / `end` / `step` API，也不支持 `selectableRange`。

`empty-values` 和 `value-on-clear` 继承 ConfigProvider。单值和范围默认清空为 `null`，工厂每次清空调用一次。需要保留旧的范围清空值时，显式传入 `:value-on-clear="[null, null]"`。设置 `is-range` 后，清空仍保留两个输入框。

### 插槽

当前共享 TimePicker 实现未消费自定义插槽；请使用 `prefix-icon` / `clear-icon` 配置图标。尚不支持原版自定义插槽协议，不应将 DatePicker 的插槽列表直接视为本组件能力。
