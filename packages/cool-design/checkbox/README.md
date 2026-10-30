# Checkbox 复选框

### 介绍

用于开启独立选项或勾选记录，支持选中、半选、禁用、边框和 CheckboxGroup。

## API

### 属性

| 参数                 | 说明                       | 类型                      | 默认值 |
| -------------------- | -------------------------- | ------------------------- | ------ |
| modelValue / v-model | 是否勾选或绑定 true-value / false-value | string / number / boolean | false  |
| label                | 选项文本                   | string                    | —      |
| trueValue            | 选中时的模型值             | string / number / boolean | true   |
| falseValue           | 未选中时的模型值           | string / number / boolean | false  |
| checked              | 初始是否选中               | boolean                   | false  |
| disabled             | 是否禁用                   | boolean                   | false  |
| indeterminate        | 是否显示半选，不改变模型值 | boolean                   | false  |
| value                | 分组中的选项值             | string / number / boolean / object | — |
| border               | 显示边框                   | boolean                   | false  |
| size                 | 尺寸：`small` / `default` / `large` | string | — |
| validateEvent        | 是否触发表单校验           | boolean                   | true   |

### 事件

| 事件名            | 说明         | 回调参数         |
| ----------------- | ------------ | ---------------- |
| update:modelValue | 用户改变勾选 | checked: boolean |
| change            | 用户改变勾选 | checked: boolean |

## CheckboxGroup

使用 `CheckboxGroup` 管理数组值，可通过 `min`、`max` 限制最少和最多选项；子项通过 `value` 指定数组成员。

### 插槽

| 名称    | 说明     |
| ------- | -------- |
| default | 勾选标签 |

### CheckboxGroup 属性

| 参数                 | 说明                       | 类型                                      | 默认值 |
| -------------------- | -------------------------- | ----------------------------------------- | ------ |
| modelValue / v-model | 已选值数组                 | array                                     | []     |
| min                  | 最少可选数量               | number                                    | —      |
| max                  | 最多可选数量               | number                                    | —      |
| disabled             | 是否禁用全部子项           | boolean                                   | false  |
| size                 | 子项尺寸：`small` / `default` / `large` | string                    | —      |
| validateEvent        | 是否触发表单校验           | boolean                                   | true   |
| tag                  | Group 根元素标签           | string                                    | `div`  |
| type                 | options 渲染类型：`checkbox` / `button` | string                    | `checkbox` |
| options              | 自动生成子项的数据         | array                                     | —      |
| props                | options 字段映射           | object                                    | —      |

### CheckboxGroup 事件

| 事件名            | 说明           | 回调参数      |
| ----------------- | -------------- | ------------- |
| update:modelValue | 已选值数组变化 | values: array |
| change            | 用户改变选中项 | values: array |

### CheckboxButton

用于按钮样式的复选项，支持独立使用，也可以放在 CheckboxGroup 中。

```vue
<CheckboxGroup v-model="values" type="button">
  <CheckboxButton value="a">选项 A</CheckboxButton>
  <CheckboxButton value="b">选项 B</CheckboxButton>
</CheckboxGroup>
```

### options 用法

```vue
<CheckboxGroup
  v-model="values"
  type="button"
  :options="options"
  :props="{ value: 'code', label: 'text', disabled: 'blocked' }"
/>
```

`options` 仅在未提供默认插槽时生效；未配置 `props` 时默认读取 `value`、`label`、`disabled` 字段。

## 使用说明

单个 Checkbox 的 v-model 默认使用 boolean，也支持通过 trueValue / falseValue 映射模型值。默认插槽为空时显示 label。indeterminate 只影响视觉状态。支持键盘空格切换。
