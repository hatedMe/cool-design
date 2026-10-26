# Col 列布局

24 栅格的列，支持响应式宽度、偏移、位移与隐藏，继承最近一层 Row 的 gutter。

## API

| 属性                   | 类型                        | 默认 |
| ---------------------- | --------------------------- | ---- |
| tag                    | string                      | div  |
| span                   | number，0–24                | 24   |
| offset                 | number，左侧留白栅格数      | 0    |
| push / pull            | number，向右/左移动的栅格数 | 0    |
| xs / sm / md / lg / xl | number 或 ColSizeObject     | —    |

```ts
interface ColSizeObject {
    span?: number;
    offset?: number;
    push?: number;
    pull?: number;
}
type ColSize = number | ColSizeObject;
```

-   xs：窗口宽度 <768px；sm：≥768px；md：≥992px；lg：≥1200px；xl：≥1920px。
-   数字简写只设置 span；对象仅覆盖给出的字段。sm 及以上断点向更大尺寸继承，xs 仅在小屏生效。
-   span=0 隐藏该列；更大断点显式设置非零 span 可恢复。基础值用于没有匹配断点的字段。
-   offset 改变布局留白，push/pull 使用相对定位改变视觉位置，不改变 DOM/键盘阅读顺序；两者同时设置时以 push-pull 的差值位移。
-   栅格值按整数规范化到0–24。默认插槽放列内容。
