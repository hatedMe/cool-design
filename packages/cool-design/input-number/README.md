# InputNumber 计数器

用于输入或调整一个数值。

## 基础用法

```vue
<template>
  <InputNumber v-model="value" :min="1" :max="10" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const value = ref(1);
</script>
```

## 步长与精度

```vue
<InputNumber v-model="value" :step="0.1" :precision="2" />
<InputNumber v-model="value" :step="5" :step-strictly="true" />
```

## 控制按钮

```vue
<InputNumber v-model="value" :controls="false" />
<InputNumber v-model="value" controls-position="right" />
```

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `v-model` / `model-value` | 绑定值 | `number \| null` | `0` |
| `min` | 最小值 | `number` | `Number.MIN_SAFE_INTEGER` |
| `max` | 最大值 | `number` | `Number.MAX_SAFE_INTEGER` |
| `step` | 步长 | `number` | `1` |
| `step-strictly` | 是否限制为步长的倍数 | `boolean` | `false` |
| `precision` | 小数精度 | `number` | 根据 `step` 推导 |
| `controls` | 是否显示控制按钮 | `boolean` | `true` |
| `controls-position` | 控制按钮位置：`default` / `right` | `string` | `default` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `readonly` | 是否只读 | `boolean` | `false` |
| `size` | 尺寸：`large` / `default` / `small` | `string` | `default` |
| `placeholder` | 输入框占位文本 | `string` | — |
| `formatter` | 格式化展示值 | `(value) => string` | — |
| `parser` | 将展示文本解析为数值 | `(value) => number \| null` | — |
| `value-on-clear` | 清空时的值：`min` / `max` / 数值 / `null` | `number \| null \| string` | `null` |

### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| `update:modelValue` | 数值更新时触发 | `(value: number \| null)` |
| `change` | 数值确认变化时触发 | `(value: number \| null)` |
| `focus` | 输入框获得焦点时触发 | `(event: FocusEvent)` |
| `blur` | 输入框失去焦点时触发 | `(event: FocusEvent)` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `prefix` | 输入框前缀 |
| `suffix` | 输入框后缀 |
| `increase-icon` | 增加按钮内容 |
| `decrease-icon` | 减少按钮内容 |

### 方法

通过组件 ref 调用：

- `focus()`：聚焦输入框
- `blur()`：让输入框失去焦点
