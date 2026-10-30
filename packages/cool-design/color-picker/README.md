# ColorPicker 颜色选择器

### 介绍

颜色选择器用于选择颜色，支持透明度、预定义颜色、颜色格式和受控值。组件名称、事件名称与 Element Plus `ColorPicker` 保持一致；组件注册名为 `i-color-picker`。

> `Color` 色彩不是可注册组件，而是项目提供的 CSS 颜色变量和色板规范，详见 `packages/cool-design/color/README.md`。

## 用法

### 基础用法

```vue
<ColorPicker v-model="color" />
```

### 预定义颜色和透明度

```vue
<ColorPicker
  v-model="color"
  show-alpha
  color-format="rgb"
  :predefine="['#409eff', '#67c23a', '#f56c6c']"
/>
```

### 禁用状态

```vue
<ColorPicker v-model="color" disabled />
```

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `modelValue` | 当前颜色值 | `string` | `#409eff` |
| `show-alpha` | 是否支持透明度 | `boolean` | `false` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `color-format` | 输出颜色格式：`hex` / `rgb` / `hsl` / `hsv` | `string` | `hex` |
| `predefine` | 预定义颜色列表 | `string[]` | `[]` |
| `size` | 组件尺寸：`small` / `default` / `large` | `string` | `default` |
| `tabindex` | 触发器的 Tab 顺序 | `string` / `number` | `0` |
| `popper-class` | 面板自定义 class | `string` | `''` |

开启 `show-alpha` 后，`rgb` 输出为 `rgba(...)`，`hsl` 输出为 `hsla(...)`，`hex` 在透明度小于 1 时输出八位十六进制颜色。

### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| `update:modelValue` | 颜色实时变化时更新受控值 | `value: string` |
| `active-change` | 颜色或透明度实时变化时触发 | `value: string` |
| `change` | 颜色确认或选择预定义颜色后触发 | `value: string` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义触发器内容 |

### 暴露方法

通过模板 ref 可调用：

| 方法 | 说明 |
| --- | --- |
| `focus()` | 聚焦触发器 |
| `blur()` | 取消触发器焦点 |

> 当前版本使用原生颜色输入控件，不承诺 Element Plus 的完整调色板布局、`teleported`、`validate-event` 和 Popper 定位 API。
