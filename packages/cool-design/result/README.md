# Result 结果

### 介绍

用于反馈操作结果或异常状态。对标 Element Plus，支持成功、警告、信息和失败四种状态，并兼容 `404` / `403` / `500` 页面级异常。

### 用法

```vue
<Result status="success" title="提交成功" sub-title="订单已创建">
  <template #extra>
    <Button type="primary">返回列表</Button>
  </template>
</Result>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| title | 标题 | `string` | — |
| sub-title | 副标题 | `string` | — |
| status | 状态：`success` / `warning` / `info` / `error` / `404` / `403` / `500` | `string` | `info` |
| icon | 自定义图标：图标类名或组件，优先级低于 icon 插槽 | `string` / `Component` | — |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| icon | 自定义图标 |
| title | 自定义标题 |
| sub-title / subTitle | 自定义副标题 |
| extra | 底部操作区 |

### 使用说明

- 结果区域带有 `role="status"`，读屏会朗读反馈内容。
- 未提供标题或副标题时对应节点不渲染。
