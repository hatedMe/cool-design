# Select 选择器

### 介绍

从预设选项中选择一个或多个值，支持字符串、数字值、禁用项、清空和本地筛选。

## 基础用法

默认是单选；使用 `SelectOption` 提供选项。

## 禁用与清空

Select 和 SelectOption 都支持 `disabled`；`clearable` 清空为 `undefined`（多选时为空数组）。

## 多选

设置 `multiple` 后，`v-model` 使用数组并保留数字选项的数字类型。

## 筛选

设置 `filterable` 显示筛选输入框；无匹配项时显示 `noMatchText`。

## 远程与虚拟选项

设置 `remote` 和 `remoteMethod` 按查询词异步加载 `SelectRemoteOption[]`；选项很多时设置 `virtualized` 只渲染可视范围附近的选项。

## 尺寸

支持 `small`、`default`、`large`，未设置时继承 ConfigProvider。

## API

### 属性

| 参数                 | 说明                          | 类型            | 默认值       |
| -------------------- | ----------------------------- | --------------- | ------------ |
| modelValue / v-model | 当前选中值                    | string / number / array | undefined / [] |
| placeholder          | 未选择时的提示                | string          | 请选择       |
| clearable            | 允许清空，清空为 undefined    | boolean         | false        |
| disabled             | 禁用选择器                    | boolean         | false        |
| size                 | 尺寸：small / default / large | string          | 继承全局尺寸 |
| multiple             | 是否多选 | boolean | false |
| name                 | 原生 select 名称 | string | — |
| filterable           | 是否启用本地筛选 | boolean | false |
| noDataText           | 没有选项时的提示 | string | 无数据 |
| noMatchText          | 没有匹配项时的提示 | string | 无匹配数据 |
| remote               | 是否启用远程选项 | boolean | false |
| remoteMethod         | 根据查询词加载选项 | (query: string) => SelectRemoteOption[] / Promise<SelectRemoteOption[]> | — |
| remoteLoading        | 远程加载中 | boolean | false |
| virtualized          | 是否只渲染可视选项 | boolean | false |
| itemHeight / height  | 虚拟选项行高和容器高度 | number | 34 / 240 |
| remote               | 是否启用远程选项 | boolean | false |
| remoteMethod         | 根据查询词加载选项 | (query: string) => SelectRemoteOption[] / Promise<SelectRemoteOption[]> | — |
| remoteLoading        | 远程加载中 | boolean | false |
| virtualized          | 是否只渲染可视选项 | boolean | false |
| itemHeight / height  | 虚拟选项行高和容器高度 | number | 34 / 240 |

### 事件

| 事件名            | 说明       | 回调参数                           |
| ----------------- | ---------- | ---------------------------------- |
| update:modelValue | 选中或清空 | value: string / number / undefined |
| change            | 选中或清空 | value: string / number / undefined |
| blur              | 选择器失焦 | event: FocusEvent                  |

### 插槽

| 名称    | 说明              |
| ------- | ----------------- |
| default | SelectOption 列表 |

### 实例方法

| 方法    | 说明       | 返回值 |
| ------- | ---------- | ------ |
| focus() | 聚焦选择器 | void   |

## 使用说明

原生单选 select，默认插槽放 SelectOption。`v-model?: string | number`，未选择为 undefined。属性：clearable、disabled、placeholder（默认“请选择”）、size。数字选项保持数字类型。

事件 update:modelValue(value)、change(value) 在确认选择、清空时触发；清空为 undefined；blur(event)。实例方法 focus()。空字符串保留给占位项，不作为业务值。

```vue
<Select v-model="status" clearable>
    <SelectOption value="enabled" label="启用" />
    <SelectOption value="disabled" label="停用" />
</Select>
```

键盘和关闭行为遵循原生浏览器；`remote` 通过 `remoteMethod(query)` 加载选项，`virtualized` 仅渲染当前可视范围附近的选项，适合较长列表。
