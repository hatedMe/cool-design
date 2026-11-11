# Progress 进度条

### 组件介绍

Progress 用于展示操作进度，支持线形、环形和仪表盘三种样式，可自定义颜色、文本与条纹动画，对标 Element Plus Progress 的公开 API。

## 用法

```vue
<template>
  <Progress :percentage="50" />
  <Progress :percentage="100" status="success" />
  <Progress :percentage="70" type="circle" />
  <Progress :percentage="80" type="dashboard" />
  <Progress :percentage="60" :stroke-width="20" text-inside />
  <Progress :percentage="50" indeterminate striped striped-flow />
</template>

<script setup lang="ts">
import { Progress } from 'cool-design';
</script>
```

## API 说明

### 属性

| 参数              | 说明                                                    | 类型                    | 默认值           |
| ----------------- | ------------------------------------------------------- | ----------------------- | ---------------- |
| percentage        | 进度百分比，超出 `0-100` 会被截断                       | `number`                | `0`              |
| type              | 类型：`line` / `circle` / `dashboard`                   | `ProgressType`          | `line`           |
| stroke-width      | 进度条宽度（线形为高度，环形为描边宽度）                | `number`                | `6`              |
| stroke-linecap    | 环形描边端点形状：`butt` / `round` / `square`           | `ProgressStrokeLinecap` | `round`          |
| text-inside       | 进度文本是否内置于进度条（仅线形）                      | `boolean`               | `false`          |
| status            | 状态：`success` / `exception` / `warning`，影响默认颜色 | `ProgressStatus`        | —                |
| width             | 环形/仪表盘直径，单位 px                                | `number`                | `126`            |
| show-text         | 是否显示进度文本                                        | `boolean`               | `true`           |
| color             | 进度颜色，支持色值、函数或分段数组                      | `ProgressColor`         | —                |
| format            | 文本格式化函数                                          | `ProgressFormat`        | `(p) => p + '%'` |
| indeterminate     | 是否为不确定进度（动画）                                | `boolean`               | `false`          |
| duration          | 动画时长，单位秒                                        | `number`                | `3`              |
| striped           | 是否显示条纹                                            | `boolean`               | `false`          |
| striped-flow      | 条纹是否流动（动画）                                    | `boolean`               | `false`          |
| define-back-color | 轨道背景色                                              | `string`                | —                |
| text-color        | 进度文本颜色                                            | `string`                | —                |

`color` 为数组时按 `percentage` 升序匹配第一段满足 `percentage <= stop.percentage` 的颜色；函数签名为 `(percentage: number) => string`。

### 事件

无自定义事件（与 Element Plus 一致）。

### 插槽

| 名称    | 说明           | 参数                     |
| ------- | -------------- | ------------------------ |
| default | 自定义进度文本 | `{ percentage: number }` |

说明：`status` 仅影响颜色与状态类，不将文本替换为图标。
