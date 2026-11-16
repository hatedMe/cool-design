# Calendar 日历

### 介绍

月视图日历，支持日期选择、月份切换、范围展示、日期禁用和自定义单元格。

## 用法

```vue
<Calendar v-model="value" />
```

通过 `range` 展示固定周范围（须从周一到周日，且不超过两个月）：

```vue
<Calendar :range="[new Date(2026, 10, 2), new Date(2026, 10, 8)]" />
```

通过 `controller-type="select"` 使用年月选择器，通过 `formatter` 自定义选项文案。

```vue
<Calendar v-model="value">
  <template #date-cell="{ data }">
    <span>{{ data.day.split('-').slice(2).join('') }}</span>
  </template>
  <template #header="{ date }">
    <span>{{ date }}</span>
  </template>
</Calendar>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `model-value` / `v-model` | 选中日期 | `Date` | — |
| `range` | 固定范围 `[开始, 结束]`，须周一到周日且不超过两个月 | `[Date, Date]` | — |
| `controller-type` | 头部控制器：`button` / `select` | `string` | `button` |
| `formatter` | `select` 模式选项格式化 `(type, value) => string`，`type` 为 `year` / `month` | `Function` | — |
| `first-day-of-week` | 每周起始日 `0-6`（`0` 为周日） | `number` | `0` |
| `disabled-date` | 日期禁用函数 `(date: Date) => boolean` | `Function` | — |
| `highlight-current` | 是否高亮今天 | `boolean` | `true` |

### 事件

| 名称 | 说明 | 参数 |
| ---- | ---- | ---- |
| `update:modelValue` | 选中日期变化 | `Date` |
| `select` | 选择日期 | `Date` |
| `change` | 选中日期变化（兼容） | `Date` |
| `panel-change` | 面板月份变化 | `Date` |

### 插槽

| 名称 | 说明 | 参数 |
| ---- | ---- | ---- |
| `date-cell` | 自定义日期单元格 | `{ data: { day: string, date: Date, isSelected: boolean, type: 'prev-month' / 'current-month' / 'next-month' } }` |
| `date` | `date-cell` 别名（兼容旧 API） | 同上 |
| `header` | 自定义头部 | `{ date: string }`，月视图为 `YYYY-MM`，范围模式为 `YYYY-MM-DD ~ YYYY-MM-DD` |

### Expose

| 名称 | 说明 | 类型 |
| ---- | ---- | ---- |
| `selectedDay` | 当前选中日期 | `Date \| null` |
| `pickDay` | 选择指定日期 | `(day: Date) => void` |
| `selectDate` | 切换面板：`prev-month` / `next-month` / `prev-year` / `next-year` / `today` | `(type: string) => void` |
| `calculateValidatedDateRange` | 校验范围，合法返回 `[开始, 结束]`，否则返回 `[]` | `(start: Date, end: Date) => Date[]` |
