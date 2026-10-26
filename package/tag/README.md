# Tag 标签

-   `type`: primary（默认）/success/warning/danger/info。
-   `effect`: light（默认）/plain/dark。
-   `size`: small/default/large，未设置时继承 ConfigProvider。
-   `color`: 可选自定义状态颜色，覆盖默认主题状态色。
-   `closable`: 默认 false。
-   `disabled`: 默认 false，禁用点击与关闭。
-   默认插槽：支持文本与复杂内容。
-   `click(event)`、`close(event)`：关闭按钮不冒泡 click，仅发出 close，不自行删除标签。
