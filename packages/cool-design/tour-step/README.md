# TourStep 引导步骤

### 介绍

在 Tour 的默认插槽内声明步骤。存在声明式步骤时，Tour 使用这些步骤，数组形式的 `steps` 作为备用入口。

### 用法

```vue
<Tour v-model="open">
  <TourStep title="欢迎">查看功能介绍。</TourStep>
</Tour>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `target` | 目标元素或选择器 | `TourTarget` | — |
| `title` | 步骤标题 | `string` | — |
| `description` | 步骤内容 | `string` | — |
| `type` | 步骤主题 | `TourType` | 继承 Tour |
| `placement` | 浮层位置 | `TourPlacement` | 继承 Tour |
| `mask` | 遮罩设置 | `boolean` / `object` | 继承 Tour |
| `showArrow` | 显示箭头 | `boolean` | 继承 Tour |
| `showClose` | 显示关闭按钮 | `boolean` | 继承 Tour |
| `scrollIntoViewOptions` | 滚动目标配置 | `boolean` / `ScrollIntoViewOptions` | 继承 Tour |
| `nextButtonProps` / `prevButtonProps` | 设置按钮文本、禁用状态和回调 | `object` | — |

### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| `close` | 完成并关闭步骤 | — |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 步骤内容 |
| `header` | 步骤标题 |
