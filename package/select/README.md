# Select 选择器

### 介绍

从预设选项中选择一个值，支持字符串、数字值和清空操作。

## API

### 属性

| 参数                 | 说明                          | 类型            | 默认值       |
| -------------------- | ----------------------------- | --------------- | ------------ |
| modelValue / v-model | 当前选中值                    | string / number | undefined    |
| placeholder          | 未选择时的提示                | string          | 请选择       |
| clearable            | 允许清空，清空为 undefined    | boolean         | false        |
| disabled             | 禁用选择器                    | boolean         | false        |
| size                 | 尺寸：small / default / large | string          | 继承全局尺寸 |

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

键盘和关闭行为遵循原生浏览器；不支持搜索、多选和远程选项。
