# Avatar 头像

源码已修复，尚未加入首版公开入口。

- `url`：图片地址，默认空。
- `shape`：`circle | square`，默认 `square`。
- `size`：`large | medium | small | number`，默认 `large`；数字单位为 px。
- `fit`：`fill | contain | cover | none | scale-down`，默认 `cover`。
- `icon`：图标字体类名，例如 `icon-close`。
- 默认插槽可显示文字。属性更新后重新渲染；图片加载失败回退尚未实现。
