# Input 输入框

### 介绍

用于输入文本，支持单行输入、密码、文本域、双向绑定、清空、只读和表单校验。

## 基础用法

使用 `v-model` 绑定字符串。

## 禁用状态

通过 `disabled` 禁止编辑和清空；`readonly` 只读但保留内容展示。

## 一键清空

设置 `clearable` 显示清空按钮。

## 密码输入

设置 `type="password"` 和 `show-password` 显示密码切换按钮。

## 文本域

设置 `type="textarea"`，并用 `rows` 控制初始行数。

## 格式化与自适应高度

`formatter` 控制输入框展示内容，`parser` 将展示内容转换回 `v-model`；文本域设置 `autosize` 或 `{ minRows, maxRows }` 自动调整高度。

## 图标与插槽

支持 `prefix-icon`、`suffix-icon` 以及 `prefix`、`suffix` 插槽；同时支持 `prepend`、`append` 外置内容和 `password-icon` 密码图标插槽。

`password-icon` 插槽参数为 `{ visible: boolean }`。

## 尺寸

支持 `small`、`default`、`large`，未设置时继承 ConfigProvider。

## API

### 属性

| 参数                    | 说明                                     | 类型                      | 默认值       |
| ----------------------- | ---------------------------------------- | ------------------------- | ------------ |
| modelValue / v-model    | 输入内容                                 | `string` / `number`       | `''`         |
| `id`                    | 原生 `input` 或 `textarea` 的 ID。省略或传入空字符串时使用表单项生成的 ID（若有） | `string` | — |
| placeholder             | 占位提示                                 | `string`                  | —            |
| clearable               | 允许清空                                 | `boolean`                 | `false`      |
| disabled                | 禁止输入和清空                           | `boolean`                 | `false`      |
| readonly                | 只读，禁止清空                           | `boolean`                 | `false`      |
| size                    | 尺寸：`small` / `default` / `large`      | `string`                  | 继承 FormItem、Form 或 ConfigProvider |
| type                    | `text` / `password` / `textarea` / `search` | `string`               | `text`       |
| rows                    | 文本域行数                               | `number`                  | `2`          |
| maxlength / minlength   | 原生长度限制                             | `string` / `number`       | —            |
| showWordLimit           | 显示长度统计                             | `boolean`                 | `false`      |
| wordLimitPosition       | 长度统计位置：`inside` / `outside`       | `string`                  | `inside`     |
| showPassword            | 显示密码切换                             | `boolean`                 | `false`      |
| loading                 | 加载态，后缀显示旋转图标                 | `boolean`                 | `false`      |
| loadingIcon             | 自定义加载图标（字体类名或组件），缺省为内置旋转描边 | `string` / `Component` | — |
| prefixIcon / suffixIcon | 图标（字体类名或组件）                   | `string` / `Component`    | —            |
| clearIcon               | 清空图标（字体类名或组件）               | `string` / `Component`    | —            |
| inputStyle              | 输入框内联样式                           | `string` / `object`       | —            |
| countGraphemes          | 字数统计函数，默认按字符计数             | `(value: string) => number` | —          |
| formatter               | 展示值格式化函数                         | `(value: string) => string` | —          |
| parser                  | 输入值解析函数                           | `(value: string) => string` | —          |
| autosize                | 文本域自适应高度，可配置 `minRows`/`maxRows` | `boolean` / `object`   | `false`      |
| resize                  | 文本域调整方向：`none` / `both` / `horizontal` / `vertical` | `string` | —     |
| validateEvent           | 是否触发表单校验                         | `boolean`                 | `true`       |

### 事件

| 事件名            | 说明               | 回调参数          |
| ----------------- | ------------------ | ----------------- |
| `update:modelValue` | 输入或清空 | `value: string \| number` |
| `change` | 原生 `change` 或清空，清空只传空字符串 | `value: string \| number, event?: Event` |
| blur              | 输入框失焦         | `event: FocusEvent` |
| `input` | 输入内容变化 | `value: string \| number` |
| focus             | 输入框聚焦         | `event: FocusEvent` |
| clear             | 点击清空           | —                 |
| keydown           | 键盘按下           | `event: KeyboardEvent` |
| mouseenter        | 鼠标移入           | `event: MouseEvent` |
| mouseleave        | 鼠标移出           | `event: MouseEvent` |
| compositionstart / compositionupdate / compositionend | 输入法组字过程 | `event: CompositionEvent` |

### 插槽

| 插槽          | 说明 |
| ------------- | ---- |
| prefix        | 输入内容前的内容 |
| suffix        | 输入内容后的内容 |
| prepend       | 输入框外部前置内容 |
| append        | 输入框外部后置内容 |
| password-icon | 密码切换图标，参数 `{ visible: boolean }` |

### 实例方法

| 方法    | 说明       | 返回值 |
| ------- | ---------- | ------ |
| `focus()`  | 聚焦输入框 | `void` |
| `blur()`   | 取消聚焦   | `void` |
| `select()` | 选择输入内容 | `void` |
| `resizeTextarea()` | 重新测量文本域自动高度 | `void` |
| `resize()` | 重新计算文本域高度 | `void` |
| `clear()`  | 清空输入框 | `void` |

## 使用说明

`v-model` 默认是空字符串。启用 `v-model.number` 后，可将可解析的输入转为数值。

禁用或只读时无法编辑和清空。FormItem 内会自动关联标签和错误。

示例：`<Input v-model="name" clearable placeholder="请输入姓名" />`。`formatter` 只改变展示值，`parser` 将用户输入转换为模型值；文本域设置 `autosize` 可根据内容自动调整高度。

Input 支持 `v-model.trim`、`v-model.number` 和 `v-model.lazy`。也可通过 `modelModifiers` 传入 `{ trim?: boolean; number?: boolean; lazy?: boolean }`。启用 `lazy` 时，键入期间仍触发 `input`，原生 `change` 时提交模型值。

容器接收 `class` 和 `style`，原生输入元素接收 `name`、`autocomplete` 等属性。`textareaStyle` 提供文本域样式，`input`、`textarea` 和 `ref` 提供原生元素引用。实例的 `input`、`textarea`、`ref`、`textareaStyle`、`autosize`、`isComposing` 和 `passwordVisible` 均为只读属性。后两项分别表示正在组字和密码可见状态，类型为 `boolean`。
