# ColorPicker 颜色选择器

### 介绍

颜色选择器用于选择颜色，支持透明度、预定义颜色、颜色格式和受控值。组件注册名为 `i-color-picker`。

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

预览颜色、透明度或预定义颜色时仅触发 `active-change`，点击“确定”后才更新 `v-model` 并触发 `change`。点击“清空”默认提交 `null`；关闭面板会放弃未确认的预览。面板默认传送到 ConfigProvider 的浮层宿主，未配置宿主时挂载到 `body`。可通过 `append-to` 指定容器，或设置 `:teleported="false"` 在原位置渲染。

### 禁用状态

```vue
<ColorPicker v-model="color" disabled />
```

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `model-value` | 当前颜色值，显式绑定 `undefined` 时按空值处理 | `string \| number \| boolean \| null` | 省略时为 `#409eff` |
| `empty-values` | 视为空的模型值 | `unknown[]` | 继承 ConfigProvider |
| `value-on-clear` | 清空值或工厂 | `string \| number \| boolean \| null \| (() => unknown)` | 继承 ConfigProvider，根级 `null` |
| `clearable` | 是否显示清空按钮 | `boolean` | `true` |
| `teleported` | 是否传送面板 | `boolean` | `true` |
| `append-to` | 面板挂载目标，选择器或元素 | `string` / `HTMLElement` | ConfigProvider 浮层宿主或 `body` |
| `show-alpha` | 是否支持透明度 | `boolean` | `false` |
| `disabled` | 是否禁用；表单内继承 FormItem 的禁用状态 | `boolean` | `false` |
| `color-format` | 输出颜色格式：`hex` / `rgb` / `hsl` / `hsv` | `string` | `hex` |
| `predefine` | 预定义颜色列表 | `string[]` | `[]` |
| `size` | 组件尺寸：`small` / `default` / `large` | `string` | 继承 FormItem、Form 或 ConfigProvider |
| `tabindex` | 触发器的 Tab 顺序 | `string` / `number` | `0` |
| `popper-class` | 面板自定义 class | `string` | `''` |
| `validate-event` | 确认颜色后是否触发表单校验 | `boolean` | `true` |

开启 `show-alpha` 后，`rgb` 输出为 `rgba(...)`，`hsl` 输出为 `hsla(...)`，`hex` 在透明度小于 1 时输出八位十六进制颜色。置于 `FormItem` 内时自动继承禁用状态、绑定字段 `id` / `aria-describedby`，`change` 事件联动表单校验。

### 事件

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| `update:modelValue` | 确认或清空时更新受控值 | `value: string \| number \| boolean \| null \| undefined` |
| `active-change` | 颜色或透明度实时变化时触发 | `value: string` |
| `clear` | 点击清空时触发 | 无参数 |
| `change` | 点击确定或清空时触发 | `value: string \| number \| boolean \| null \| undefined` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义触发器内容 |

### 暴露方法

通过模板 ref 可调用：

| 方法 | 说明 |
| --- | --- |
| `show()` | 打开面板，禁用时无效 |
| `hide()` | 关闭面板，放弃未确认预览 |
| `focus()` | 聚焦触发器 |
| `blur()` | 取消触发器焦点 |

> 当前版本使用原生颜色输入控件，支持确认、清空及基础浮层定位，不包含完整调色板布局与完整 Popper 配置 API。

`persistent` 默认为 `true`，首次打开后保留隐藏的编辑面板。设置为 `false` 时关闭即卸载。`popperStyle` 将自定义样式应用到浮层。编辑中的颜色仅触发 `active-change`，确认才提交，关闭后重新打开会从已提交的颜色开始。
