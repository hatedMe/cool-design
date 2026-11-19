# Calendar 日历

### 介绍

以月视图展示日期并支持选择、切换月份和日期禁用；`range` 模式下起始月与下一月双月并排渲染。

## 用法

```vue
<Calendar v-model="date" />
```

可通过 `#date-cell` 插槽自定义日期单元格，`#header` 自定义头部。

## API

### 属性

| 参数              | 说明                                                 | 类型                                   | 默认值    |
| ----------------- | ---------------------------------------------------- | -------------------------------------- | --------- |
| modelValue        | 选中日期                                             | `string` / `number` / `Date` / `null`  | —         |
| range             | 展示范围：`[开始, 结束]`，周一始周日止且不超过两个月 | `[Date, Date]`                          | —         |
| controller-type   | 头部形态：`button` / `select`                        | `string`                               | `button`  |
| formatter         | 头部年月文案自定义                                   | `(type: 'year' \| 'month', value: number) => string` | — |
| first-day-of-week | 周起始日，`0` 为周日                                 | `number`                               | `0`       |
| disabled-date     | 禁用日期                                             | `(date: Date) => boolean`              | —         |
| highlight-current | 高亮今天                                             | `boolean`                              | `false`   |

### 事件

| 事件名            | 说明             | 回调参数    |
| ----------------- | ---------------- | ----------- |
| update:modelValue | 选中日期变化     | `date`      |
| input             | 选中日期变化     | `date`      |
| select            | 点击选择日期     | `date`      |
| change            | 选中日期变化     | `date`      |
| panel-change      | 面板年月切换     | `date: Date` |

### 插槽

| 名称       | 说明                 | 作用域             |
| ---------- | -------------------- | ------------------ |
| date-cell  | 自定义日期单元格     | `{ data, date }`   |
| date       | `date-cell` 兼容别名 | `{ data, date }`   |
| header     | 自定义头部           | `{ date }`         |

### 实例方法

| 名称                        | 说明                         |
| --------------------------- | ---------------------------- |
| `selectedDay`               | 当前选中日期（响应式）       |
| `pickDay(date)`             | 编程式选择日期               |
| `selectDate(type)`          | 切换：`prev-month` / `next-month` / `prev-year` / `next-year` / `today` |
| `calculateValidatedDateRange(a, b)` | 校验范围合法性       |
