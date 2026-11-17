# InputTag 标签输入框

### 介绍

以标签形式录入内容：回车（或自定义按键、分隔符）把输入框内容收为标签，支持删除、拖拽排序、折叠与清空（对齐 Element Plus 2.9）。

## 基础用法

`v-model` 绑定标签数组，输入后按 `trigger` 指定的按键（默认 `Enter`）收为标签；退格可删除末尾标签。

```vue
<InputTag v-model="tags" placeholder="输入后回车" />
```

`trigger` 支持 `Enter` / `Space`；`delimiter` 传字符串或正则，匹配到分隔符即收为标签；`max` 限制标签数量；`draggable` 拖拽排序；`collapse-tags` 折叠展示（`max-collapse-tags` 控制展示个数、`collapse-tags-tooltip` 悬浮提示全部）；`save-on-blur` 失焦时保存输入。

## API

### 属性

| 参数                  | 说明                                       | 类型                  | 默认值   |
| --------------------- | ------------------------------------------ | --------------------- | -------- |
| `modelValue`          | 标签数组（`v-model`）                      | `string[]`            | —        |
| `max`                 | 可添加的最大标签数                         | `number`              | —        |
| `tagType`             | 标签类型：`primary` / `success` / `info` / `warning` / `danger` | `string` | `info` |
| `tagEffect`           | 标签效果：`light` / `dark` / `plain`       | `string`              | `light`  |
| `trigger`             | 收为标签的按键：`Enter` / `Space`          | `string`              | `Enter`  |
| `delimiter`           | 分隔符（字符串或正则），匹配即收为标签     | `string` / `RegExp`   | —        |
| `draggable`           | 标签可拖拽排序                             | `boolean`             | `false`  |
| `size`                | 尺寸：`small` / `default` / `large`        | `string`              | 继承全局尺寸 |
| `collapseTags`        | 折叠标签                                   | `boolean`             | `false`  |
| `collapseTagsTooltip` | 折叠文本悬浮显示全部标签                   | `boolean`             | `false`  |
| `maxCollapseTags`     | 折叠时展示的标签数                         | `number`              | `1`      |
| `saveOnBlur`          | 失焦时保存输入内容为标签                   | `boolean`             | `true`   |
| `clearable`           | 显示清空按钮                               | `boolean`             | `false`  |
| `clearIcon`           | 自定义清空图标                             | `string` / `Component` | —       |
| `disabled`            | 禁用                                       | `boolean`             | `false`  |
| `validateEvent`       | 值变化时触发表单校验                       | `boolean`             | `true`   |
| `readonly`            | 只读                                       | `boolean`             | `false`  |
| `autofocus`           | 自动聚焦                                   | `boolean`             | `false`  |
| `id` / `tabindex` / `maxlength` / `minlength` / `placeholder` / `autocomplete` | 同原生 input | — | `autocomplete` 默认 `off` |

### 事件

| 事件名              | 说明                     | 回调参数              |
| ------------------- | ------------------------ | --------------------- |
| `update:modelValue` | 标签数组变化             | `values: string[]`    |
| `change`            | 标签数组变化             | `values: string[]`    |
| `input`             | 输入框内容变化           | `value: string`       |
| `add-tag`           | 新增标签                 | `value: string`       |
| `remove-tag`        | 移除标签                 | `value: string`       |
| `drag-tag`          | 拖拽移动标签             | `value: string`       |
| `focus` / `blur`    | 聚焦 / 失焦              | `event: FocusEvent`   |
| `clear`             | 点击清空                 | —                     |

### 插槽

| 名称      | 说明                                     |
| --------- | ---------------------------------------- |
| `tag`     | 自定义标签内容，作用域 `{ value }`       |
| `prefix`  | 输入区前置内容                           |
| `suffix`  | 输入区后置内容                           |

### 实例方法

| 方法      | 说明         |
| --------- | ------------ |
| `focus()` | 聚焦输入框   |
| `blur()`  | 取消聚焦     |
