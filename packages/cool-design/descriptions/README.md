# Descriptions 描述列表

### 介绍

以标签和值的形式展示详情信息。对标 Element Plus，使用 `DescriptionsItem` 子组件声明每一项，渲染为无障碍表格。

### 用法

```vue
<Descriptions title="用户信息" :column="3" border>
  <template #extra>
    <Button type="primary">编辑</Button>
  </template>
  <DescriptionsItem label="姓名">张三</DescriptionsItem>
  <DescriptionsItem label="地址" :span="2">浙江省杭州市西湖区</DescriptionsItem>
</Descriptions>
```

纵向排列：

```vue
<Descriptions title="订单详情" direction="vertical" :column="4" size="small" border>
  <DescriptionsItem label="订单号">202611120001</DescriptionsItem>
  <DescriptionsItem label="状态">已发货</DescriptionsItem>
</Descriptions>
```

兼容写法：通过 `items` 传入 `{ label, content, span }` 数组，无子组件时生效。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| title | 标题文本 | `string` | — |
| extra | 标题右侧操作区文本 | `string` | — |
| border | 是否显示边框 | `boolean` | `false` |
| column | 每行列数 | `number` | `3` |
| direction | 排列方向：`horizontal` / `vertical` | `string` | `horizontal` |
| size | 尺寸：`large` / `default` / `small` | `string` | `default` |
| label-width | 统一标签宽度，数字为 px | `string` / `number` | — |
| items | 兼容属性：声明式数据 | `DescriptionItem[]` | `[]` |

### DescriptionsItem 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| label | 标签文本 | `string` | — |
| span | 横跨列数，超出剩余列时收敛 | `number` | `1` |
| rowspan | 横跨行数（横向） | `number` | `1` |
| width | 内容列宽度 | `string` / `number` | — |
| min-width | 内容列最小宽度 | `string` / `number` | — |
| label-width | 标签宽度，优先于父组件 | `string` / `number` | — |
| align | 内容对齐：`left` / `center` / `right` | `string` | — |
| label-align | 标签对齐：`left` / `center` / `right` | `string` | — |
| class-name | 内容单元格类名 | `string` | — |
| label-class-name | 标签单元格类名 | `string` | — |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| default | DescriptionsItem 子组件 |
| title | 自定义标题 |
| extra | 自定义标题右侧操作区 |

### DescriptionsItem 插槽

| 名称 | 说明 |
| ---- | ---- |
| default | 内容 |
| label | 自定义标签 |

### 使用说明

- `span` 超出当前行剩余列时自动收敛，最后一项补足剩余列。
- 标签渲染为表头单元格，读屏可正确朗读标签与内容关系。
- `items` 模式仍支持 `label-序号` / `content-序号` 兼容插槽。
