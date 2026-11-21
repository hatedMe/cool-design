# Pagination 分页

### 介绍

控制数据列表的当前页码和每页条数，适合与 Table 组合使用。支持 `layout` 自由组合功能模块、`page-count` 直接指定总页数、页码跳转器和每页条数切换。

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

只有总页数时可传 `page-count`。同时传入 `total` 和 `page-count` 时，以 `page-count` 为准。省略 `v-model` 和对应的受控属性时，组件自行维护页码与每页条数。页数减少时，组件会请求将越界页码裁剪到最后一页，业务需要跳回第一页时可以在接纳尺寸更新时设置页码。

`layout` 包含 `sizes` 时，可用 `append-size-to` 指定下拉挂载的 CSS 选择器，通过 `popper-class` 和 `popper-style` 设置下拉样式。设置 `:teleported="false"` 后下拉显示在分页组件内部。`prev-text` 和 `next-text` 优先于对应图标，默认分别显示左箭头和右箭头。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| current-page / v-model:current-page | 受控页码，从 1 开始 | `number` | — |
| default-current-page | 非受控页码的初始值 | `number` | `1` |
| page-size / v-model:page-size | 受控每页条数 | `number` | — |
| default-page-size | 非受控每页条数的初始值 | `number` | `10` |
| total | 总记录数，省略时显示 0 条 | `number` | — |
| page-count | 总页数，与 total 二选一，传入时优先使用 | `number` | — |
| pager-count | 页码按钮数量，收敛为 5~21 之间的奇数 | `number` | `7` |
| page-sizes | 每页条数选项 | `number[]` | `[10, 20, 30, 40, 50, 100]` |
| layout | 功能模块组合，逗号分隔 | `string` | `prev, pager, next, jumper, ->, total` |
| size | 分页尺寸，默认继承 ConfigProvider | `'large' \| 'default' \| 'small'` | `'default'` |
| small | 兼容属性，开启时强制使用小尺寸 | `boolean` | `false` |
| background | 页码按钮背景样式 | `boolean` | `false` |
| disabled | 禁用全部交互 | `boolean` | `false` |
| hide-on-single-page | 只有一页时隐藏 | `boolean` | `false` |
| prev-text | 上一页文字，空时显示图标 | `string` | `''` |
| prev-icon | 上一页图标，接受组件、注册名称或本库图标类名 | `string \| Component` | `ArrowLeft` |
| next-text | 下一页文字，空时显示图标 | `string` | `''` |
| next-icon | 下一页图标，接受组件、注册名称或本库图标类名 | `string \| Component` | `ArrowRight` |
| append-size-to | 每页条数下拉的挂载目标选择器 | `string` | — |
| popper-class | 每页条数下拉的自定义类名 | `string \| object \| array \| boolean` | `''` |
| popper-style | 每页条数下拉的自定义样式 | `StyleValue \| boolean` | — |
| teleported | 是否传送每页条数下拉，默认使用 ConfigProvider 浮层宿主或 `body` | `boolean` | `true` |

`layout` 可选模块：`total` / `sizes` / `prev` / `pager` / `next` / `jumper` / `->`（居右分隔）/ `slot`（默认插槽）。

### 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| update:current-page | 切换页码或页码越界修正 | `page: number` |
| update:page-size | 改变每页条数 | `size: number` |
| current-change | 组件请求改变页码，与 `update:current-page` 同步 | `page: number` |
| size-change | 组件请求改变每页条数 | `size: number` |
| page-size-change | 旧版每页条数事件，在 `size-change` 前触发 | `size: number` |
| change | 页码或每页条数实际变化后，在渲染更新后合并触发 | `currentPage: number, pageSize: number` |
| prev-click | 激活上一页按钮后同步触发，传入当时的绑定页码 | `page: number` |
| next-click | 激活下一页按钮后同步触发，传入当时的绑定页码 | `page: number` |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| default | 渲染到 `layout` 中 `slot` 指定的位置 |

### 实例方法

分页通过属性和事件控制，实例没有专用方法。

### 版本迁移

- `sizes` 现在使用 Select。旧 `.i-pagination__sizes` 类现用于 Select 的外层容器，面板样式可通过 `popper-class` 或 `popper-style` 设置。默认下拉传送到浮层宿主，需要在分页内部渲染时可设置 `:teleported="false"`。
- `change` 现在接收 `currentPage` 和 `pageSize`，同一轮更新合并触发一次，受控父级拒绝更新时不会触发。依赖翻页或改条数的请求值时可使用对应的 `update:*` 事件。受控模式的 `prev-click` 和 `next-click` 同步读取组件当时的绑定页码，父级提交新值后由 `change` 报告实际更新。

### 使用说明

- 页码过多时使用省略号折叠，当前页按钮带有 `aria-current="page"`。
- 总数缩小导致页码越界时，组件通知父级修正页码。
- 跳转器只接受数字，超出范围时收敛到合法页码。
