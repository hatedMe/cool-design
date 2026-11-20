# TimeSelect 时间选择

### 介绍

在固定时间点列表中选择时间，选项由 `start` / `step` / `end` 生成，适合预约、定时发布等场景。

## 基础用法

```vue
<TimeSelect v-model="time" start="09:00" step="00:30" end="18:00" />
```

## API

### 属性

| 参数            | 说明                                       | 类型      | 默认值   |
| --------------- | ------------------------------------------ | --------- | -------- |
| `modelValue`    | 选中时间（`v-model`），格式由 `format` 决定        | `string \| number \| boolean \| null`  | —        |
| `start`         | 开始时间                                   | `string`  | `09:00`  |
| `step`          | 时间间隔                                   | `string`  | `00:30`  |
| `end`           | 结束时间                                   | `string`  | `18:00`  |
| `editable` | 是否允许键入并筛选选项 | `boolean` | `true` |
| `format` | Day.js 时间格式，用于显示和模型值 | `string` | `'HH:mm'` |
| `includeEndTime` | 结束时间未落在步长网格上时，是否追加它 | `boolean` | `false` |
| `prefixIcon` | 输入框前置图标 | `string \| Component` | `'icon-clock'` |
| `clearIcon` | 清空按钮图标 | `string \| Component` | `'icon-close'` |
| `minTime`       | 最早可选时间，等于或早于该时间的选项禁用             | `string`  | —        |
| `maxTime`       | 最晚可选时间，等于或晚于该时间的选项禁用             | `string`  | —        |
| `placeholder`   | 占位文本                                   | `string`  | `请选择` |
| `disabled`      | 是否禁用                                   | `boolean` | `false`  |
| `emptyValues` | 视为空的模型值 | `unknown[]` | 继承 ConfigProvider |
| `valueOnClear` | 清空值或工厂 | `string \| number \| boolean \| null \| (() => unknown)` | 继承 ConfigProvider，根级 `undefined` |
| `clearable`     | 是否可清空             | `boolean` | `true`   |
| `size`          | 尺寸：`small` / `default` / `large`        | `string`  | 继承 FormItem、Form 或 ConfigProvider |
| `name`          | 原生表单提交字段名，提交所选值                        | `string`  | —        |
| `validateEvent` | 值变化时触发表单校验                       | `boolean` | `true`   |
| `teleported`    | 下拉面板是否传送到 body                    | `boolean` | `true`   |
| `persistent`    | 关闭后是否保留面板节点                      | `boolean` | `false`  |
| `placement`     | 面板位置及 `-start` / `-end` 变体          | `string`  | `bottom-start` |
| `fallbackPlacements` | 主位置放不下时的候选位置              | `Placement[]` | `['top-start', 'bottom', 'top']` |
| `popperOptions` | 浮层参数覆盖（`offset` / `placement`）     | `{ offset?: number; placement?: Placement }` | — |
| `popperClass`   | 面板自定义 class                           | `string` / `string[]` / `object` | — |
| `popperStyle`   | 面板自定义样式                             | `string` / `CSSProperties` | — |
| `effect`        | 面板主题：`light` / `dark`                 | `string`  | `light`  |

### 事件

| 事件名              | 说明               | 回调参数           |
| ------------------- | ------------------ | ------------------ |
| `update:modelValue` | 选中或清空         | `value: string \| number \| boolean \| null \| undefined`    |
| `change`            | 选中或清空         | `value: string \| number \| boolean \| null \| undefined`    |
| `focus` / `blur`    | 聚焦 / 失焦        | `event: FocusEvent` |
| `clear`             | 点击清空           | —                  |
| `visible-change`    | 下拉展开或收起     | `visible: boolean` |

### 实例方法

| 方法      | 说明         |
| --------- | ------------ |
| `focus()` | 聚焦触发器   |
| `blur()`  | 取消聚焦     |

### 插槽

组件使用属性配置图标和选项。

## 使用说明

开始、结束、间隔和禁用边界均使用 `HH:mm`。例如 `format="hh:mm A"` 时，选中下午一点会更新模型并提交本地化文本（中文为 `01:00 下午`，英文为 `01:00 PM`）。使用方向键浏览可选项，按 Enter 确认，按 Escape 取消筛选。

本组件即固定时间点的 TimeSelect，动态时间范围请使用 TimePicker（`disabled-hours` 等）。

`empty-values` 自定义未选中时的模型值，`value-on-clear` 接受清空值或函数。两者均继承 ConfigProvider。单选默认清空为 `undefined`。依赖原空字符串的页面可设置 `value-on-clear=""`。清空只执行一次工厂，`clear` 无参数。
