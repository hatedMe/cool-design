# ConfigProvider 全局配置

属性：`theme?: 'light' | 'dark'`、`size?: 'small' | 'default' | 'large'`、`themeVars?: Record<string, string>`。省略时继承父配置，根默认为 light/default。变量使用完整名称，例如 `{'--i-primary': '#2463eb', '--i-on-primary': '#fff'}`。

默认插槽放内容。容器生成 `.i-overlay-host`，Dialog 在其中渲染。嵌套合并父级自定义变量，子级同名变量优先。
