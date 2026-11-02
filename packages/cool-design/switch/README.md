# Switch 开关

## 介绍

Switch 用于在两个互斥状态之间进行切换，适合账号状态、功能开关和配置项设置。组件 API 对齐 Element Plus Switch，并保留项目的 Vue 3 组件用法。

## 基础用法

`v-model` 默认使用 `boolean` 值，也可以通过 `activeValue` 和 `inactiveValue` 使用字符串或数字。

```vue
<Switch v-model="enabled">
  {{ enabled ? '账号已启用' : '账号已停用' }}
</Switch>
```

## 尺寸、宽度与状态文字

`size` 支持 `small`、`default`、`large`；`width` 支持数字或 CSS 宽度字符串。设置 `activeText`、`inactiveText` 可显示状态文字。

```vue
<Switch
  v-model="value"
  active-value="on"
  inactive-value="off"
  active-text="开启"
  inactive-text="关闭"
  size="large"
  width="64px" />
```

## 内嵌提示与加载状态

设置 `inlinePrompt` 后，状态内容显示在开关轨道内；纯文本只显示首字符。`loading` 会显示加载状态并阻止用户切换。

```vue
<Switch v-model="value" inline-prompt active-text="开启" inactive-text="关闭" />
<Switch v-model="value" loading aria-label="正在保存" />
```

## 自定义图标与颜色

`activeIcon` / `inactiveIcon` 用于设置状态图标，图标优先于对应状态文字。`activeActionIcon` / `inactiveActionIcon` 用于设置动作区域图标。字符串值使用项目 Icon 的图标名称，也可以传入 Vue Component。

```vue
<Switch
  v-model="value"
  active-icon="icon-success"
  inactive-icon="icon-close"
  active-action-icon="icon-like"
  active-color="#13ce66"
  inactive-color="#ff4949"
  border-color="#999" />
```

## 异步变更

`beforeChange` 在状态切换前执行，可返回 Boolean 或 Promise。返回 `false` 或 Promise rejected 时保持原值；异步处理期间建议同步设置 `loading`。

```vue
<script setup lang="ts">
import { ref } from 'vue';

const value = ref(false);
const loading = ref(false);

const beforeChange = async () => {
  loading.value = true;
  await saveSetting();
  loading.value = false;
  return true;
};
</script>

<template>
  <Switch v-model="value" :loading="loading" :before-change="beforeChange" />
</template>
```

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `modelValue` / `v-model` | 绑定值 | `boolean` / `string` / `number` | `false` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `loading` | 显示加载状态并阻止切换 | `boolean` | `false` |
| `size` | 开关尺寸 | `small` / `default` / `large` | — |
| `width` | 开关宽度，数字按 px 处理 | `number` / `string` | — |
| `activeValue` | 开启状态对应的值 | `boolean` / `string` / `number` | `true` |
| `inactiveValue` | 关闭状态对应的值 | `boolean` / `string` / `number` | `false` |
| `activeText` | 开启状态文字 | `string` | — |
| `inactiveText` | 关闭状态文字 | `string` | — |
| `inlinePrompt` | 在轨道内显示状态内容，文本只显示首字符 | `boolean` | `false` |
| `activeIcon` | 开启状态图标，优先于 `activeText` | `string` / `Component` | — |
| `inactiveIcon` | 关闭状态图标，优先于 `inactiveText` | `string` / `Component` | — |
| `activeActionIcon` | 开启状态动作区域图标 | `string` / `Component` | — |
| `inactiveActionIcon` | 关闭状态动作区域图标 | `string` / `Component` | — |
| `activeColor` | 开启状态颜色，作为 CSS 变量的兼容属性 | `string` | — |
| `inactiveColor` | 关闭状态颜色，作为 CSS 变量的兼容属性 | `string` | — |
| `borderColor` | 边框颜色，作为 CSS 变量的兼容属性 | `string` | — |
| `label` | 无障碍标签兼容属性，优先使用 `aria-label` | `string` | — |
| `validateEvent` | 是否在值变化后触发表单校验 | `boolean` | `true` |
| `beforeChange` | 切换前守卫，返回 `false` 或 rejected Promise 会阻止切换 | `() => boolean \| Promise<boolean>` | — |
| `id` | 原生输入框 id | `string` | — |
| `name` | 原生输入框 name | `string` | — |
| `tabindex` | 原生输入框 tabindex | `string` / `number` | — |
| `aria-label` | 原生输入框无障碍标签 | `string` | — |

### 事件

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| `update:modelValue` | 用户切换开关后更新绑定值 | `value: boolean \| string \| number` |
| `change` | 用户切换开关后触发 | `value: boolean \| string \| number` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 开关外部说明内容 |
| `active` | 开启状态内容；配合 `inlinePrompt` 时显示在轨道内 |
| `inactive` | 关闭状态内容；配合 `inlinePrompt` 时显示在轨道内 |
| `active-action` | 开启状态动作区域内容，优先于 `activeActionIcon` |
| `inactive-action` | 关闭状态动作区域内容，优先于 `inactiveActionIcon` |

### 方法

| 方法 | 说明 |
| --- | --- |
| `focus()` | 让内部原生输入框获得焦点 |

## 使用说明

- `loading` 会同时阻止用户操作，表单上下文禁用时也会阻止切换。
- `activeIcon` / `inactiveIcon` 存在时，分别优先于 `activeText` / `inactiveText`。
- `active-action` / `inactive-action` 插槽优先于对应的 ActionIcon，并渲染在独立动作区域。
- 没有可见文字时，请使用 `aria-label`；显式 `aria-label` 优先于兼容属性 `label`。
- 组件级 `class` 和 `style` 应用于根节点；`id`、`name`、`tabindex` 及原生 ARIA 属性应用于内部 input。
- 除 `activeColor`、`inactiveColor`、`borderColor` 外，也可以使用 `--i-switch-on-color`、`--i-switch-off-color` 和 `--i-switch-border-color` CSS 变量。
- `size` 仅接受 `small`、`default`、`large`；未传时继承 Field 或 ConfigProvider 的尺寸，其他值按默认尺寸处理。
- `loading` 时只显示 loading 指示器，不同时显示 action 图标或 action 插槽内容。
- 组件同时触发兼容事件 `input` 和标准事件 `change`。
