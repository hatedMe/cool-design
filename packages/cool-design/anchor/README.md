# Anchor 锚点

### 介绍

通过锚点快速定位页面（或滚动容器）内的信息位置，滚动时自动高亮当前位置。

## 基础用法

`AnchorLink` 通过 `href` 关联目标元素（`#id`），点击平滑滚动到目标（带 `offset` 偏移），滚动时自动切换高亮并触发 `change`。

```vue
<Anchor :offset="70">
  <AnchorLink href="#usage" title="基础用法" />
  <AnchorLink href="#api">
    API
    <template #sub-link>
      <AnchorLink href="#attributes" title="属性" />
    </template>
  </AnchorLink>
</Anchor>
```

`direction="horizontal"` 横向排列（不支持 `sub-link` 插槽）；`type="underline"` 下划线高亮风格；`marker` 控制侧边标记线；`container` 传选择器或元素可在自定义滚动容器内生效。

## API

### Anchor 属性

| 参数              | 说明                                       | 类型                            | 默认值   |
| ----------------- | ------------------------------------------ | ------------------------------- | -------- |
| `container`       | 滚动容器（选择器、元素或 `window`）        | `string` / `HTMLElement` / `Window` | —    |
| `offset`          | 滚动偏移量                                 | `number`                        | `0`      |
| `bound`           | 触发锚点高亮的边界偏移                     | `number`                        | `15`     |
| `duration`        | 滚动动画时长，单位 ms                      | `number`                        | `300`    |
| `marker`          | 是否显示侧边标记线                         | `boolean`                       | `true`   |
| `type`            | 样式类型：`default` / `underline`          | `string`                        | `default` |
| `direction`       | 排列方向：`vertical` / `horizontal`        | `string`                        | `vertical` |
| `selectScrollTop` | 滚动到顶部时是否选中第一个链接             | `boolean`                       | `false`  |

### Anchor 事件

| 事件名   | 说明                       | 回调参数                      |
| -------- | -------------------------- | ----------------------------- |
| `change` | 当前锚点变化时触发         | `href: string`                |
| `click`  | 点击链接时触发，`preventDefault` 可阻止历史记录变化 | `event: MouseEvent, href: string` |

### Anchor 插槽

| 名称      | 说明                 |
| --------- | -------------------- |
| `default` | AnchorLink 列表      |

### Anchor 实例方法

| 方法               | 说明                     |
| ------------------ | ------------------------ |
| `scrollTo(href)`   | 手动滚动到指定锚点       |

### AnchorLink 属性

| 参数    | 说明           | 类型     | 默认值 |
| ------- | -------------- | -------- | ------ |
| `href`  | 目标元素地址   | `string` | —      |
| `title` | 链接文本       | `string` | —      |

### AnchorLink 插槽

| 名称      | 说明                     |
| --------- | ------------------------ |
| `default` | 链接内容（优先于 `title`） |
| `sub-link` | 子链接列表               |
