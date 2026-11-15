# Tabs 标签页

## 组件介绍

Tabs 在多个内容面板之间切换，支持卡片样式、位置、新增/关闭、懒渲染与切换拦截。API 对标 Element Plus，支持 `TabPane` 子组件与默认插槽，同时兼容旧版 `panes` 数据驱动用法。

## 基础用法

```vue
<Tabs v-model="active" @tab-click="onClick">
  <TabPane name="first" label="第一项">内容一</TabPane>
  <TabPane name="second" label="第二项" disabled>内容二</TabPane>
</Tabs>
```

类型：`default` / `card` / `border-card`（`''` 等同 `default`）。位置：`top` / `right` / `bottom` / `left`。

## 可编辑与拦截

设置 `editable` 或 `closable` / `addable` 开启关闭与新增。使用 `before-leave` 拦截切换，返回 `false` 或 `Promise<false>` 可阻止。

## 数据驱动（兼容）

```vue
<Tabs v-model="active" :panes="panes">
  <template #default="{ name }">当前：{{ name }}</template>
</Tabs>
```

未提供 `modelValue` 时默认选中首个可用页签。

## API

### Tabs 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `modelValue` | 激活页签 `name` | `string \| number` | 首个可用 |
| `default-value` | 非受控初始值 | `string \| number` | — |
| `panes` | 数据驱动页签（兼容） | `TabPaneOption[]` | `[]` |
| `type` | 风格 | `default` / `card` / `border-card` | `''` |
| `closable` | 是否可关闭 | `boolean` | `false` |
| `addable` | 是否可新增 | `boolean` | `false` |
| `editable` | 是否可编辑（等同同时开启关闭与新增） | `boolean` | `false` |
| `tab-position` | 位置 | `top` / `right` / `bottom` / `left` | `top` |
| `stretch` | 页签是否拉伸撑满 | `boolean` | `false` |
| `before-leave` | 切换前拦截 | `(active, old) => boolean \| Promise<boolean> \| void` | — |

### Tabs 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:modelValue` | 激活项变化 | `name: string \| number` |
| `tab-click` | 点击页签 | `pane: object, event: Event` |
| `tab-change` | 激活项变更后 | `name: string \| number` |
| `tab-add` | 点击新增 | — |
| `tab-remove` | 点击关闭 | `name: string \| number` |
| `edit` | 新增或删除 | `target: string \| number \| null, action: add \| remove` |

### Tabs 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | `TabPane` 子组件；`panes` 模式下接收 `{ name }` 渲染内容 |

### TabPane 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `label` | 页签标题 | `string` | `''` |
| `name` | 唯一标识（必填） | `string \| number` | — |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `closable` | 单项是否可关闭（覆盖全局） | `boolean` | — |
| `lazy` | 是否懒渲染 | `boolean` | `false` |

### TabPane 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 面板内容 |
| `label` | 自定义页签标题 |
