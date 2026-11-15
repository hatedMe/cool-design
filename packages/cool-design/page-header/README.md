# PageHeader 页头

## 组件介绍

PageHeader 用于详情页、编辑页的返回和标题区域，支持返回按钮、标题、扩展操作与面包屑。API 对标 Element Plus。

## 基础用法

```vue
<PageHeader title="返回" content="详情页" @back="goBack">
  <template #extra>
    <button type="button">编辑</button>
  </template>
</PageHeader>
```

`icon=""` 时隐藏返回按钮。`back-text` 为旧属性，兼容为返回文字，未提供 `title` 时生效。

## 插槽用法

```vue
<PageHeader @back="goBack">
  <template #breadcrumb><Breadcrumb :items="items" /></template>
  <template #content>用户详情</template>
  <p>详情内容</p>
</PageHeader>
```

## API

### PageHeader 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `icon` | 返回图标，为空字符串时隐藏返回按钮 | `string` | `‹` |
| `title` | 返回按钮文字 | `string` | `''` |
| `content` | 主标题内容 | `string` | `''` |
| `back-text` | 兼容旧属性：返回按钮文字 | `string` | `''` |

### PageHeader 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `back` | 点击返回按钮 | `event: MouseEvent` |

### PageHeader 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `breadcrumb` | 面包屑区域 |
| `icon` | 自定义返回图标 |
| `title` | 自定义返回文字 |
| `content` | 自定义主标题 |
| `extra` | 右侧扩展操作 |
| `default` | 详情内容区域 |
