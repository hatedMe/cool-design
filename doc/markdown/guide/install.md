# 安装

Cool Design 是面向 PC 桌面应用的 Vue 3 组件库。安装组件库后，按 [快速上手](#/guide/quickstart) 引入组件和样式。

## 使用条件

| 项目       | 要求                                                     |
| ---------- | -------------------------------------------------------- |
| Vue        | `3.2.47` 及以上的 Vue 3 版本，与应用共用同一份 Vue       |
| 构建环境   | 支持 ES Modules 和 CSS 导入，例如使用 Vite 的 Vue 3 项目 |
| 浏览器     | 支持 CSS 自定义属性的现代桌面浏览器；不支持 IE           |
| TypeScript | 可选，组件包提供类型声明                                 |

已有 Vue 3 应用直接安装即可。本仓库源码开发使用 pnpm，`packageManager` 固定为 `pnpm@10.33.0`；当前验证环境为 Node.js `24.11.1`。

## 安装组件库

根据应用使用的包管理器选择一条命令：

```sh
# pnpm
pnpm add cool-design

# npm
npm install cool-design

# Yarn
yarn add cool-design
```

Vue 由应用安装和管理。如果项目还没有安装 Vue，请先添加 Vue 3：

```sh
pnpm add vue@3
```

## 引入样式

在应用入口引入一次组件样式，局部引入与全局注册都需要此步骤：

```ts
import 'cool-design/style.css';
```

图标字体包含在样式资源中，无需另行配置图标 CDN。主题通过 CSS 变量运行时设置，使用组件库不需要额外安装 Sass。

## 预览仓库源码

在本仓库根目录执行：

```sh
pnpm install
pnpm dev
```

打开终端输出的地址。文档站默认运行本仓库源码，组件效果可能先于 npm 发布版本。

| 命令                         | 用途                                |
| ---------------------------- | ----------------------------------- |
| `pnpm dev` / `pnpm dev:docs` | 启动 Vue 3 文档站                   |
| `pnpm build:docs`            | 构建文档到 `dist/docs`              |
| `pnpm preview:docs`          | 预览已构建的文档                    |
| `pnpm dev:examples`          | 独立启动用户管理业务示例            |
| `pnpm build`                 | 生成组件库 ESM、CommonJS 和类型声明 |

## 使用尚未发布的本地版本

如果 npm 版本没有包含文档中的组件，可在本仓库打包后安装到应用，不需要先发布：

```sh
# 在组件库根目录执行
pnpm install
pnpm build
pnpm pack
```

然后在应用目录安装生成的 `.tgz` 文件。路径和文件名按实际输出调整：

```sh
pnpm add ../meganeui/cool-design-3.0.0.tgz
```

安装后仍从 `cool-design` 和 `cool-design/style.css` 引入。

## 常见问题

### 组件没有样式

检查应用入口是否已引入 `cool-design/style.css`。直接从源码演示复制组件时，也需要保留应用入口的样式导入。

### 安装后找不到某个组件

检查应用安装的包版本，并确认该组件已由包入口导出；本地源码文档与 npm 发布版本可能不同。需要验证当前源码时，使用上面的本地打包方式。

### 全局组件名称无法识别

全局注册使用 `app.use(CoolDesign)`，模板名称为 `i-` 前缀，例如 `<i-button>`。局部引入可直接使用 `<Button>`，具体写法见 [快速上手](#/guide/quickstart)。
