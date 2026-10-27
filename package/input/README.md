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

## 图标与插槽

支持 `prefix-icon`、`suffix-icon` 以及 `prefix`、`suffix` 插槽。

## 尺寸

支持 `small`、`default`、`large`，未设置时继承 ConfigProvider。

## API

### 属性

| 参数                 | 说明                          | 类型    | 默认值       |
| -------------------- | ----------------------------- | ------- | ------------ |
| modelValue / v-model | 输入内容                      | string  | 空字符串     |
| placeholder          | 占位提示                      | string  | —            |
| clearable            | 允许清空                      | boolean | false        |
| disabled             | 禁止输入和清空                | boolean | false        |
| readonly             | 只读，禁止清空                | boolean | false        |
| size                 | 尺寸：small / default / large | string  | 继承全局尺寸 |
| type                 | text / password / textarea / search | string | text |
| rows                 | 文本域行数 | number | 2 |
| maxlength / minlength | 原生长度限制 | string / number | — |
| showWordLimit        | 显示长度统计 | boolean | false |
| showPassword         | 显示密码切换 | boolean | false |
| prefixIcon / suffixIcon | 图标字体类名 | string | — |

### 事件

| 事件名            | 说明               | 回调参数          |
| ----------------- | ------------------ | ----------------- |
| update:modelValue | 输入或清空         | value: string     |
| change            | 原生 change 或清空 | value: string     |
| blur              | 输入框失焦         | event: FocusEvent |
| input             | 输入内容变化       | value: string |
| focus             | 输入框聚焦         | event: FocusEvent |
| clear             | 点击清空           | — |

### 实例方法

| 方法    | 说明       | 返回值 |
| ------- | ---------- | ------ |
| focus() | 聚焦输入框 | void   |
| clear() | 清空输入框 | void   |

## 使用说明

`v-model` 为字符串，默认空字符串。属性：clearable、disabled、readonly、placeholder、size。id、name、maxlength、aria-label 等原生属性透传到 input。

事件：`update:modelValue(value: string)` 在输入和清空时触发；`change(value: string)` 在原生 change 或清空时触发；`blur(event: FocusEvent)`。实例方法 focus()。禁用、只读不能编辑和清空。在 FormItem 内自动关联标签和错误。

示例：`<Input v-model="name" clearable placeholder="请输入姓名" />`。
