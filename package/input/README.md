# Input 输入框

### 介绍

用于输入单行文本，支持双向绑定、清空、只读和表单校验。

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

### 事件

| 事件名            | 说明               | 回调参数          |
| ----------------- | ------------------ | ----------------- |
| update:modelValue | 输入或清空         | value: string     |
| change            | 原生 change 或清空 | value: string     |
| blur              | 输入框失焦         | event: FocusEvent |

### 实例方法

| 方法    | 说明       | 返回值 |
| ------- | ---------- | ------ |
| focus() | 聚焦输入框 | void   |

## 使用说明

`v-model` 为字符串，默认空字符串。属性：clearable、disabled、readonly、placeholder、size。id、name、maxlength、aria-label 等原生属性透传到 input。

事件：`update:modelValue(value: string)` 在输入和清空时触发；`change(value: string)` 在原生 change 或清空时触发；`blur(event: FocusEvent)`。实例方法 focus()。禁用、只读不能编辑和清空。在 FormItem 内自动关联标签和错误。

示例：`<Input v-model="name" clearable placeholder="请输入姓名" />`。
