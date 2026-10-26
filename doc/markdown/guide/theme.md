# 主题定制

通过 ConfigProvider 统一桌面应用的主题、控件尺寸和样式变量。局部配置可嵌套，未指定的配置继承父级。

## 浅色与深色

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, ConfigProvider, Space, Switch } from "cool-design";
import "cool-design/style.css";
const dark = ref(false);
</script>

<template>
    <ConfigProvider :theme="dark ? 'dark' : 'light'" size="default">
        <Space>
            <Switch v-model="dark">深色主题</Switch>
            <Button type="primary">保存修改</Button>
        </Space>
    </ConfigProvider>
</template>
```

## 桌面控件尺寸

| 配置      | 控件高度 | 常见场景                 |
| --------- | -------- | ------------------------ |
| `small`   | 28px     | 紧凑工具栏、表格行内操作 |
| `default` | 32px     | 管理后台常规表单         |
| `large`   | 40px     | 大尺寸表单、重点操作     |

Button、Input、Select 等读取尺寸配置；具体支持范围以组件 API 为准。

## 自定义颜色

使用完整的 CSS 变量名。设置主色时，同步设置悬停色和主色上的文字颜色，以保证文字对比度。

```vue
<script setup lang="ts">
import { Button, ConfigProvider } from "cool-design";
const themeVars = {
    "--i-primary": "#126d58",
    "--i-primary-hover": "#0e5847",
    "--i-on-primary": "#ffffff"
};
</script>

<template>
    <ConfigProvider :theme-vars="themeVars">
        <Button type="primary">保存配置</Button>
    </ConfigProvider>
</template>
```

### 常用变量

下列默认值为浅色主题配置。

| 变量                 | 用途         | 默认值    |
| -------------------- | ------------ | --------- |
| `--i-primary`        | 主色         | `#2463eb` |
| `--i-primary-hover`  | 主色悬停     | `#1d4ed8` |
| `--i-on-primary`     | 主色上的文字 | `#fff`    |
| `--i-success`        | 成功状态     | `#16815d` |
| `--i-warning`        | 警告状态     | `#b77909` |
| `--i-danger`         | 危险状态     | `#d73d4a` |
| `--i-text`           | 正文文字     | `#203047` |
| `--i-text-secondary` | 次要文字     | `#65748a` |
| `--i-bg`             | 内容背景     | `#fff`    |
| `--i-bg-page`        | 页面背景     | `#f3f6fa` |
| `--i-bg-subtle`      | 次级背景     | `#f7f9fc` |
| `--i-border`         | 边框         | `#dce3ed` |
| `--i-radius`         | 控件圆角     | `6px`     |

## 浮层主题

Dialog、Tooltip、Popconfirm 和 MessageBox 复用最近 ConfigProvider 的浮层宿主。组合式 `useMessageBox()` 应在 ConfigProvider 后代组件的 setup 中调用；在渲染 ConfigProvider 的同一个组件 setup 中调用，无法继承该组件将要提供的配置。

查看 [ConfigProvider 示例](#/components/config-provider) 或 [MessageBox 文档](#/components/message-box)。
