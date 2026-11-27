# Backtop 回到顶部

### 介绍

滚动到一定距离后显示回到顶部按钮，点击平滑回顶。

## 用法

```vue
<Backtop />
```

指定滚动容器与显示阈值：

```vue
<div class="scroll-wrap">
  <!-- 长内容 -->
  <Backtop target=".scroll-wrap" :visibility-height="400" :right="24" :bottom="24" />
</div>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `target` | 滚动容器选择器，默认监听 `window` | `string` | — |
| `visibility-height` | 显示按钮的滚动距离 | `number` | `200` |
| `right` | 距右边缘距离 | `number` | `40` |
| `bottom` | 距底边缘距离 | `number` | `40` |

### 事件

| 名称 | 说明 | 参数 |
| ---- | ---- | ---- |
| `click` | 点击按钮 | `MouseEvent` |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| `default` | 自定义按钮内容，默认为上箭头 |
