# Pagination 分页

### 介绍

控制数据列表的当前页码和每页条数，适合与 Table 组合使用。对标 Element Plus，支持 `layout` 自由组合功能模块、`page-count` 直接指定总页数、页码跳转器和每页条数切换。

### 用法

使用 `v-model:current-page` 和 `v-model:page-size` 受控页码与条数，页码从 1 开始：

```vue
<Pagination
  v-model:current-page="page"
  v-model:page-size="size"
  :total="400"
  layout="total, sizes, prev, pager, next, jumper"
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange" />
```

当只有总页数没有总条数时，使用 `page-count` 代替 `total`。改变每页条数后，由页面负责把页码重置为 1 再请求数据。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| current-page / v-model:current-page | 当前页码，从 1 开始 | `number` | `1` |
| page-size / v-model:page-size | 每页条数 | `number` | `10` |
| total | 总记录数 | `number` | `0` |
| page-count | 总页数，与 total 二选一，传入时优先使用 | `number` | — |
| pager-count | 页码按钮数量，收敛为 5~21 之间的奇数 | `number` | `7` |
| page-sizes | 每页条数选项 | `number[]` | `[10, 20, 30, 40, 50, 100]` |
| layout | 功能模块组合，逗号分隔 | `string` | `prev, pager, next, jumper, ->, total` |
| small | 小尺寸分页 | `boolean` | `false` |
| background | 页码按钮背景样式 | `boolean` | `false` |
| disabled | 禁用全部交互 | `boolean` | `false` |
| hide-on-single-page | 只有一页时隐藏 | `boolean` | `false` |
| prev-text | 上一页文字，空时显示图标 | `string` | — |
| next-text | 下一页文字，空时显示图标 | `string` | — |

`layout` 可选模块：`total` / `sizes` / `prev` / `pager` / `next` / `jumper` / `->`（居右分隔）/ `slot`（默认插槽）。

### 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| update:current-page | 切换页码或页码越界修正 | `page: number` |
| update:page-size | 改变每页条数 | `size: number` |
| current-change | 页码改变后触发 | `page: number` |
| size-change | 每页条数改变后触发 | `size: number` |
| page-size-change | 兼容事件：每页条数改变后触发 | `size: number` |
| change | 页码或每页条数改变后触发 | `page: number` |
| prev-click | 点击上一页后触发 | `page: number` |
| next-click | 点击下一页后触发 | `page: number` |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| default | layout 包含 `slot` 时渲染的自定义内容 |

### 使用说明

- 页码过多时使用省略号折叠，当前页按钮带有 `aria-current="page"`。
- 总数缩小导致页码越界时，组件通知父级修正页码。
- 跳转器只接受数字，超出范围时收敛到合法页码。
