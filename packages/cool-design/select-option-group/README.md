# SelectOptionGroup 选项分组

### 介绍

为 Select 的选项提供分组标题，嵌套 `SelectOption` 使用。仅在 Select 内生效。

## 用法

```vue
<Select v-model="city">
  <SelectOptionGroup label="热门城市">
    <SelectOption value="shanghai" label="上海" />
    <SelectOption value="beijing" label="北京" />
  </SelectOptionGroup>
</Select>
```

## API

### 属性

| 参数       | 说明             | 类型      | 默认值  |
| ---------- | ---------------- | --------- | ------- |
| `label`    | 分组标题         | `string`  | —       |
| `disabled` | 是否禁用整组选项 | `boolean` | `false` |

### 插槽

| 名称      | 说明                 |
| --------- | -------------------- |
| `default` | 该分组下的 SelectOption |
