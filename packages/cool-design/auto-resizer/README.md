# AutoResizer 自动尺寸

### 介绍

观察容器内容区的宽高，为虚拟表格等需要明确尺寸的组件提供测量值。

### 用法

为外部容器设置高度，通过默认插槽将尺寸传给 `TableV2`。初始和服务端渲染阶段的尺寸均为 `0`。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `disableWidth` | 禁用宽度测量结果，该轴输出 `0` | `boolean` | `false` |
| `disableHeight` | 禁用高度测量结果，该轴输出 `0` | `boolean` | `false` |

### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| `resize` | 有效尺寸变化时触发 | `AutoResizerSize` |

### 插槽

| 插槽 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 接收内容区尺寸 | `{ width: number; height: number }` |
