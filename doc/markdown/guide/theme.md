# 自定义主题

通过 ConfigProvider 统一主题、桌面控件尺寸和 CSS 变量。配置运行时生效，无需重新编译组件样式；支持局部嵌套和深浅主题切换。

## 全局主题与尺寸

在应用根部使用 ConfigProvider，默认是 `light` 主题、`default` 尺寸。组件单独指定的 `size` 优先于全局尺寸；支持范围以各组件 API 为准。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, ConfigProvider, Input, Space, Switch } from 'cool-design';
import type { Size } from 'cool-design';
import 'cool-design/style.css';

const dark = ref(false);
const size = ref<Size>('default');
const name = ref('');
</script>

<template>
  <ConfigProvider :theme="dark ? 'dark' : 'light'" :size="size">
    <Space direction="vertical" align="start" :size="16">
      <Switch v-model="dark">深色主题</Switch>
      <label>
        控件尺寸
        <select v-model="size">
          <option value="small">小尺寸</option>
          <option value="default">默认尺寸</option>
          <option value="large">大尺寸</option>
        </select>
      </label>
      <Input v-model="name" placeholder="体验控件尺寸" aria-label="主题示例" />
      <Button type="primary">保存配置</Button>
    </Space>
  </ConfigProvider>
</template>
```

| 配置      | 控件高度 | 适用场景                 |
| --------- | -------- | ------------------------ |
| `small`   | 28px     | 紧凑工具栏、表格行内操作 |
| `default` | 32px     | 管理后台常规表单         |
| `large`   | 40px     | 大尺寸表单、重点操作     |

## 修改品牌颜色

`themeVars` 接收完整 CSS 变量名。修改主色时同时设置悬停色和主色上的文字色，确保文字清晰；自定义变量优先于内置深浅主题色。

```vue
<script setup lang="ts">
import { Button, ConfigProvider, Space, Tag } from 'cool-design';
const themeVars = {
  '--i-primary': '#126d58',
  '--i-primary-hover': '#0e5847',
  '--i-on-primary': '#ffffff',
  '--i-radius': '8px'
};
</script>

<template>
  <ConfigProvider :theme-vars="themeVars">
    <Space>
      <Button type="primary">保存配置</Button>
      <Tag>品牌标签</Tag>
    </Space>
  </ConfigProvider>
</template>
```

需要不同的深浅品牌色时，可使用 `computed` 根据当前主题生成 `themeVars`。只覆盖需要改变的变量，其余变量继续使用内置主题值。

## 局部主题与继承

嵌套 ConfigProvider 时，省略的 `theme`、`size` 继承父级，`themeVars` 与父级合并，同名变量由子级覆盖。

```vue
<script setup lang="ts">
import { Button, ConfigProvider, Space } from 'cool-design';
const brand = { '--i-primary': '#126d58', '--i-primary-hover': '#0e5847', '--i-on-primary': '#ffffff' };
</script>

<template>
  <ConfigProvider :theme-vars="brand" size="default">
    <Space direction="vertical" align="start" :size="16">
      <Button type="primary">继承品牌色与默认尺寸</Button>
      <ConfigProvider size="small">
        <Button type="primary">继承品牌色，使用小尺寸</Button>
      </ConfigProvider>
      <ConfigProvider :theme-vars="{ '--i-primary': '#2463eb', '--i-primary-hover': '#1d4ed8' }">
        <Button type="primary">局部覆盖为蓝色</Button>
      </ConfigProvider>
    </Space>
  </ConfigProvider>
</template>
```

父级明确设置的背景、文字等自定义变量也会传给子级。如果局部深色区域看起来没有切换颜色，检查父级 `themeVars` 是否固定了相关变量，并在子级按需覆盖。

## 常用 CSS 变量

以下颜色默认值来自当前源码。完整定义位于 `packages/cool-design/style/tokens.scss`。

| 变量                 | 用途         | 浅色默认值 | 深色默认值 |
| -------------------- | ------------ | ---------- | ---------- |
| `--i-primary`        | 主色         | `#2463eb`  | `#7aa9ff`  |
| `--i-primary-hover`  | 主色悬停     | `#1d4ed8`  | `#a0c1ff`  |
| `--i-on-primary`     | 主色上的文字 | `#fff`     | `#13213b`  |
| `--i-success`        | 成功状态     | `#16815d`  | `#64d5a6`  |
| `--i-warning`        | 警告状态     | `#b77909`  | `#f0bf65`  |
| `--i-danger`         | 危险状态     | `#d73d4a`  | `#ff8793`  |
| `--i-text`           | 正文文字     | `#203047`  | `#e0e8f4`  |
| `--i-text-secondary` | 次要文字     | `#65748a`  | `#a6b4c9`  |
| `--i-text-muted`     | 弱化文字     | `#8794a6`  | `#8190a6`  |
| `--i-bg`             | 内容背景     | `#fff`     | `#1c2738`  |
| `--i-bg-page`        | 页面背景     | `#f3f6fa`  | `#131c2b`  |
| `--i-bg-subtle`      | 次级背景     | `#f7f9fc`  | `#233147`  |
| `--i-border`         | 边框         | `#dce3ed`  | `#36445a`  |

| 变量                 | 用途                       | 默认值                            |
| -------------------- | -------------------------- | --------------------------------- |
| `--i-radius`         | 控件圆角                   | `6px`                             |
| `--i-font-size`      | 正文字号                   | `14px`                            |
| `--i-space`          | 基础间距                   | `8px`                             |
| `--i-shadow`         | 弹层阴影                   | `0 12px 40px rgb(26 43 68 / 16%)` |
| `--i-control-height` | 控件高度，由全局 size 设置 | `32px`                            |

## 自定义样式的作用范围

优先使用 `themeVars`。组件库会在每个 `.i-config-provider` 上声明默认变量，仅在外层 `:root` 修改同名变量，不一定能覆盖配置容器上的值。

需要覆盖组件结构样式时，为自己的区域添加类名；在 `<style scoped>` 中使用 `:deep()` 选择内部节点，例如：

```vue
<script setup lang="ts">
import { Button, ConfigProvider } from 'cool-design';
</script>

<template>
  <ConfigProvider class="settings-panel"><Button>设置操作</Button></ConfigProvider>
</template>

<style scoped>
.settings-panel :deep(.i-button) {
  min-width: 120px;
}
</style>
```

## 浮层继承主题

Dialog、Tooltip、Popconfirm 和 MessageBox 使用最近 ConfigProvider 提供的浮层宿主，继承该配置的主题和变量。

声明式弹窗放在 ConfigProvider 内即可。组合式 `useMessageBox()` 则应在 ConfigProvider **后代组件**的 setup 中调用；在渲染 ConfigProvider 的同一个组件 setup 中调用，无法读取这个组件将要提供的配置。

独立的 `MessageBox.confirm()` 使用默认浅色配置；需要继承局部主题时，使用声明式组件或后代组件内的 `useMessageBox()`。详见 [MessageBox](#/components/message-box)。

下面的演示可直接切换局部主题与尺寸；[ConfigProvider 文档](#/components/config-provider)提供完整配置 API。
