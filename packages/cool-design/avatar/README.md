# Avatar 头像

### 介绍

可以用来代表人物或对象，支持使用图片、图标或者文字作为头像。默认圆形，尺寸支持语义档位和数字像素。

### 用法

使用 `shape` 和 `size` 设置头像的形状和大小：

```vue
<Avatar>大</Avatar>
<Avatar size="default" shape="circle">中</Avatar>
<Avatar size="small" icon="icon-user" />
<Avatar shape="circle" url="https://picsum.photos/80" alt="示例头像" />
```

图片加载失败时触发 `error` 事件，并显示 `fallback` 插槽内容：

```vue
<Avatar url="/missing-avatar.png" alt="用户头像">
  <template #fallback>回退</template>
</Avatar>
```

使用 `fit` 设置图片在头像容器中的适配方式，与 CSS `object-fit` 一致。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| src / url | 图片地址，`url` 为兼容别名 | `string` | — |
| src-set | 响应式图片地址 | `string` | — |
| alt | 图片替代文本 | `string` | `''` |
| shape | 形状：`circle` / `square` | `string` | `circle` |
| size | 尺寸，数字单位为像素，`medium` 为兼容别名 | `'' \| 'large' \| 'default' \| 'medium' \| 'small'` / `number` | `default` |
| fit | 图片适配方式：`fill` / `contain` / `cover` / `none` / `scale-down` | `string` | `cover` |
| icon | 图标类名或图标组件 | `string` / `Component` | — |

### 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| error | 图片加载失败 | `event: Event` |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| default | 文字内容，无图片时展示 |
| fallback | 图片失败后的回退内容 |

### 使用说明

- Avatar 位于 AvatarGroup 中时，未设置的 `size` 和 `shape` 继承组内配置。单独使用时默认为 `default` 和 `circle`。
- 显式传入 `size=""` 会使用 32px 的默认尺寸，并覆盖组尺寸。依赖旧版空字符串渲染为 50px 的页面可改用 `:size="50"`。
- `Avatar.AvatarGroup` 指向同一个头像组组件。`app.use(Avatar)` 会同时注册 AvatarGroup。
- 图片地址变化后自动清除失败状态并重新加载。
- 失败时优先显示 `fallback` 插槽，其次显示 `icon`，最后显示默认插槽。
- 装饰性头像可省略 `alt`，表达含义的头像请提供 `alt`。
