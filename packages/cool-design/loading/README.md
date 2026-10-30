# Loading 加载

### 介绍

展示加载状态，可使用区域遮罩阻止加载期间的鼠标和键盘交互。

## API

### 属性

| 参数       | 说明                         | 类型    | 默认值    |
| ---------- | ---------------------------- | ------- | --------- |
| loading    | 是否显示加载状态             | boolean | true      |
| text       | 加载提示文字                 | string  | 正在加载… |
| overlay    | 遮罩默认插槽内容，并阻止交互 | boolean | false     |
| fullscreen | 使用全屏加载层               | boolean | false     |
| background | 加载层背景色                 | string  | —         |

### 插槽

| 名称    | 说明                 |
| ------- | -------------------- |
| default | 被加载遮罩覆盖的内容 |

## 使用说明

- `loading`: 默认 true。
- `text`: 默认“正在加载…”。
- `overlay`: 默认 false；为 true 时遮罩默认插槽内容。

```vue
<Loading :loading="pending" overlay text="正在加载用户…">
  <div>列表或其他内容</div>
</Loading>
```

遮罩期间内容具有 inert 属性，并阻止点击和键盘事件；结束后恢复。`fullscreen` 使用固定全屏加载层，`background` 可覆盖背景色。无默认插槽时可独立显示状态。状态使用 role=status 和 aria-live=polite；减少动态效果偏好下停止旋转。Table 的 loading 属性已复用此组件。
