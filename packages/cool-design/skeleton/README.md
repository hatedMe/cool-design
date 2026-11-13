# Skeleton 骨架屏

### 介绍

数据加载期间展示占位内容，避免布局跳动。对标 Element Plus，支持数量、节流、动画和自定义模板。

### 用法

通过 `loading` 控制骨架屏和真实内容切换：

```vue
<Skeleton :loading="loading" animated avatar title :rows="3">
  <p>真实内容</p>
</Skeleton>
```

使用 `template` 插槽和 `SkeletonItem` 自定义占位形状：

```vue
<Skeleton animated>
  <template #template>
    <SkeletonItem variant="image" />
    <SkeletonItem variant="h3" />
    <SkeletonItem variant="text" />
  </template>
</Skeleton>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| loading | 是否显示骨架屏，false 时显示默认插槽 | `boolean` | `true` |
| animated | 是否开启动画 | `boolean` | `false` |
| count | 渲染多少个骨架块 | `number` | `1` |
| rows | 默认模板段落行数 | `number` | `3` |
| title | 默认模板是否展示标题占位 | `boolean` | `false` |
| avatar | 默认模板是否展示头像占位 | `boolean` | `false` |
| throttle | 延迟展示骨架屏的毫秒数，避免短暂加载闪烁 | `number` | `0` |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| default | 加载完成后的真实内容 |
| template | 自定义骨架模板，重复 `count` 次 |

### SkeletonItem 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| variant | 占位形状：`p` / `text` / `h1` / `h3` / `caption` / `button` / `image` / `circle` / `rect` | `string` | `text` |

### 使用说明

- `throttle` 仅延迟骨架屏出现，加载结束时立即切换为真实内容。
- 骨架区域带有 `role="status"` 和 `加载中` 可访问名称，占位图形对读屏隐藏。
- 开启动画后遵循系统减少动态效果偏好。
