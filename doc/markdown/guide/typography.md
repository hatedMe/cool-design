# 排版规范

### 介绍

统一的字体约定，保证各平台最佳展示效果（对齐 Element Plus Typography 规范）。

## 字号阶梯

| 级别 | Token | 默认值 | 用途 |
| --- | --- | --- | --- |
| Extra Small | `--i-font-size-extra-small` | `12px` | 辅助文本 |
| Small | `--i-font-size-small` | `13px` | 正文（小） |
| Base | `--i-font-size-base` | `14px` | 正文 |
| Medium | `--i-font-size-medium` | `16px` | 小标题 |
| Large | `--i-font-size-large` | `18px` | 标题 |
| Extra Large | `--i-font-size-extra-large` | `20px` | 主标题 |

正文默认字号沿用 `--i-font-size`（`14px`）。

## 行高

| Token | 默认值 | 说明 |
| --- | --- | --- |
| `--i-line-height-tight` | `1` | 无行高 |
| `--i-line-height-compact` | `1.3` | 紧凑 |
| `--i-line-height-normal` | `1.5` | 常规（默认） |
| `--i-line-height-loose` | `1.7` | 宽松 |

## 字体栈

```css
font-family:
  Inter, 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
  sans-serif;
```

对应 token：`--i-font-family`。组件根容器默认应用 `--i-font-size` / `--i-line-height-normal` / `--i-font-family`。

## 与组件配合

行内文本场景请使用 `Text` 组件（语义色、截断、多行省略），标题与正文排版可直接引用上述 token。
