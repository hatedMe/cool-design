# CheckTag 可选标签

### 介绍

用于切换筛选条件等选中状态。

### 用法

```vue
<CheckTag v-model:checked="selected">已启用</CheckTag>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `checked` | 当前选中状态 | `boolean` | `false` |
| `disabled` | 是否禁止切换 | `boolean` | `false` |
| `type` | 标签主题 | `primary` \| `success` \| `info` \| `warning` \| `danger` | `primary` |

### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| `change` | 点击或键盘激活后发出 | `checked: boolean` |
| `update:checked` | 更新受控选中状态 | `checked: boolean` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 标签内容 |
