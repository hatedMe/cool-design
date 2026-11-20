# ConfigProvider 全局配置

### 介绍

为后代组件统一设置主题、控件尺寸、语言、空值策略和浮层基础层级，并提供浮层宿主。

### 基本用法

```vue
<script setup lang="ts">
import { ConfigProvider, en } from 'cool-design/config-provider';
</script>

<template>
  <ConfigProvider :locale="en" :z-index="3000" :empty-values="[null, undefined]" :value-on-clear="null">
    <!-- 放置需要共享配置的组件 -->
  </ConfigProvider>
</template>
```

嵌套 Provider 中省略的配置继承父级；显式设置的属性优先，`themeVars` 按变量名合并。

## API

### 属性

| 参数      | 说明                          | 类型                           | 默认值                 |
| --------- | ----------------------------- | ------------------------------ | ---------------------- |
| theme     | 主题：`light` / `dark`        | `string`                       | 继承父级，根级 `light` |
| size      | 尺寸：`small` / `default` / `large` | `string`                  | 继承父级，根级 `default` |
| themeVars | CSS 变量，使用完整变量名      | `Record<string, string>`       | 与父级变量合并         |
| locale | 语言对象，兼容 Element Plus 的 `{ name, el }` 结构 | `Language` | 继承父级，根级中文 |
| zIndex | `useZIndex` 使用的基础层级 | `number` | 继承父级，根级 `2000` |
| emptyValues | `useEmptyValues` 使用的空值集合 | `unknown[]` | 继承父级，未配置时 `['', undefined, null]` |
| valueOnClear | 清空后的值，函数形式可返回 `undefined` | `string / number / boolean / null / (() => unknown)` | 继承父级，根级 `undefined` |
| namespace | 命名空间，供 `useNamespace` 使用 | `string` | 继承父级，根级 `i` |
| button | Button 的默认配置 | `ButtonConfigContext` | 继承父级 |
| link | Link 的默认配置 | `LinkConfigContext` | 继承父级 |
| dialog | Dialog 的默认配置 | `DialogConfigContext` | 继承父级 |
| message | Message 的默认配置 | `MessageConfigContext` | 继承父级 |
| table | Table 的默认配置 | `TableConfigContext` | 继承父级 |

### 组件配置字段

字段基于 Element Plus `2.14.8`。嵌套 Provider 逐字段继承，更新配置会重算后代组件的默认值。组件自身的属性优先，包括显式的 `false` 和 `0`。

| 配置 | 可选字段 |
| --- | --- |
| `button` | `type`、`plain`、`text`、`round`、`dashed`、`autoInsertSpace` |
| `link` | `type`、`underline` |
| `dialog` | `alignCenter`、`draggable`、`overflow`、`transition` |
| `message` | `max`、`grouping`、`duration`、`offset`、`showClose`、`plain`、`placement` |
| `table` | `showOverflowTooltip`、`tooltipEffect`、`tooltipOptions`、`tooltipFormatter` |

```vue
<ConfigProvider :button="{ type: 'primary', round: true }">
  <ConfigProvider :button="{ dashed: true }">
    <Button :round="false">直角虚线按钮</Button>
  </ConfigProvider>
</ConfigProvider>
```

声明式 Message 读取最近 Provider 的 `duration`、`showClose` 和 `plain`。Message 服务在创建消息时读取应用的顶层 Provider，调用选项优先。同一应用存在多个顶层 Provider 时，最近创建的生效，卸载后恢复上一个。`max` 按应用和位置限制消息数，已分组的重复消息计为同一条。

### 事件

无。

### 插槽

| 名称    | 说明               |
| ------- | ------------------ |
| default | 需要继承配置的内容 |

## 使用说明

属性：`theme?: 'light' | 'dark'`、`size?: 'small' | 'default' | 'large'`、`themeVars?: Record<string, string>`。省略时继承父配置，根默认为 light/default。变量使用完整名称，例如 `{'--i-primary': '#2463eb', '--i-on-primary': '#fff'}`。

默认插槽放内容。容器生成 `.i-overlay-host`，Dialog 在其中渲染。嵌套合并父级自定义变量，子级同名变量优先。

### 语言与支持范围

从 `cool-design/config-provider` 可导入 `zhCn`、`en` 和 `useLocale`。内置语言对象仅包含 Select、Table、ColorPicker、Empty 的基础文案；也可以直接传入 Element Plus 的语言对象。`useLocale().t('el.select.placeholder', '请选择')` 按路径读取字符串，缺失路径使用后备文案。具体组件须调用该工具才会响应语言切换。

`namespace` 当前仅提供 Hook 层配置和嵌套继承。现有组件与 SCSS 中仍存在固定的 `i-` 前缀，尚不支持全库切换命名空间。

`zIndex` 作用于使用 `useZIndex` 的锚定浮层以及 Dialog、Drawer；组件自身的 `zIndex` 属性优先。Message、Notification 服务容器仍使用独立固定层级，暂未接入。空值配置由 `useEmptyValues` 读取，具体组件是否支持以组件 API 为准。

SSR 注意：现有 `useId` 及 Provider 的 ID 前缀仍包含随机值，尚不能保证服务端与客户端生成一致 ID。
