# Mention 提及

### 介绍

在输入框/文本域中输入触发符（默认 `@`）唤起候选列表，选中后插入提及内容。

## 基础用法

输入 `@` 打开候选下拉，继续输入可过滤（也可用 `filter-option` 自定义或设为 `false` 全量展示）；方向键移动、回车/Tab 选中，选中后插入 `触发符 + 值 + split`。`prefix` 支持多触发符（如 `['@', '#']`），`search` 事件携带 `(pattern, prefix)` 便于远程加载（配合 `loading`）。

```vue
<Mention v-model="text" :options="options" placeholder="输入 @ 提及某人" />
```

`type="textarea"` 切换文本域；`whole`（可配 `check-is-whole`）使退格整体删除提及；`label` 插槽自定义候选展示（作用域 `{ item }`）。

## API

### 属性

| 参数            | 说明                                       | 类型                                   | 默认值   |
| --------------- | ------------------------------------------ | -------------------------------------- | -------- |
| `modelValue`    | 输入值（`v-model`）                        | `string`                               | `''`     |
| `options`       | 候选列表                                   | `MentionOption[]`                      | `[]`     |
| `props`         | 字段映射（`value` / `label` / `disabled`） | `MentionOptionProps`                   | —        |
| `prefix`        | 触发符（单字符，支持数组）                 | `string` / `string[]`                  | `'@'`    |
| `split`         | 提及后的分隔字符                           | `string`                               | `' '`    |
| `filterOption`  | 过滤逻辑，`false` 全量展示，缺省按文本包含过滤 | `boolean` / `(pattern, option) => boolean` | `true` |
| `placement`     | 下拉位置                                   | `string`                               | `bottom` |
| `offset`        | 下拉偏移                                   | `number`                               | `0`      |
| `showArrow`     | 下拉朝输入框一侧显示小箭头，建议配合 `offset ≥ 8` 使用 | `boolean`                  | `false`  |
| `teleported`    | 下拉是否传送到 body                        | `boolean`                              | `true`   |
| `persistent`    | 关闭后是否保留下拉节点                     | `boolean`                              | `false`  |
| `fallbackPlacements` | 主位置放不下时的候选位置            | `Placement[]`                          | `['top', 'bottom']` |
| `popperOptions` | 浮层参数覆盖（`offset` / `placement`）     | `{ offset?: number; placement?: Placement }` | — |
| `effect`        | 下拉主题：`light` / `dark`                 | `string`                               | `light`  |
| `whole`         | 退格整体删除提及                           | `boolean`                              | `false`  |
| `checkIsWhole`  | 自定义整体判定                             | `(pattern, prefix) => boolean`         | —        |
| `loading`       | 下拉加载态                                 | `boolean`                              | `false`  |
| `popperClass` / `popperStyle` | 下拉自定义类名/样式           | `string` / `object`                    | —        |
| `type`          | 输入形态：`text` / `textarea`              | `string`                               | `text`   |
| `rows`          | 文本域行数                                 | `number`                               | `3`      |
| `placeholder` / `disabled` / `clearable` / `size` | 同常用输入控件        | —                                      | —        |
| `validateEvent` | 值变化时触发表单校验                       | `boolean`                              | `true`   |

`MentionOption`：`{ value?: string; label?: string; disabled?: boolean; [key: string]: unknown }`。

### 事件

| 事件名              | 说明                     | 回调参数                       |
| ------------------- | ------------------------ | ------------------------------ |
| `update:modelValue` | 输入值变化               | `value: string`                |
| `change`            | 输入值变化               | `value: string`                |
| `input`             | 输入内容变化             | `value: string`                |
| `search`            | 触发符命中/继续输入       | `pattern: string, prefix: string` |
| `select`            | 选中候选                 | `option: MentionOption`        |
| `whole-remove`      | 整体删除提及             | `pattern: string`              |
| `focus` / `blur`    | 聚焦 / 失焦              | `event: FocusEvent`            |
| `clear`             | 点击清空                 | —                              |

### 插槽

| 名称      | 说明                                     |
| --------- | ---------------------------------------- |
| `label`   | 自定义候选内容，作用域 `{ item }`        |
| `loading` | 自定义加载态内容                         |
| `header`  | 下拉顶部内容                             |
| `footer`  | 下拉底部内容                             |

### 实例方法

| 名称              | 说明                     |
| ----------------- | ------------------------ |
| `input`           | 输入元素引用             |
| `dropdownVisible` | 下拉是否展开             |
