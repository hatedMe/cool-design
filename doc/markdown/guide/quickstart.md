# 快速开始

Cool Design 是基于 Vue 3 的 PC 组件库，适合管理后台、桌面表单和数据列表。文档中的示例直接运行当前源码，可查看、操作并复制完整 Vue 文件。

## 本地预览

在项目根目录执行：

```sh
pnpm install
pnpm dev
```

打开终端输出的本地地址。左侧查找组件，正文查看交互效果，点击“查看代码”或“复制代码”获取示例。右上角可切换浅色、深色主题，或进入用户管理业务示例。

```sh
# 独立构建、预览文档站
pnpm build:docs
pnpm preview:docs

# 单独启动原有用户管理示例
pnpm dev:examples
```

## 在项目中使用

已有 Vue 3 项目安装组件库，并引入一次全局样式：

```sh
pnpm add cool-design
```

本地开发中的组件能力以当前源码为准；若已发布的 npm 版本尚未包含所需组件，可在本仓库执行 `pnpm build`、`pnpm pack`，在应用中安装生成的压缩包验证。

### 局部引入

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, ConfigProvider, Input, Space } from "cool-design";
import "cool-design/style.css";

const name = ref("");
</script>

<template>
    <ConfigProvider>
        <Space>
            <Input v-model="name" placeholder="请输入姓名" aria-label="姓名" />
            <Button type="primary">查询</Button>
        </Space>
    </ConfigProvider>
</template>
```

### 全局注册

```ts
import { createApp } from "vue";
import CoolDesign from "cool-design";
import "cool-design/style.css";
import App from "./App.vue";

createApp(App).use(CoolDesign).mount("#app");
```

全局注册后的组件使用 `i-` 前缀，例如 `<i-button>`、`<i-input>`。建议在应用根部使用 `ConfigProvider`，统一主题、尺寸和浮层宿主。

## 常见约定

-   表单控件使用 Vue 3 的 `v-model`；分页使用 `v-model:current-page`。
-   桌面控件尺寸为 `small`、`default`、`large`；支持尺寸继承的组件会读取 `ConfigProvider`。
-   表格排序和分页由页面响应事件更新数据，组件不自动请求接口。
-   点击按钮提交表单时显式设置 `native-type="submit"`。
-   导航仅列出当前公开导出的组件；历史目录中尚未发布的组件不作为稳定能力展示。

## 维护文档与示例

每个组件的 `package/组件名/README.md` 描述用途、限制和 API；`demo/*.vue` 提供可运行示例，`doc/site/catalog.ts` 配置分类、标题与示例顺序。站点读取同一份示例源码展示，仅将仓库内导入路径替换为 `cool-design`，无需另抄一份示例代码。
