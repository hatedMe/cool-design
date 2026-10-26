# Loading 加载

-   `loading`: 默认 true。
-   `text`: 默认“正在加载…”。
-   `overlay`: 默认 false；为 true 时遮罩默认插槽内容。

```vue
<Loading :loading="pending" overlay text="正在加载用户…">
  <div>列表或其他内容</div>
</Loading>
```

遮罩期间内容具有 inert 属性，并阻止点击和键盘事件；结束后恢复。无默认插槽时可独立显示状态。状态使用 role=status 和 aria-live=polite；减少动态效果偏好下停止旋转。Table 的 loading 属性已复用此组件。
