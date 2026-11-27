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

使用 `color` 设置按钮颜色，组件会自动计算 hover 和 active 状态。 `color` 同样支持 `plain`、`link`、`text` 和 `bg` 组合。设置 `dark` 后按暗色模式计算派生色（hover、active 向深色混合），适用于深色背景页面。

## 自动插入中文空格

设置 `auto-insert-space` 后，默认插槽只有一个文本节点且去除首尾空白后恰好包含两个 Unicode 统一汉字时，按钮会在两字之间插入一个空格，并保留传入的首尾空白。扩展区字符也参与匹配。该规则适用于带图标、禁用或加载中的按钮，元素、组件和多个节点的内容按原样渲染。

可通过 ConfigProvider 的 `button.autoInsertSpace` 设置默认值。单个按钮传入 `:auto-insert-space="false"` 可关闭自动排版。如果旧版页面依赖元素子节点被替换后的空格，或需要固定的复制文本，可以显式传入所需空格，并关闭自动排版。

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
| `loading-icon`     | 加载图标                     | `string \| Component` | `icon-refresh` |
| `disabled`        | 是否禁用按钮                 | `boolean`             | `false`        |
| `autofocus`       | 是否自动获取焦点             | `boolean`             | `false`        |
| `icon`            | 图标                         | `string \| Component` | —              |
| `native-type`      | 原生按钮类型                 | `ButtonNativeType`    | `button`       |
| `auto-insert-space` | 按单文本节点规则插入空格     | `boolean`             | 继承全局配置，缺省为 `false` |
| `color`           | 自定义按钮颜色               | `string`              | —              |
| `dark`            | 自定义颜色的暗色模式         | `boolean`             | `false`        |
| `tag`             | 自定义渲染标签或组件         | `string \| Component` | `button`       |

`ButtonType` 支持 `default` / `primary` / `success` / `warning` / `danger` / `info` / `text`。`ButtonSize` 支持 `small` / `default` / `large` / `normal`。`ButtonNativeType` 支持 `button` / `submit` / `reset`。

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

### Button 实例

使用 `ref<ButtonInstance>()` 获取按钮实例。`size`、`type`、`disabled` 和 `shouldAddSpace` 是只读响应式值。可通过 `$props` 读取传入的属性。

| 名称             | 说明                                     | 类型                                                    |
| ---------------- | ---------------------------------------- | ------------------------------------------------------- |
| `ref`            | 根元素或自定义 `tag` 对应的组件实例      | `Element \| ComponentPublicInstance \| undefined`        |
| `size`           | 当前按钮尺寸                             | `ButtonSize`                                            |
| `type`           | 当前按钮类型                             | `ButtonType`                                            |
| `disabled`       | 当前是否禁用，包含加载和表单禁用状态     | `boolean`                                               |
| `shouldAddSpace` | 当前默认插槽是否应用自动排版，渲染后更新 | `boolean`                                               |

### ButtonGroup 属性

| 参数        | 说明             | 类型                   | 默认值       |
| ----------- | ---------------- | ---------------------- | ------------ |
| `type`      | 统一设置按钮类型 | `ButtonType`           | —            |
| `size`      | 统一设置按钮尺寸 | `ButtonSize`           | 继承全局尺寸 |
| `direction` | 按钮排列方向     | `ButtonGroupDirection` | `horizontal` |

`ButtonGroupDirection` 支持 `horizontal` / `vertical`。

### ButtonGroup 插槽

| 插槽名    | 说明              |
| --------- | ----------------- |
| `default` | Button 子组件列表 |
