# CollapseTransition 折叠过渡

### 介绍

为单个子元素提供高度和内边距过渡；支持 Vue Transition 的参数与生命周期监听。完成、取消或卸载时恢复临时样式。

## 用法

```vue
<CollapseTransition><div v-show="open">折叠内容</div></CollapseTransition>
```

## API

### 属性

无额外自定义属性，透传 `TransitionProps`，例如 `appear`、`css` 和 `duration`。

### 事件

透传 Vue Transition 生命周期，例如 `before-enter`、`after-enter`、`enter-cancelled`、`before-leave`、`after-leave`、`leave-cancelled`，参数为 `Element`。

### 插槽

| 名称 | 说明 |
| --- | --- |
| default | 单个可过渡元素，通常配合 `v-show` |
