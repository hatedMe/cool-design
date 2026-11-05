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

属性：`model-value`、`format`、`value-format`、`placeholder`、`start-placeholder`、`end-placeholder`、`range-separator`、`is-range`、`disabled`、`readonly`、`editable`、`clearable`、`size`、`disabled-hours`、`disabled-minutes`、`disabled-seconds`、`teleported`、`placement`、`popper-class`。

事件：`update:modelValue`、`change`、`focus`、`blur`、`clear`、`visible-change`。

方法：`focus()`、`blur()`、`handleOpen()`、`handleClose()`。

时间格式：`HH:mm` / `HH:mm:ss`。

本组件只对齐 TimePicker，不包含 TimeSelect 的 `start` / `end` / `step`，也不支持 Element UI 遗留的 `selectableRange`。
