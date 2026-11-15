# Breadcrumb 面包屑

## 组件介绍

Breadcrumb 显示当前页面在导航层级中的位置，支持链接、分隔符与末项语义。API 对标 Element Plus，支持 `BreadcrumbItem` 子组件与默认插槽，同时兼容旧版 `items` 数据驱动用法。

## 基础用法

```vue
<Breadcrumb separator="/">
  <BreadcrumbItem :to="{ path: '/' }">首页</BreadcrumbItem>
  <BreadcrumbItem>详情</BreadcrumbItem>
</Breadcrumb>
```

使用 `separator-icon` 或 `separator` 插槽自定义分隔符。末项自动带有 `aria-current="page"`。

## 数据驱动（兼容）

```vue
<Breadcrumb :items="[{ label: '首页', to: '#' }, { label: '详情' }]" />
```

## API

### Breadcrumb 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `items` | 数据驱动项（兼容） | `BreadcrumbItemOption[]` | `[]` |
| `separator` | 分隔符 | `string` | `/` |
| `separator-icon` | 分隔图标（优先于 `separator`） | `string \| Component` | — |

### Breadcrumb 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `click` | `items` 模式点击链接时触发 | `item: object, event: MouseEvent` |

### Breadcrumb 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | `BreadcrumbItem` 子组件；`items` 模式下接收 `{ item, index }` 自定义标签 |
| `separator` | 全局自定义分隔符 |

### BreadcrumbItem 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `to` | 跳转目标，字符串渲染为 `a[href]`，对象透传（取 `path`/`href`） | `string \| Record` | — |
| `replace` | 是否替换历史（透传，无路由时无操作） | `boolean` | `false` |

### BreadcrumbItem 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `click` | 点击时触发 | `event: MouseEvent` |

### BreadcrumbItem 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 面包屑内容 |
| `separator` | 单项自定义分隔符 |
