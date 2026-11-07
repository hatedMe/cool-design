# Rate 评分

### 介绍

评分组件用于展示和选择 0 到最大值之间的评分，支持整数、半星、辅助文字、分数、颜色和自定义图标。

## 基础用法

示例中的 `Rate` 需要从 `cool-design/rate` 显式导入：

```ts
import Rate from 'cool-design/rate';
```

```vue
<Rate v-model="value" />
```

## 半星、尺寸与禁用

```vue
<Rate v-model="value" allow-half />
<Rate :model-value="3" size="large" />
<Rate :model-value="4" disabled />
```

## 辅助文字和分数

```vue
<Rate v-model="value" show-text :texts="['很差', '较差', '一般', '较好', '很好']" />
<Rate v-model="value" show-score score-template="{value} 分" />
```

同时设置 `showText` 和 `showScore` 时优先显示分数。

## 自定义图标与颜色

```vue
<Rate :model-value="3" :icons="['icon-collection_fill', 'icon-browse_fill', 'icon-coupons_fill']" />
<Rate :model-value="4" :colors="['#f56c6c', '#e6a23c', '#67c23a']" />
```

`icons` 和 `colors` 支持三元素数组或按阈值分段的对象；对象可以使用 `excluded` 排除指定评分。

## 只读与清零

设置 `disabled` 可只读展示并禁止鼠标和键盘交互。设置 `clearable` 后再次点击当前评分可以清零。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 当前评分 | `number` | `0` |
| max | 最大评分 | `number` | `5` |
| size | 尺寸 | `RateSize`（`large` / `default` / `small`） | `default` |
| disabled | 禁用交互 | `boolean` | `false` |
| allowHalf | 允许半星 | `boolean` | `false` |
| lowThreshold | 低分阈值 | `number` | `2` |
| highThreshold | 高分阈值 | `number` | `4` |
| colors | 评分颜色 | `string` / `string[]` / `RateThresholdMap<string>` | — |
| voidColor | 空评分颜色 | `string` | — |
| disabledVoidColor | 禁用时空评分颜色 | `string` | — |
| icons | 评分图标 | `RateIconMap` | `icon-collection_fill` |
| voidIcon | 空评分图标 | `RateIcon` | `icon-collection_fill` |
| disabledVoidIcon | 禁用时空评分图标 | `RateIcon` | `icon-collection_fill` |
| showText | 显示辅助文字 | `boolean` | `false` |
| showScore | 显示分数 | `boolean` | `false` |
| textColor | 文本颜色 | `string` | — |
| texts | 辅助文字列表 | `string[]` | `[]` |
| scoreTemplate | 分数模板，`{value}` 替换为评分 | `string` | `{value}` |
| clearable | 允许再次点击清零 | `boolean` | `false` |
| id | 根元素 ID | `string` | — |
| ariaLabel | 无障碍标签 | `string` | — |
| label | 根元素标题 | `string` | — |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 评分更新 | `value: number` |
| change | 评分提交 | `value: number` |

### 暴露方法

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| setCurrentValue | 设置当前评分并归一化 | `value: number` |
| resetCurrentValue | 恢复最近一次提交的评分 | — |

### 插槽

组件没有默认插槽；图标通过 `icons`、`voidIcon` 和 `disabledVoidIcon` 传入字符串或 Vue 组件。
