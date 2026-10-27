# Border 边框

边框、圆角和阴影是共享样式规范，不需要注册 Border 组件。统一引入 `cool-design/style.css` 后即可使用 CSS 变量。

## API

### 线条

| 变量                                      | 默认/用途                                     |
| ----------------------------------------- | --------------------------------------------- |
| --i-border-width                          | 1px                                           |
| --i-border-style                          | solid，可覆盖 dashed/dotted                   |
| --i-border-color                          | 引用既有 --i-border                           |
| --i-border-color-strong / light / lighter | 更强、较浅、最浅边框                          |
| --i-border-base                           | width、style、color 的组合，可直接用于 border |

### 圆角

| 变量              | 默认                         |
| ----------------- | ---------------------------- |
| --i-radius-none   | 0                            |
| --i-radius-small  | 4px                          |
| --i-radius-base   | 引用既有 --i-radius，默认6px |
| --i-radius-large  | 10px                         |
| --i-radius-round  | 20px                         |
| --i-radius-circle | 50%，需等宽高才能形成圆      |

### 阴影

--i-shadow-small/base/large/inset 提供小、基础、大和内阴影；base 引用既有 --i-shadow。--i-shadow-color 提供明暗主题下的共享阴影色。

支持 color-mix 时，多级边框色随 --i-border、背景与正文色变化；其他浏览器使用静态明暗回退。既有 --i-border、--i-radius、--i-shadow 继续有效。

```css
.panel {
  border: var(--i-border-base);
  border-radius: var(--i-radius-base);
  box-shadow: var(--i-shadow-small);
}
```
