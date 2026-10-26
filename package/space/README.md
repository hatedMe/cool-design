# Space 间距

-   `size`: small/default/large 对应 4/8/12px；也支持数字 px 或 `[行间距, 列间距]`。
-   `direction`: horizontal（默认）或 vertical。
-   `align`: start/end/center/baseline/stretch，默认 center。
-   `wrap`: 默认 true。

未指定 size 时继承 ConfigProvider。默认插槽中的元素以 Flex 排列，不额外包装每一项。
