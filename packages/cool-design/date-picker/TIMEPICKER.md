# TimePicker 时间选择器

## 介绍

TimePicker 用于选择一天中的时间，支持单时间和时间范围选择。

## 基础用法

```vue
<TimePicker v-model="time" placeholder="选择时间" />
```

未设置 `value-format` 时，绑定值为 `Date`；设置 `value-format` 后，绑定值为对应格式的字符串或时间戳。

## 时间范围

```vue
<TimePicker
  v-model="timeRange"
  is-range
  start-placeholder="开始时间"
  end-placeholder="结束时间"
  range-separator="-"
/>
```

范围清空后的值为 `[null, null]`。

## 格式化

```vue
<TimePicker v-model="time" format="HH:mm" value-format="HH:mm" />
```

格式支持常用的 `HH:mm` 和 `HH:mm:ss`。`format` 控制显示和面板粒度，`value-format` 控制绑定值格式。

## 禁用时间

```vue
<TimePicker
  v-model="time"
  :disabled-hours="() => [0, 1, 2]"
  :disabled-minutes="(hour) => hour === 9 ? [30] : []"
  :disabled-seconds="(hour, minute) => hour === 10 && minute === 20 ? [30] : []"
/>
```

禁用规则会同时作用于面板候选项和最终提交校验。

## API

### 属性

| 参数             | 说明                                                       | 类型                                   | 默认值       |
| ---------------- | ---------------------------------------------------------- | -------------------------------------- | ------------ |
| modelValue       | 绑定值                                                     | `string` / `number` / `Date` / `Date[]` / `null` | — |
| format           | 显示格式                                                   | `string`                               | `HH:mm:ss`   |
| value-format      | 绑定值格式，未设置时返回 `Date`                            | `string`                               | —            |
| placeholder      | 占位文本                                                   | `string`                               | —            |
| start-placeholder | 范围开始占位文本                                           | `string`                               | —            |
| end-placeholder  | 范围结束占位文本                                           | `string`                               | —            |
| is-range         | 是否为范围选择                                             | `boolean`                              | `false`      |
| range-separator  | 范围分隔符                                                 | `string`                               | `'-'`        |
| disabled         | 禁用                                                       | `boolean`                              | `false`      |
| readonly         | 只读                                                       | `boolean`                              | `false`      |
| editable         | 是否允许手动输入（面板仍可选择）                           | `boolean`                              | `true`       |
| clearable        | 是否可清空                                                 | `boolean`                              | `false`      |
| size             | 尺寸：`large` / `default` / `small`                        | `string`                               | 继承全局尺寸 |
| disabled-hours   | 禁用小时列表                                               | `() => number[]`                       | —            |
| disabled-minutes | 禁用分钟列表                                               | `(hour: number) => number[]`           | —            |
| disabled-seconds | 禁用秒列表                                                 | `(hour: number, minute: number) => number[]` | —      |
| arrow-control    | 面板方向键选择                                             | `boolean`                              | `false`      |
| show-confirm     | 草稿确认扩展，开启后需点击确认才提交                      | `boolean`                              | `false`      |
| save-on-blur     | 失焦时保存草稿                                             | `boolean`                              | `true`       |
| default-value    | 初始值                                                     | `string` / `number` / `Date`            | —            |
| empty-values     | 视为空的输入值                                             | `Array<string \| number>`             | —            |
| value-on-clear   | 清空时的回退值                                             | `string` / `number` / `null`            | —            |
| id               | 原生输入框 ID，范围模式可分别指定起止输入框                | `string` / `string[]`                  | —            |
| name             | 原生 input 名称                                            | `string`                               | —            |
| tabindex         | Tab 顺序                                                   | `string` / `number`                     | —            |
| aria-label       | 无障碍名称                                                 | `string`                               | —            |
| prefix-icon      | 前置图标                                                   | `string` / `Component`                 | —            |
| clear-icon       | 清空图标                                                   | `string` / `Component`                 | —            |
| teleported       | 弹层是否传送到 body                                        | `boolean`                              | `true`       |
| placement        | 弹层位置                                                   | `string`                               | `bottom-start` |
| popper-class     | 弹层自定义类名                                             | `string`                               | —            |
| popper-style     | 弹层自定义样式                                             | `string` / `CSSProperties`             | —            |
| popper-options   | 浮层参数覆盖                                               | `object`                               | —            |
| fallback-placements | 候选位置                                                | `string[]`                             | —            |

### 事件

| 事件名            | 说明           | 回调参数              |
| ----------------- | -------------- | --------------------- |
| update:modelValue | 绑定值变化     | `value`               |
| change            | 值确认变化     | `value`               |
| focus             | 聚焦           | `event: FocusEvent`   |
| blur              | 失焦           | `event: FocusEvent`   |
| clear             | 点击清空       | —                     |
| visible-change    | 弹层显隐变化   | `visible: boolean`    |

### 实例方法

| 方法                    | 说明                 |
| ----------------------- | -------------------- |
| `focus()`               | 聚焦输入框           |
| `blur()`                | 取消聚焦             |
| `handleOpen()`           | 手动打开面板         |
| `handleClose()`         | 手动关闭面板         |

## API 支持状态

已支持 `format`、`value-format`、`is-range`、`disabled-hours`、`disabled-minutes`、`disabled-seconds`、`arrow-control`、`show-confirm`（项目扩展）、`save-on-blur`、`empty-values`、`value-on-clear` 与基础浮层配置。部分支持完整时间 token、时间范围双面板与完整 ARIA。不支持 `TimeSelect` 的 `start` / `end` / `step` 等 API。
