# ConfigProvider 全局配置

### 介绍

为后代组件统一设置主题、控件尺寸、语言、空值策略和浮层基础层级，并提供浮层宿主。

### 基本用法

```vue
<script setup lang="ts">
import { ConfigProvider, en } from 'cool-design/config-provider';
</script>

<template>
  <ConfigProvider :locale="en" :z-index="3000" :empty-values="[null, undefined]" :value-on-clear="null">
    <!-- 放置需要共享配置的组件 -->
  </ConfigProvider>
</template>
```

嵌套 Provider 中省略的配置继承父级；显式设置的属性优先，`themeVars` 按变量名合并。

## API

### 属性

| 参数      | 说明                          | 类型                           | 默认值                 |
| --------- | ----------------------------- | ------------------------------ | ---------------------- |
| theme     | 主题：`light` / `dark`        | `string`                       | 继承父级，根级 `light` |
| size      | 尺寸：`small` / `default` / `large` | `string`                  | 继承父级，根级 `default` |
| themeVars | CSS 变量，使用完整变量名      | `Record<string, string>`       | 与父级变量合并         |
| locale | 语言对象，兼容 Element Plus 的 `{ name, el }` 结构 | `Language` | 继承父级，根级中文 |
| zIndex | `useZIndex` 使用的基础层级 | `number` | 继承父级，根级 `2000` |
| emptyValues | `useEmptyValues` 使用的空值集合 | `unknown[]` | 继承父级，未配置时 `['', undefined, null]` |
| valueOnClear | 清空后的值，每次实际清空时调用函数一次，函数形式可返回 `undefined` | `string / number / boolean / null / (() => unknown)` | 继承父级，根级 `undefined` |
| namespace | 命名空间，供 `useNamespace` 使用 | `string` | 继承父级，根级 `i` |
| button | Button 的默认配置 | `ButtonConfigContext` | 继承父级 |
| link | Link 的默认配置 | `LinkConfigContext` | 继承父级 |
| dialog | Dialog 的默认配置 | `DialogConfigContext` | 继承父级 |
| message | Message 的默认配置 | `MessageConfigContext` | 继承父级 |
| table | Table 的默认配置 | `TableConfigContext` | 继承父级 |

### 组件配置字段

字段基于 Element Plus `2.14.8`。嵌套 Provider 逐字段继承，更新配置会重算后代组件的默认值。组件自身的属性优先，包括显式的 `false` 和 `0`。

| 配置 | 可选字段 |
| --- | --- |
| `button` | `type`、`plain`、`text`、`round`、`dashed`、`autoInsertSpace` |
| `link` | `type`、`underline` |
| `dialog` | `alignCenter`、`draggable`、`overflow`、`transition` |
| `message` | `max`、`grouping`、`duration`、`offset`、`showClose`、`plain`、`placement` |
| `table` | `showOverflowTooltip`、`tooltipEffect`、`tooltipOptions`、`tooltipFormatter` |

```vue
<ConfigProvider :button="{ type: 'primary', round: true }">
  <ConfigProvider :button="{ dashed: true }">
    <Button :round="false">直角虚线按钮</Button>
  </ConfigProvider>
</ConfigProvider>
```

声明式 Message 读取最近 Provider 的 `duration`、`showClose` 和 `plain`。Message 服务在创建消息时读取应用的顶层 Provider，调用选项优先。同一应用存在多个顶层 Provider 时，最近创建的生效，卸载后恢复上一个。`max` 按应用和位置限制消息数，已分组的重复消息计为同一条。

### 事件

无。

### 插槽

| 名称    | 说明               |
| ------- | ------------------ |
| default | 需要继承配置的内容 |

## 使用说明

属性：`theme?: 'light' | 'dark'`、`size?: 'small' | 'default' | 'large'`、`themeVars?: Record<string, string>`。省略时继承父配置，根默认为 light/default。变量使用完整名称，例如 `{'--i-primary': '#2463eb', '--i-on-primary': '#fff'}`。

默认插槽放内容。Dialog 在容器生成的浮层宿主中渲染。默认宿主类名为 `.i-overlay-host`，设置 `namespace="acme"` 时为 `.acme-overlay-host`。嵌套合并父级自定义变量，子级同名变量优先。

### 语言与支持范围

从 `cool-design/config-provider` 可导入 `zhCn`、`en` 和 `useLocale`。内置语言对象仅包含 Select、Table、ColorPicker、Empty 的基础文案；也可以直接传入 Element Plus 的语言对象。`useLocale().t('el.select.placeholder', '请选择')` 按路径读取字符串，缺失路径使用后备文案。具体组件须调用该工具才会响应语言切换。

### 自定义 CSS 前缀

组件库内部生成的样式类名、CSS 变量和内置动画随命名空间更新。组件导入名和原有注册名（如 `i-button`、`IButton`、`ElButton`）保持原样。子级省略 `namespace` 时继承最近的 Provider，也可显式覆盖。

默认前缀 `i` 使用 npm 包随附的 `cool-design/style.css`。自定义前缀需要从源码使用相同命名空间预编译完整 Sass 样式。例如启用 `namespace="acme"` 前，先配置 Sass 的 `$namespace: 'acme'`。局部混用、多个应用同时使用或运行时切换前缀时，预先加载每个前缀对应的 CSS。 [主题指南](#/guide/theme)

`themeVars` 的键按原值合并和传递。使用 `acme` 时将自己的变量覆盖写为 `--acme-primary`、`--acme-main-padding` 等完整名称。Space 的 `prefix-cls` 继续使用调用方提供的值。

浮层默认从最近的宿主继承配置。支持外置挂载的浮层同步最近的主题配置，支持内联模式的浮层按 DOM 作用域继承。通过插件安装的 `$message`、`$notify` 和 `$confirm` 读取所属应用的顶层配置。在同一应用的 Provider 后代组件 `setup` 中调用 `$loading` 创建遮罩时，优先使用最近 Provider 的配置。需要从局部 Provider 打开命令式消息框时，在后代组件内使用 `useMessageBox()`。

`zIndex` 作用于使用 `useZIndex` 的锚定浮层以及 Dialog、Drawer；组件自身的 `zIndex` 属性优先。Message、Notification 服务默认从所属应用的层级递增，服务选项中显式传入的 `zIndex` 优先。空值配置由 `useEmptyValues` 读取，具体组件是否支持以组件 API 为准。

### 服务端与客户端的 ID

`useId` 从当前 Vue 应用分配 ID。默认种子是 `{ prefix: 0, current: 0 }`。每次调用保留一个序号，非空显式 ID 优先。切换命名空间或移除显式 ID 时，后备 ID 沿用原序号。Provider 继承最近的 `idKey` 注入；同一页面挂载多个独立应用时，请为每个应用选用不同的数字 `prefix`。

服务端和客户端可以共用以下工厂。每次请求创建新应用，客户端水合时传入该应用相同的初始种子，保持两端组件树与调用顺序一致。

```ts
import { createSSRApp } from 'vue'
import { idKey, type IdInjection } from 'cool-design/hooks'
import App from './App.vue'

export function createPage(initial: IdInjection) {
  const app = createSSRApp(App)
  app.provide(idKey, { ...initial })
  return app
}
```

```ts
// 服务端请求处理函数中
const initial = { prefix: 42, current: 10 }
const html = await renderToString(createPage(initial))
// 将 html 写入 #app，并随页面数据传递 initial（current 仍为 10）。
```

```ts
// 客户端入口，pageData.initial 是服务端传来的初始值
createPage(pageData.initial).mount('#app')
```

此约定适用于使用 `useId` 的组件，例如 TimeSelect。组件实例之外也可调用该工具；此时自动 ID 使用本地随机前缀，跨端复用请传入显式 ID。

### 服务端渲染浮层

在 Vue `3.2.47` 和 `3.4.15` 中，如果两个 Teleport 在水合时共享同一个目标，一个浮层初始内联，另一个浮层带有延迟渲染的过渡内容，那么前者的面板在内联和外置之间往返后，后者首次打开可能插入错误的容器。共享目标为默认的 `body` 或同一个专用容器时，都可能出现这种情况。遇到这类组合时，请为每个受影响的浮层指定独立且稳定的初始目标。 [Vue SSR 的 Teleport 说明](https://vuejs.org/guide/scaling-up/ssr.html#teleports)

下面的两个 Tooltip 通过 `appendTo` 分别指定 `#ssr-a` 和 `#ssr-b`。A 初始内联且可见，点击按钮可将原面板移到 `#external`，再次点击移回内联。B 在首次悬停时打开，面板进入 `#ssr-b`。两端共用同一个工厂，每次调用创建新应用并复制数字 ID 种子。

```js
// app.js
import { createSSRApp, h, ref } from 'vue'
import { ConfigProvider, Tooltip } from 'cool-design'
import { idKey } from 'cool-design/hooks'

export function createPage(initial) {
  const app = createSSRApp({
    setup() {
      const moved = ref(false)
      return () => h(ConfigProvider, null, () => [
        h('button', { type: 'button', onClick: () => { moved.value = !moved.value } }, '切换 A 的挂载位置'),
        h('section', { id: 'a-frame' }, h(Tooltip, {
          content: '说明 A', visible: true, persistent: true, placement: 'right',
          teleported: moved.value,
          appendTo: moved.value ? '#external' : '#ssr-a',
        }, () => h('button', { type: 'button', id: 'a-trigger' }, 'A'))),
        h('section', { id: 'b-frame' }, h(Tooltip, {
          content: '说明 B', appendTo: '#ssr-b',
        }, () => h('button', { type: 'button', id: 'b-trigger' }, 'B'))),
      ])
    },
  })
  app.provide(idKey, { ...initial })
  return app
}
```

在服务端请求处理函数中调用 `renderPage()`。把 Vue 生成的主树 HTML 放进 `#app`，并将 `ctx.teleports` 中各选择器的 HTML 原样写入对应容器，保留其中的注释锚点。页面在客户端入口执行前就应包含这些容器。

```js
// server.js
import { renderToString } from 'vue/server-renderer'
import { createPage } from './app.js'

export async function renderPage() {
  const initial = { prefix: 42, current: 10 }
  const ctx = {}
  const html = await renderToString(createPage(initial), ctx)
  const teleports = ctx.teleports ?? {}

  // 以下是服务端页面模板中各段 Vue 渲染结果的位置。
  return `<!doctype html>
<meta charset="utf-8">
<link rel="stylesheet" href="/client.css">
<div id="app" data-prefix="${initial.prefix}" data-current="${initial.current}">${html}</div>
<div id="ssr-a">${teleports['#ssr-a'] ?? ''}</div>
<div id="ssr-b">${teleports['#ssr-b'] ?? ''}</div>
<div id="external">${teleports['#external'] ?? ''}</div>
<script type="module" src="/client.js"></script>`
}
```

在浏览器入口读取服务端传来的初始数字，使用相同的初始组件树和目标水合。示例模板中的资源路径对应客户端入口及其样式的构建输出。

```js
// client.js
import { createPage } from './app.js'
import 'cool-design/style.css'

const container = document.querySelector('#app')
createPage({
  prefix: Number(container.dataset.prefix),
  current: Number(container.dataset.current),
}).mount(container)
```

### 空值工具迁移

使用 `cool-design/hooks` 的 `useEmptyValues` 时，`valueOnClear.value` 现在表示原始配置，可能是函数。执行清空操作时调用 `getValueOnClear(defaultValue)` 取得结果。清空工厂返回 `undefined` 时，该结果会直接传回。

### 实验配置

`experimental-features` 的类型为 `Record<string, never>`，默认为未设置，支持嵌套继承。Element Plus `2.14.8` 的该配置仍为空的预留接口，没有可启用的实验功能；不会虚构开关或改变 SelectV2 行为。
