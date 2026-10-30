# ConfigProvider 全局配置

### 介绍

为后代组件统一设置主题、控件尺寸和样式变量，并提供浮层宿主。

## API

### 属性

| 参数      | 说明                          | 类型                   | 默认值                 |
| --------- | ----------------------------- | ---------------------- | ---------------------- |
| theme     | 主题：light / dark            | string                 | 继承父级，根级 light   |
| size      | 尺寸：small / default / large | string                 | 继承父级，根级 default |
| themeVars | CSS 变量，使用完整变量名      | Record<string, string> | 与父级变量合并         |

### 插槽

| 名称    | 说明               |
| ------- | ------------------ |
| default | 需要继承配置的内容 |

## 使用说明

属性：`theme?: 'light' | 'dark'`、`size?: 'small' | 'default' | 'large'`、`themeVars?: Record<string, string>`。省略时继承父配置，根默认为 light/default。变量使用完整名称，例如 `{'--i-primary': '#2463eb', '--i-on-primary': '#fff'}`。

默认插槽放内容。容器生成 `.i-overlay-host`，Dialog 在其中渲染。嵌套合并父级自定义变量，子级同名变量优先。
