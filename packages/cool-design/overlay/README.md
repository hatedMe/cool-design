# Overlay 遮罩

### 介绍

提供固定遮罩和完整点击判断，弹窗的显隐、滚动锁及关闭状态由调用方控制。

## 用法

```vue
<Overlay v-if="open" :z-index="2100" @click="open = false"><section>内容</section></Overlay>
```

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| mask | 启用遮罩样式；关闭时仍渲染固定容器 | `boolean` | `true` |
| custom-mask-event | 关闭默认遮罩点击处理 | `boolean` | `false` |
| overlay-class | 自定义 class | `string` / `array` / `object` / `boolean` | — |
| z-index | 层级 | `string` / `number` | — |

### 事件

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| click | 按下、释放与点击均发生在遮罩自身时触发；内容点击和拖动到遮罩不触发 | `MouseEvent` |

### 插槽

| 名称 | 说明 |
| --- | --- |
| default | 遮罩内内容 |
