# Button 按钮

## 组件介绍

Button 用于触发提交、保存、删除、跳转等操作。组件的属性、事件和插槽遵循通用 Button 组件规范，支持类型、尺寸、禁用、加载、图标、文字按钮、链接按钮、自定义颜色和自定义标签。

## 基础用法

使用 `type` 区分按钮语义。可选值为 `default`、`primary`、`success`、`warning`、`danger`、`info`。

## 朴素、圆角和虚线按钮

`plain`、`round` 和 `dashed` 可以与任意按钮类型组合使用。

## 禁用按钮

设置 `disabled` 后，按钮不会触发 `click` 事件。设置 `loading` 也会阻止点击。

## Link 按钮

设置 `link` 显示无边框链接按钮，`type` 仍然决定按钮颜色。

## Text 按钮

设置 `text` 显示文字按钮。 `bg` 只对文字按钮生效，用于始终显示浅色背景。 `type="text"` 作为旧版 API 兼容写法，推荐使用 `text` 属性。

## 图标按钮

使用 `icon` 添加图标。图标按钮可以只显示图标，也可以同时显示文字。纯图标按钮必须提供 `aria-label`。

也可以使用 `icon` 插槽自定义图标。

## 按钮组

使用 `ButtonGroup` 将多个按钮组合在一起。按钮组可以统一设置 `type`、`size` 和 `direction`，子按钮显式传入的属性优先级更高。

## 加载按钮

设置 `loading` 显示加载状态。可以使用 `loadingIcon` 或 `loading` 插槽自定义加载内容，`loading` 插槽优先级更高。

## 尺寸

`size` 支持 `large`、`default`、`small`。项目兼容值 `normal` 会映射为 `default`。

## 自定义标签

使用 `tag` 将按钮渲染为 `button`、`a`、`div` 或其他 Vue 组件。使用链接标签时，`href`、`target` 等原生属性会透传。

## 自定义颜色

使用 `color` 设置按钮颜色，组件会计算 hover 和 active 状态。 `color` 同样支持 `plain`、`link`、`text` 和 `bg` 组合。

## 自动插入中文空格

设置 `autoInsertSpace` 后，两个中文字符之间会自动增加视觉间距。

## API

### Button 属性

| 参数              | 说明                         | 类型                  | 默认值         |
| ----------------- | ---------------------------- | --------------------- | -------------- |
| `type`            | 按钮类型                     | `ButtonType`          | `default`      |
| `size`            | 按钮尺寸                     | `ButtonSize`          | 继承全局尺寸   |
| `plain`           | 是否为朴素按钮               | `boolean`             | `false`        |
| `text`            | 是否为文字按钮               | `boolean`             | `false`        |
| `bg`              | 文字按钮是否始终显示背景     | `boolean`             | `false`        |
| `link`            | 是否为链接按钮               | `boolean`             | `false`        |
| `round`           | 是否为圆角按钮               | `boolean`             | `false`        |
| `circle`          | 是否为圆形按钮               | `boolean`             | `false`        |
| `dashed`          | 是否使用虚线边框             | `boolean`             | `false`        |
| `loading`         | 是否为加载状态               | `boolean`             | `false`        |
| `loadingIcon`     | 加载图标                     | `string \| Component` | `icon-refresh` |
| `disabled`        | 是否禁用按钮                 | `boolean`             | `false`        |
| `autofocus`       | 是否自动获取焦点             | `boolean`             | `false`        |
| `icon`            | 图标                         | `string \| Component` | —              |
| `nativeType`      | 原生按钮类型                 | `ButtonNativeType`    | `button`       |
| `autoInsertSpace` | 两个中文字符之间自动插入空格 | `boolean`             | `false`        |
| `color`           | 自定义按钮颜色               | `string`              | —              |
| `dark`            | 自定义颜色的暗色模式         | `boolean`             | `false`        |
| `tag`             | 自定义渲染标签或组件         | `string \| Component` | `button`       |

### Button 事件

| 事件名  | 说明           | 回调参数            |
| ------- | -------------- | ------------------- |
| `click` | 按钮可用时触发 | `event: MouseEvent` |

禁用或加载状态下不会触发 `click`。`form`、`href`、`aria-label`、`target` 等未声明的原生属性会透传。

### Button 插槽

| 插槽名    | 说明                                 |
| --------- | ------------------------------------ |
| `default` | 按钮内容                             |
| `icon`    | 自定义图标                           |
| `loading` | 自定义加载内容，优先于 `loadingIcon` |

### ButtonGroup 属性

| 参数        | 说明             | 类型                   | 默认值       |
| ----------- | ---------------- | ---------------------- | ------------ |
| `type`      | 统一设置按钮类型 | `ButtonType`           | —            |
| `size`      | 统一设置按钮尺寸 | `ButtonSize`           | 继承全局尺寸 |
| `direction` | 按钮排列方向     | `ButtonGroupDirection` | `horizontal` |

### ButtonGroup 插槽

| 插槽名    | 说明              |
| --------- | ----------------- |
| `default` | Button 子组件列表 |
