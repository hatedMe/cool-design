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

## API

### 属性

| 参数                | 说明                                     | 类型                                   | 默认值         |
| ------------------- | ---------------------------------------- | -------------------------------------- | -------------- |
| modelValue          | 绑定值                                   | `string` / `number` / `Date` / `Date[]` / `null` | —     |
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
| clearable           | 是否可清空                               | `boolean`                              | `false`        |
| size                | 尺寸：`large` / `default` / `small`      | `string`                               | 继承全局尺寸   |
| disabled-hours       | 禁用小时列表                             | `() => number[]`                       | —              |
| disabled-minutes    | 禁用分钟列表                             | `(hour: number) => number[]`           | —              |
| disabled-seconds    | 禁用秒列表                               | `(hour: number, minute: number) => number[]` | —         |
| arrow-control       | 面板方向键选择                           | `boolean`                              | `false`        |
| show-confirm        | 草稿确认扩展                             | `boolean`                              | `false`        |
| save-on-blur        | 失焦时保存草稿                           | `boolean`                              | `true`         |
| default-value       | 初始值                                   | `string` / `number` / `Date`           | —              |
| empty-values        | 视为空的输入值                           | `Array<string \| number>`             | —              |
| value-on-clear      | 清空时的回退值                           | `string` / `number` / `null`           | —              |
| name                | 原生名称                                 | `string`                               | —              |
| tabindex            | Tab 顺序                                 | `string` / `number`                    | —              |
| aria-label          | 无障碍名称                               | `string`                               | —              |
| prefix-icon         | 前置图标                                 | `string` / `Component`                 | —              |
| clear-icon          | 清空图标                                 | `string` / `Component`                 | —              |
| teleported          | 弹层是否传送到 body                      | `boolean`                              | `true`         |
| placement           | 弹层位置                                 | `string`                               | `bottom-start` |
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
