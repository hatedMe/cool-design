# CheckboxGroup 复选框组

### 介绍

CheckboxGroup 管理一组 Checkbox 的数组值，并支持 `min`、`max`、整体禁用、`tag`、`options` 和 `props` 字段映射。

## 用法

```vue
<CheckboxGroup v-model="values" :options="options" />
```

按钮模式：

```vue
<CheckboxGroup v-model="values" type="button">
  <CheckboxButton value="a">选项 A</CheckboxButton>
</CheckboxGroup>
```

## API

### 属性

| 参数       | 说明                                       | 类型                                      | 默认值     |
| ---------- | ------------------------------------------ | ----------------------------------------- | ---------- |
| modelValue | 选中值数组                                 | `(string \| number \| boolean \| object)[]` | `[]`     |
| min / max  | 最少 / 最多可选数量                        | `number`                                  | —          |
| disabled   | 禁用整个组                                 | `boolean`                                 | `false`    |
| size       | 子项尺寸：`small` / `default` / `large`    | `string`                                  | —          |
| tag        | 根元素标签                                 | `string`                                  | `div`      |
| type       | options 渲染类型：`checkbox` / `button`    | `string`                                  | `checkbox` |
| options    | 自动生成子项的数据                         | `array`                                   | —          |
| props      | options 字段映射                           | `object`                                  | —          |

### 事件

| 事件名            | 说明           | 回调参数      |
| ----------------- | -------------- | ------------- |
| update:modelValue | 已选值数组变化 | `values`      |
| change            | 用户改变选中项 | `values`      |
