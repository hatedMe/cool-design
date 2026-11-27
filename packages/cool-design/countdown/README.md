# Countdown 倒计时

### 介绍

以指定格式展示倒计时，结束时触发 `finish` 事件。常用于秒杀、验证码冷却、活动截止等场景。

## 基础用法

`value` 传目标时间（毫秒时间戳或 `Date`），`format` 控制展示格式（`DD` 天、`HH` 时、`mm` 分、`ss` 秒、`SSS` 毫秒）。

```vue
<Countdown :value="deadline" format="HH:mm:ss" @finish="onFinish" />
```

## API

### 属性

| 参数         | 说明                                       | 类型                   | 默认值     |
| ------------ | ------------------------------------------ | ---------------------- | ---------- |
| `value`      | 目标时间：毫秒时间戳或 `Date`              | `number` / `Date`      | —          |
| `format`     | 展示格式：`DD` / `HH` / `mm` / `ss` / `SSS` | `string`               | `HH:mm:ss` |
| `precision`  | 秒的小数位数（0～3）                       | `number`               | `0`        |
| `title`      | 标题                                       | `string`               | `''`       |
| `prefix`     | 内容前缀                                   | `string`               | `''`       |
| `suffix`     | 内容后缀                                   | `string`               | `''`       |
| `value-style` | 内容区样式                                 | `string` / `object`    | —          |

### 事件

| 事件名   | 说明                         | 回调参数                  |
| -------- | ---------------------------- | ------------------------- |
| `change` | 每次刷新时触发               | `remaining: number`（ms） |
| `finish` | 倒计时结束时触发（仅一次）   | —                         |

### 插槽

| 名称      | 说明                                       |
| --------- | ------------------------------------------ |
| `default` | 自定义内容，作用域 `{ value, text }`       |
| `title`   | 自定义标题                                 |
| `prefix`  | 自定义前缀                                 |
| `suffix`  | 自定义后缀                                 |
