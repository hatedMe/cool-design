# TreeSelect 树形选择

### 介绍

从层级数据中选择节点，支持单选、多选和筛选。

## 用法

`<TreeSelect v-model="value" :data="nodes" multiple filterable />`。输入框回显节点 `label`；多选时以标签展示选中项并支持删除。多选默认父子勾选联动（勾选父节点级联勾选子孙，子节点勾满自动选中父节点），设置 `check-strictly` 后父子勾选解耦，部分子节点选中的父节点展示半选状态。

### 字段映射与懒加载

```vue
<TreeSelect
  v-model="value"
  node-key="id"
  :props="{ label: 'name', children: 'nodes', disabled: 'locked', isLeaf: 'leaf' }"
  lazy
  :load="load"
  :cache-data="[{ id: 2, name: '未加载节点' }]"
/>
```

`node-key` 同时用于选中值、勾选同步和回显，须在整棵树中唯一。`load(node, resolve, reject)` 与 Tree 一致：首次展开时加载，空数据时首先加载 `level === 0` 的根节点；支持回调、返回数组或 Promise。`cache-data` 只用于未加载节点的标签回显，不生成树节点；加载后的数据优先覆盖缓存标签。关闭面板后仍保留已加载标签。

## API

### 属性

| 参数            | 说明                                       | 类型                                       | 默认值   |
| --------------- | ------------------------------------------ | ------------------------------------------ | -------- |
| `modelValue`    | 选中值，多选时为数组                       | `string \| number \| boolean \| (string \| number)[] \| null` | `null`   |
| `data`          | 树形节点数据                               | `TreeSelectNode[]`                         | `[]`     |
| `props` | 字段映射：`label` / `children` / `disabled` / `isLeaf` / `class`，与 Tree 一致 | `TreePropsMapping` | `{}` |
| `node-key` | 节点唯一标识字段及选中值字段 | `string` | `value` |
| `lazy` | 是否懒加载节点 | `boolean` | `false` |
| `load` | 懒加载方法 | `TreeLoadFunction` | — |
| `cache-data` | 未加载节点的标签回显数据 | `TreeSelectNode[]` | `[]` |
| `default-expand-all` | 默认展开所有已加载节点 | `boolean` | `false` |
| `default-expanded-keys` | 默认展开的节点键值 | `TreeKey[]` | `[]` |
| `auto-expand-parent` | 自动展开父节点 | `boolean` | `true` |
| `accordion` | 同级节点是否仅展开一个 | `boolean` | `false` |
| `indent` | 层级缩进，单位像素 | `number` | `18` |
| `render-after-expand` | 首次展开后才渲染子节点 | `boolean` | `false` |
| `filter-node-method` | 自定义节点过滤方法 | `TreeFilterMethod` | — |
| `show-checkbox` | 显示复选框，显式设置时覆盖多选模式的默认值 | `boolean` | 跟随 `multiple` |
| `check-on-click-node` | 显示复选框时，点击节点触发勾选 | `boolean` | `false` |
| `check-on-click-leaf` | 显示复选框时，点击叶节点触发勾选 | `boolean` | `true` |
| `multiple`      | 是否多选                                   | `boolean`                                  | `false`  |
| `checkStrictly` | 父子勾选是否解耦                           | `boolean`                                  | `false`  |
| `filterable`    | 是否显示筛选框                             | `boolean`                                  | `false`  |
| `collapseTags`  | 多选时折叠标签                             | `boolean`                                  | `false`  |
| `maxCollapseTags` | 折叠时显示的标签数                       | `number`                                   | `1`      |
| `placeholder`   | 占位文本                                   | `string`                                   | `请选择` |
| `size` | 触发器尺寸 | `small\|default\|large` | 继承 FormItem、Form 或 ConfigProvider |
| `clearable`     | 是否可清空                                 | `boolean`                                  | `false`  |
| `emptyValues` | 单选中视作未选中的值 | `unknown[]` | 继承 ConfigProvider |
| `valueOnClear` | 单选清空值或工厂，多选清空为 `[]` | `string \| number \| boolean \| null \| (() => unknown)` | 继承 ConfigProvider |
| `disabled`      | 是否禁用                                   | `boolean`                                  | `false`  |
| `validateEvent` | 选中变化时触发表单校验                     | `boolean`                                  | `true`   |
| `teleported`    | 下拉面板是否传送到 body                    | `boolean`                                  | `true`   |
| `persistent`    | 关闭后是否保留面板节点（树实例状态保留）   | `boolean`                                  | `true`  |
| `placement`     | 面板位置及 `-start` / `-end` 变体         | `string`                                   | `bottom-start` |
| `fallbackPlacements` | 主位置放不下时的候选位置              | `Placement[]`                              | `['top-start', 'bottom', 'top']` |
| `popperOptions` | 浮层参数覆盖（`offset` / `placement`）     | `{ offset?: number; placement?: Placement }` | — |
| `popperClass`   | 面板自定义 class                           | `string` / `string[]` / `object`           | —        |
| `popperStyle`   | 面板自定义样式                             | `string` / `CSSProperties`                 | —        |
| `effect`        | 面板主题：`light` / `dark`                 | `string`                                   | `light`  |

`TreeSelectNode` 支持任意业务字段；默认结构为 `{ value: string | number; label: string; children?: TreeSelectNode[]; disabled?: boolean }`，使用其他结构时应配置 `node-key` 和 `props`。

### 事件

| 事件名              | 说明                 | 回调参数                  |
| ------------------- | -------------------- | ------------------------- |
| `update:modelValue` | 选中值变化           | `value`                   |
| `change`            | 选中值变化           | `value`                   |
| `visible-change`    | 下拉展开/收起        | `visible: boolean`        |
| `remove-tag`        | 删除标签             | `value`                   |
| `clear`             | 清空                 | —                         |
| `focus` | 控件获得焦点 | `event: FocusEvent` |
| `blur` | 控件失去焦点 | `event: FocusEvent` |
| `node-click` | 点击树节点 | `data: TreeData, node: TreeNode, component: unknown` |
| `check` | 用户操作导致勾选变化 | `data: TreeData, info: TreeCheckedInfo` |
| `popup-scroll` | 下拉面板滚动 | `{ scrollTop: number, scrollLeft: number }` |
| `end-reached` | 滚动到面板边缘 | `direction: 'top' \| 'bottom' \| 'left' \| 'right'` |

组件透传 `node-contextmenu`、`current-change`、`check-change`、`node-expand`、`node-collapse`、`node-drag-start`、`node-drag-enter`、`node-drag-leave`、`node-drag-over`、`node-drag-end`、`node-drop`。参数见 [Tree 事件](#/components/tree)。

### 实例方法

| 方法      | 说明           |
| --------- | -------------- |
| `focus()` | 聚焦触发器按钮 |
| `blur()`  | 取消聚焦       |
| `filter()` / `getNode()` | 过滤、查询节点 |
| `getCheckedKeys()` / `getCheckedNodes()` / `getHalfCheckedKeys()` / `getHalfCheckedNodes()` | 查询勾选和半选 |
| `setCheckedKeys()` / `setCheckedNodes()` / `setChecked()` | 设置勾选 |
| `getCurrentKey()` / `getCurrentNode()` / `setCurrentKey()` / `setCurrentNode()` | 查询和设置当前节点 |
| `updateKeyChildren()` / `append()` / `remove()` / `insertBefore()` / `insertAfter()` | 修改树节点 |

`TreeSelectInstance` 的树方法参数见 [Tree 暴露方法](#/components/tree)。`selectRef`、`treeRef` 和 `selectedLabel` 均为只读属性，分别为内嵌 Select 实例、Tree 实例和当前标签（`string | string[]`）。面板尚未挂载时，树方法可能还没有可操作的节点。

### 插槽

| 名称 | 说明 | 作用域 |
| --- | --- | --- |
| `default` | 自定义树节点 | `{ node, data }` |
| `label` | 自定义已选标签 | `{ value, label }` |
| `prefix` / `suffix` | 控件前缀或后缀 | — |
| `header` / `footer` | 面板头部或尾部 | — |
| `loading` / `empty` | 加载或空状态 | — |

级联多选提交叶节点键，并保留尚未加载的已选键。若原代码从模型读取父节点键，可改用 `getCheckedKeys()` 查询树的完整勾选状态。

单选清空默认提交 `undefined`。依赖原默认值 `null` 的页面可以显式设置 `:value-on-clear="null"`。布尔清空值可用于双向绑定，树节点的键继续使用字符串或数字。

`valueKey` 在缺少 `nodeKey` 时提供节点键。设置 `name` 后，表单会按名称提交所选节点键。可用 `appendTo` 指定浮层容器。

`clear-icon` 与 `suffix-icon` 接受 `string | Component`。`tag-effect` 接受 `'light' | 'dark' | 'plain'`。搜索输入接受 `autocomplete`，远程过滤支持 `debounce`（默认 `300` 毫秒）和 `remote-show-suffix`。
