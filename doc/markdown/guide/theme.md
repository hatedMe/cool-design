# 自定义主题

通过 ConfigProvider 统一主题、桌面控件尺寸、CSS 变量和命名空间。主题、尺寸和变量可在运行时更新。自定义命名空间需要预先编译对应的样式。

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

## 自定义命名空间

组件库内部生成的样式类名、主题变量和内置动画使用当前命名空间。默认前缀为 `i`，npm 包的 `cool-design/style.css` 已包含这套样式。组件的导入名与注册名保持原样，例如 `Button`、`i-button`、`IButton` 和 `ElButton`。

在 Vite 应用中创建 `namespace-acme.scss`，将字体路径指向包内资源。然后在应用入口写入 `import './namespace-acme.scss'`，Vite 会将这三种字体打包到输出目录。

```scss
@use 'cool-design/es/sass/style/mixins/config' with (
  $namespace: 'acme',
  $icon-font-path: 'cool-design/es/sass/icon/fonts'
);
@use 'cool-design/es/sass/style/published';
```

使用 Sass CLI 时，采用默认的相对字体路径。

```scss
@use 'cool-design/es/sass/style/mixins/config' with ($namespace: 'acme');
@use 'cool-design/es/sass/style/published';
```

```bash
pnpm exec sass --load-path=node_modules --no-source-map namespace-acme.scss dist/styles/theme.css
```

直接用 Sass CLI 生成 CSS 时，将包内 `es/sass/icon/fonts` 复制到 `dist/icon/fonts`，以便浏览器从样式表的相对路径加载字体。发布入口固定了组件的覆盖顺序。此前部分构建中的 RadioGroup 为 `inline-flex`，现为 `inline-block`。从旧源码全量入口迁移时，Cascader 标签插槽中的内联图片预览工具栏按钮会跟随 Cascader，字号为 `14px`。

在应用入口引入生成的 CSS 文件，并为根 Provider 设置相同前缀。

```vue
<script setup lang="ts">
import { Button, ConfigProvider } from 'cool-design';

const themeVars = {
  '--acme-primary': '#126d58',
  '--acme-primary-hover': '#0e5847',
  '--acme-on-primary': '#ffffff'
};
</script>

<template>
  <ConfigProvider namespace="acme" :theme-vars="themeVars">
    <Button type="primary">保存配置</Button>
  </ConfigProvider>
</template>
```

子级省略 `namespace` 时继承最近的配置，也可以单独指定。局部混用、同一页面挂载多个 Vue 应用或运行时切换前缀时，为每个前缀单独编译并预加载样式。以数字开头的前缀需要 Sass 中的 CSS 转义。例如 DOM 前缀用 `namespace="3d"`，Sass 配置改为 `$namespace: "\\33 d"`。CSS 变量仍使用完整原名，如 `--3d-primary`。

`themeVars` 按原键合并和传递。切换前缀时，覆盖项与自定义 CSS 选择器也要匹配当前前缀。组件接收的 `class`、`style` 及 Space 的 `prefix-cls` 等调用方配置按原值使用。

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

Dialog、Tooltip、Popconfirm 和声明式 MessageBox 默认使用最近 ConfigProvider 提供的浮层宿主，继承命名空间、主题、尺寸和变量。对支持 `append-to` 的组件，显式传送到 `body` 或其他容器时，浮层同步最近的配置。对支持内联渲染的组件，可以将 `teleported` 设为 `false`，由原 DOM 作用域继承。调用方传入的浮层样式优先。

声明式弹窗放在 ConfigProvider 内即可。组合式 `useMessageBox()` 则应在 ConfigProvider **后代组件**的 setup 中调用；在渲染 ConfigProvider 的同一个组件 setup 中调用，无法读取这个组件将要提供的配置。

服务端渲染时，初始内联并会在水合后迁移的浮层，与首次打开时才渲染面板的浮层共享目标，可能使后者打开在错误容器。为受影响的浮层设置各自的初始目标，并把服务端生成的 Teleport HTML 写入对应容器。 [ConfigProvider 的「服务端渲染浮层」示例](#/components/config-provider)

通过插件安装得到的 `$message`、`$notify` 和 `$confirm` 从所属应用读取顶层配置。独立调用 `MessageBox.confirm()` 时，未传应用上下文则使用默认的 `i` 前缀和浅色配置。需要继承局部配置时，使用声明式组件或在后代组件中调用 `useMessageBox()`。 [MessageBox](#/components/message-box)

下面的演示可直接切换局部主题与尺寸；[ConfigProvider 文档](#/components/config-provider)提供完整配置 API。
