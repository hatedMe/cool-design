# Color 色彩

颜色是样式规范，通过 CSS 变量提供，不存在需要注册的 Color 组件。统一引入 `cool-design/style.css`，使用 ConfigProvider 切换 light/dark 或传入 themeVars。

## API

### 语义色

| 变量           | 用途               |
| -------------- | ------------------ |
| --i-primary    | 主操作、选中和焦点 |
| --i-on-primary | 主色上的文字       |
| --i-success    | 成功、启用         |
| --i-warning    | 警告、待处理       |
| --i-danger     | 危险、错误         |
| --i-info       | 一般信息           |

每个语义色（primary/success/warning/danger/info）提供 light-3/5/7/8/9 和 dark-2，例如 `--i-primary-light-9`。light-N 将语义色与当前主题背景按 N×10% 混合，dark-2 将语义色与当前正文色按20%混合，用于增强状态；深色下同样按语义生成。

支持 CSS color-mix 的浏览器中，改变基础色、背景或正文色会自动更新派生色；其他浏览器使用内置明暗色阶回退。可以直接覆盖任意派生变量。自定义主色时应同时考虑 --i-on-primary 的可读性，系统不自动保证任意配色的对比度。

### 中性色

| 变量                                           | 用途                         |
| ---------------------------------------------- | ---------------------------- |
| --i-text / --i-text-secondary / --i-text-muted | 主要、次要、弱化文字         |
| --i-bg / --i-bg-page / --i-bg-subtle           | 内容、页面、浅层背景         |
| --i-primary-hover                              | 主操作悬停，默认引用增强主色 |

```vue
<ConfigProvider :theme-vars="{ '--i-primary': '#7c3aed', '--i-on-primary': '#ffffff' }">
  <Button type="primary">保存</Button>
</ConfigProvider>
```

颜色需与文字、图标或形状共同表达状态，不仅依赖红绿区分。
