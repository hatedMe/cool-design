# Empty 空状态

### 介绍

在暂无数据时提供说明、插画和后续操作入口。对标 Element Plus，默认使用内置 SVG，不请求外部图片。

### 用法

```vue
<Empty description="没有符合筛选条件的数据">
  <Button type="primary" @click="reset">重置筛选</Button>
</Empty>
```

自定义图片与尺寸：

```vue
<Empty image="/logo.svg" image-size="96px" description="暂无订单">
  <Button type="primary">重新加载</Button>
</Empty>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| description | 空态描述 | `string` | `''` |
| image | 自定义图片地址，默认使用内置 SVG | `string` | — |
| image-size | 图片宽高，支持数字（px）或 CSS 尺寸 | `number` / `string` | — |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| image | 替换插画 |
| description | 替换描述 |
| default | 重试、重置等操作 |

### 使用说明

- `image-size` 同时作用于自定义图片和内置插画。
- Table 默认空态复用 Empty，自定义 Table empty 插槽仍然优先。
