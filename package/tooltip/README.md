# Tooltip 文字提示

-   `content`: 纯文本说明；`content` 插槽可覆盖。
-   `placement`: top（默认）/bottom/left/right。
-   `disabled`: 默认 false。
-   默认插槽：放一个可聚焦的触发元素，例如 Button；交互内容应使用其他浮层组件。

悬停或聚焦显示，Esc 关闭；触发元素与提示通过 aria-describedby 关联。指针可以移入提示阅读；离开后短暂延迟隐藏。浮层自动翻转并约束在视口，随滚动、缩放及元素尺寸变化更新位置；继承 ConfigProvider 浮层宿主主题。卸载清理定时器、观察器与事件。

本期支持四个居中方向，不支持箭头、延迟参数、虚拟触发器或交互表单内容。
