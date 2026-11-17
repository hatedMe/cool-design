# Segmented 分段控制器

### 介绍

在一组互斥选项中切换，视觉上呈分段按钮形态，适合视图/模式切换等紧凑场景。

## 基础用法

`options` 支持字符串、数字或 `{ label, value, disabled }` 对象，选中值通过 `v-model` 绑定。

```vue
<Segmented v-model="view" :options="['列表', '卡片', '日历']" />
```

## API

### 属性

| 参数        | 说明                                                     | 类型                                     | 默认值 |
| ----------- | -------------------------------------------------------- | ---------------------------------------- | ------ |
| `options`   | 选项列表                                                 | `(string \| number \| SegmentedOption)[]` | `[]`   |
| `modelValue` | 选中值（`v-model`）                                     | `string` / `number`                      | —      |
| `disabled`  | 是否禁用整个组件                                         | `boolean`                                | `false` |
| `size`      | 尺寸：`small` / `default` / `large`                      | `string`                                 | —      |

`SegmentedOption`：`{ label?: string; value: string | number; disabled?: boolean }`。

### 事件

| 事件名              | 说明               | 回调参数                  |
| ------------------- | ------------------ | ------------------------- |
| `update:modelValue` | 选中值变化         | `value`                   |
| `change`            | 用户切换选中项     | `value`                   |

### 插槽

无。

### 交互

支持键盘操作：方向键在可用选项间移动并切换选中态（roving tabindex）。
