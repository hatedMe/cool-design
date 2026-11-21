# ColorPickerPanel 颜色面板

### 介绍

独立颜色编辑面板。可通过色相、饱和度、亮度、透明度、文本和预设项修改颜色。

### 用法

```vue
<ColorPickerPanel v-model="color" show-alpha />
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `modelValue` | 当前颜色 | `string` | `''` |
| `border` | 显示边框 | `boolean` | `true` |
| `disabled` | 禁用编辑 | `boolean` | `false` |
| `showAlpha` | 编辑透明度 | `boolean` | `false` |
| `colorFormat` | 输出颜色格式 | `ColorFormat` | 有透明度时 `rgb`，其余 `hex` |
| `predefine` | 预设颜色 | `string[]` | `[]` |
| `validateEvent` | 触发表单校验 | `boolean` | `true` |
| `hueSliderClass` | 色相滑块类名 | `string` | — |
| `hueSliderStyle` | 色相滑块样式 | `StyleValue` | — |

### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| `update:modelValue` | 编辑颜色时更新 | `value: string` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `footer` | 文本输入下方的自定义操作 |

实例公开 `color`、`inputRef` 和 `update()`。
