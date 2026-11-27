# Tabs 标签页

## 组件介绍

Tabs 在多个内容面板之间切换，支持卡片样式、位置、新增/关闭、懒渲染与切换拦截。支持 `TabPane` 子组件与默认插槽，同时兼容旧版 `panes` 数据驱动用法。

## 基础用法

```vue
<Tabs v-model="active" @tab-click="onClick">
  <TabPane name="first" label="第一项">内容一</TabPane>
  <TabPane name="second" label="第二项" disabled>内容二</TabPane>
</Tabs>
```

类型包括 `default`、`card` 和 `border-card`，`''` 等同 `default`。位置可选 `top`、`right`、`bottom` 和 `left`。

## 可编辑与拦截

设置 `editable`，或分别设置 `closable` 和 `addable`。`before-leave` 接收目标和当前页签名称。返回 `false`、解析为 `false` 或拒绝 Promise 均会阻止切换。

## 数据驱动（兼容）

```vue
<Tabs v-model="active" :panes="panes">
  <template #default="{ name }">当前：{{ name }}</template>
</Tabs>
```

声明式用法按 `modelValue`、`defaultValue`、字符串 `"0"` 的顺序确定初始选中项。未提供 `name` 的 `TabPane` 使用自身从零开始的字符串索引。如果旧版页面依赖首个可用的具名页签自动选中，请将该项的 `name` 传给 `default-value`。`panes` 模式中，绑定值和初始值均省略，或优先采用的值为空字符串时，仍选中首个可用页签。

## API

### Tabs 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `model-value` | 激活页签 `name` | `string \| number` | — |
| `default-value` | 非受控初始值 | `string \| number` | — |
| `panes` | 数据驱动页签（兼容） | `TabPaneOption[]` | `[]` |
| `type` | 风格 | `''` / `default` / `card` / `border-card` | `''` |
| `closable` | 是否可关闭 | `boolean` | `false` |
| `addable` | 是否可新增 | `boolean` | `false` |
| `editable` | 是否可编辑（等同同时开启关闭与新增） | `boolean` | `false` |
| `tab-position` | 位置 | `top` / `right` / `bottom` / `left` | `top` |
| `stretch` | 页签是否拉伸撑满 | `boolean` | `false` |
| `before-leave` | 切换前拦截 | `(activeName: TabsPaneName, oldActiveName: TabsPaneName) => boolean \| void \| Promise<boolean \| void>` | `() => true` |

### Tabs 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:modelValue` | 激活项变化 | `name: string \| number` |
| `tab-click` | 点击页签。JSX 支持 `onTabClick`，监听器对象也可使用 `'onTab-click'`。键盘切换或直接调用 `setActive` 时，事件参数可省略 | `pane: TabsClickPane, event?: Event` |
| `tab-change` | 激活项变更后 | `name: string \| number` |
| `tab-add` | 点击新增 | — |
| `tab-remove` | 点击关闭 | `name: string \| number` |
| `edit` | 新增或删除，新增时名称为 `null` | `target: string \| number \| null, action: 'add' \| 'remove'` |

### Tabs 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | `TabPane` 子组件；`panes` 模式下接收 `{ name }` 渲染内容 |
| `add-icon` | 自定义新增按钮内容（`addable` 场景，缺省为 `+`） |

页签溢出时头部自动出现滚动箭头，每次滚动视口的 60%，到达边界后对应箭头禁用；切换页签时激活页签自动滚动进可视区。

### Tabs 实例

| 名称 | 说明 | 类型 |
| ---- | ---- | ---- |
| `currentName` | 当前选中名称，可在计算属性和侦听器中读取 | `string \| number` |
| `tabNavRef` | 挂载后的导航实例 | `TabNavInstance \| undefined` |
| `setActive` | 请求切换到指定页签，受控时由外部更新 `modelValue` | `(name: TabsPaneName, event?: Event) => Promise<void>` |

### TabNav 实例

| 名称 | 说明 | 类型 |
| ---- | ---- | ---- |
| `tabListRef` | 实际的页签列表元素 | `HTMLDivElement \| undefined` |
| `tabBarRef` | 默认风格下的活动指示条实例 | `TabBarInstance \| undefined` |
| `scrollToActiveTab` | 将激活页签滚动到可见区域 | `() => Promise<void>` |
| `focusActiveTab` | 将焦点移到激活页签 | `() => Promise<void>` |
| `removeFocus` | 清除导航的焦点样式，返回 `false` | `() => boolean` |

### TabBar 实例

| 名称 | 说明 | 类型 |
| ---- | ---- | ---- |
| `ref` | 活动指示条元素 | `HTMLDivElement \| undefined` |
| `update` | 重新测量活动指示条并返回更新后的样式 | `() => CSSProperties` |

### TabPane 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `label` | 页签标题 | `string` | `''` |
| `name` | 唯一标识 | `string \| number` | 当前顺序的字符串索引 |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `closable` | 单项是否可关闭（覆盖全局） | `boolean` | — |
| `lazy` | 是否懒渲染 | `boolean` | `false` |

### TabPane 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 面板内容 |
| `label` | 自定义页签标题 |
