# AvatarGroup 头像组

将多个 Avatar 叠放展示，可统一设置头像大小和形状。组内头像可分别设置 `size` 和 `shape`，显式传入的值优先。

## 基础用法

```vue
<script setup>
import { Avatar, AvatarGroup } from 'cool-design';
</script>

<template>
  <AvatarGroup :size="40" shape="square" collapse-avatars collapse-avatars-tooltip :max-collapse-avatars="2">
    <Avatar>林</Avatar>
    <Avatar shape="circle">沈</Avatar>
    <Avatar>陈</Avatar>
    <Avatar>周</Avatar>
  </AvatarGroup>
</template>
```

开启 `collapse-avatars` 后，超出的头像以 `+ N` 显示。将 `max-collapse-avatars` 设为 `0` 可只显示计数。开启 `collapse-avatars-tooltip` 后，可悬停或聚焦计数头像查看折叠内容，也可使用 Enter 或空格键操作。

如果以前在组外使用 Avatar，迁入后需要固定原有大小或形状时，可在头像上显式传入 `size="default"` 或 `shape="circle"`。Element Plus 的 `ElAvatarGroup` 可直接使用同名兼容导出。

`Avatar.AvatarGroup` 和 `ElAvatar.AvatarGroup` 都指向 AvatarGroup。按需执行 `app.use(Avatar)` 时会同时注册头像组。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| size | 组内头像的默认大小，数字单位为像素，空字符串使用 32px | `number` / `'' \| 'large' \| 'default' \| 'small'` | — |
| shape | 组内头像的默认形状 | `'circle' \| 'square'` | — |
| collapse-avatars | 是否启用折叠 | `boolean` | `false` |
| collapse-avatars-tooltip | 折叠时能否通过 Tooltip 查看隐藏项 | `boolean` | `false` |
| max-collapse-avatars | 折叠时最多直接显示的头像数量 | `number` | `1` |
| effect | Tooltip 主题，内置 `light` 和 `dark` | `string` | `'light'` |
| placement | Tooltip 出现位置 | `Placement` | `'top'` |
| popper-class | 应用于 Tooltip 面板的类 | `string` / `array` / `object` / `false` | — |
| popper-style | 应用于 Tooltip 面板的样式 | `string` / `array` / `CSSProperties` / `false` | — |
| collapse-class | 应用于计数头像的类 | `string` / `array` / `object` / `false` | — |
| collapse-style | 应用于计数头像的样式 | `string` / `array` / `CSSProperties` / `false` | — |

`Placement` 支持 `top`、`bottom`、`left`、`right`、`auto` 及对应的 `-start`、`-end` 位置。

### 插槽

| 名称 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 按顺序放置 Avatar | — |

### 事件

头像加载失败时，由相应 Avatar 触发 `error`。AvatarGroup 本身没有组件事件。

### 实例方法

AvatarGroup 没有公开的实例方法。
