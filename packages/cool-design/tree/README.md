# Tree 树形控件

### 介绍

Tree 用于展示层级数据，支持展开收起、单选高亮、复选框级联与半选、过滤、懒加载、拖拽排序和自定义节点内容，对标 Element Plus Tree 的公开 API。

## 基础用法

```vue
<Tree :data="data" node-key="id" default-expand-all @node-click="handleClick" />
```

`data` 为层级数组，每一项默认使用 `label` 显示文本、`children` 表示子节点、`disabled` 禁用节点，可通过 `props` 映射自定义字段。

## 复选框与级联

```vue
<Tree :data="data" node-key="id" show-checkbox :default-checked-keys="[2]" @check="handleCheck" />
```

默认级联勾选父子节点并计算半选；`check-strictly` 关闭级联，`check-descendants` 可在严格模式下仅级联子孙。

## 当前节点高亮

```vue
<Tree :data="data" node-key="id" highlight-current :current-node-key="current" @current-change="handleCurrent" />
```

`current-node-key` 为受控值，`default-current-key` 仅设置初始值。

## 过滤节点

```vue
<Tree ref="treeRef" :data="data" node-key="id" :filter-node-method="filterMethod" />
```

```ts
const filterMethod = (value: string, data: any) => data.label.includes(value);
treeRef.value?.filter('关键字');
```

`filterable` 会内置一个搜索框，输入时自动调用 `filter`。

## 懒加载

```vue
<Tree :data="data" node-key="id" lazy :load="loadNode" />
```

```ts
const loadNode = (node: any, resolve: (children: any[]) => void) => {
  resolve([{ id: `${node.key}-1`, label: '动态子节点', isLeaf: true }]);
};
```

`props.isLeaf` 或数据中的 `isLeaf` 为 `true` 时不再加载。

## 拖拽排序

```vue
<Tree :data="data" node-key="id" draggable :allow-drop="allowDrop" @node-drop="handleDrop" />
```

拖拽支持 `prev` / `inner` / `next` 三种位置，放置后会自动移动节点数据。

## 自定义内容与空态

```vue
<Tree :data="data" node-key="id" empty-text="暂无数据">
  <template #default="{ node, data }">
    <span>{{ data.label }}（{{ node.level }} 级）</span>
  </template>
  <template #empty>
    <span>没有匹配的节点</span>
  </template>
</Tree>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 树形数据 | `TreeData[]` | `[]` |
| node-key | 节点唯一标识字段 | `string` | `id` |
| props | 字段映射 | `TreePropsMapping` | `{}` |
| default-expand-all | 是否默认展开全部 | `boolean` | `false` |
| default-expanded-keys | 默认展开的节点 `key` 数组 | `TreeKey[]` | `[]` |
| auto-expand-parent | 展开子节点时是否自动展开父节点 | `boolean` | `true` |
| expand-on-click-node | 点击节点是否展开收起 | `boolean` | `true` |
| check-on-click-node | 点击节点是否勾选复选框 | `boolean` | `false` |
| check-on-click-leaf | 点击叶节点是否勾选复选框 | `boolean` | `true` |
| accordion | 手风琴模式，同级只展开一个 | `boolean` | `false` |
| indent | 相邻层级缩进，单位 px | `number` | `18` |
| icon | 自定义展开图标类名或组件 | `string` / `Component` | — |
| show-checkbox | 是否显示复选框 | `boolean` | `false` |
| check-strictly | 复选框是否严格模式，不级联 | `boolean` | `false` |
| check-descendants | 严格模式下是否级联子孙 | `boolean` | `false` |
| default-checked-keys | 默认勾选的节点 `key` 数组 | `TreeKey[]` | `[]` |
| default-current-key | 初始当前节点 `key` | `TreeKey` | — |
| current-node-key | 受控当前节点 `key` | `TreeKey` | — |
| highlight-current | 是否高亮当前节点 | `boolean` | `false` |
| filter-node-method | 过滤函数 | `(value: string, data: TreeData, node: TreeNode) => boolean` | — |
| filterable | 是否显示内置过滤输入框 | `boolean` | `false` |
| filter-placeholder | 内置过滤输入框占位文案 | `string` | `请输入关键字进行过滤` |
| lazy | 是否懒加载 | `boolean` | `false` |
| load | 懒加载函数，可通过 `reject` 结束本次加载并允许重试 | `(node: TreeNode, resolve: (children: TreeData[]) => void, reject?: () => void) => void` | — |
| draggable | 是否可拖拽 | `boolean` | `false` |
| allow-drag | 是否允许拖拽某个节点 | `(node: TreeNode) => boolean` | — |
| allow-drop | 是否允许放置 | `(draggingNode: TreeNode, dropNode: TreeNode, type: TreeDropType) => boolean` | — |
| disabled | 是否禁用整棵树 | `boolean` | `false` |
| empty-text | 空数据文案 | `string` | `暂无数据` |
| render-after-expand | 是否在首次展开后渲染子节点 | `boolean` | `true` |
| render-content | 自定义渲染函数 | `(h: unknown, context: { node: TreeNode; data: TreeData }) => unknown` | — |

`props` 字段映射支持：`label` 为 `string` / `(data: TreeData, node: TreeNode) => string`，`children` 为 `string`，`disabled` 为 `string` / `(data: TreeData, node: TreeNode) => boolean`，`isLeaf` 为 `string` / `(data: TreeData, node: TreeNode) => boolean`，`class` 为字符串或返回 class 的函数。

`TreeKey` 类型：`string` / `number`；`TreeDropType` 类型：`prev` / `inner` / `next`。

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| node-click | 节点被点击 | `data: TreeData`、`node: TreeNode`、`component: unknown`、`event: MouseEvent` |
| node-contextmenu | 节点右键菜单 | `event: MouseEvent`、`data: TreeData`、`node: TreeNode`、`component: unknown` |
| check-change | 复选框状态变化 | `data: TreeData`、`checked: boolean`、`indeterminate: boolean` |
| check | 勾选后触发，附带完整勾选信息 | `data: TreeData`、`info: TreeCheckedInfo` |
| current-change | 当前节点变化 | `data: TreeData \| null`、`node: TreeNode \| null` |
| node-expand | 节点展开 | `data: TreeData`、`node: TreeNode`、`component: unknown` |
| node-collapse | 节点收起 | `data: TreeData`、`node: TreeNode`、`component: unknown` |
| node-drag-start | 开始拖拽 | `node: TreeNode`、`event: DragEvent` |
| node-drag-enter | 拖拽进入目标节点 | `draggingNode: TreeNode`、`dropNode: TreeNode`、`event: DragEvent` |
| node-drag-leave | 拖拽离开目标节点 | `draggingNode: TreeNode`、`dropNode: TreeNode`、`event: DragEvent` |
| node-drag-over | 在目标节点上移动 | `draggingNode: TreeNode`、`dropNode: TreeNode`、`event: DragEvent` |
| node-drag-end | 拖拽结束 | `draggingNode: TreeNode`、`dropNode: TreeNode \| null`、`dropType: TreeDropType \| null`、`event: DragEvent` |
| node-drop | 放置成功 | `draggingNode: TreeNode`、`dropNode: TreeNode`、`dropType: TreeDropType`、`event: DragEvent` |

`TreeCheckedInfo` 包含：`checkedNodes: TreeData[]`、`checkedKeys: TreeKey[]`、`halfCheckedNodes: TreeData[]`、`halfCheckedKeys: TreeKey[]`。

### 插槽

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| default | 自定义节点内容 | `{ node: TreeNode; data: TreeData }` |
| icon | 自定义展开图标 | `{ node: TreeNode; data: TreeData; expanded: boolean }` |
| empty | 自定义空态 | — |

### 暴露方法

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| filter | 过滤节点 | `value: string` |
| getNode | 获取节点实例 | `param: TreeKey \| TreeData \| TreeNode` |
| getCheckedNodes | 获取勾选节点数据 | `leafOnly?: boolean`、`includeHalfChecked?: boolean` |
| getCheckedKeys | 获取勾选节点 `key` | `leafOnly?: boolean` |
| getHalfCheckedNodes | 获取半选节点数据 | — |
| getHalfCheckedKeys | 获取半选节点 `key` | — |
| setCheckedNodes | 设置勾选节点 | `nodes: (TreeKey \| TreeData \| TreeNode)[]`、`leafOnly?: boolean` |
| setCheckedKeys | 设置勾选 `key` | `keys: TreeKey[]`、`leafOnly?: boolean` |
| setChecked | 设置单个节点勾选 | `param: TreeKey \| TreeData \| TreeNode`、`checked: boolean`、`deep?: boolean` |
| getCurrentKey | 获取当前节点 `key` | — |
| getCurrentNode | 获取当前节点数据 | — |
| setCurrentKey | 设置当前节点 | `key: TreeKey \| null`、`shouldAutoExpandParent?: boolean` |
| setCurrentNode | 设置当前节点 | `node: TreeKey \| TreeData \| TreeNode \| null`、`shouldAutoExpandParent?: boolean` |
| expandAll | 展开或收起全部 | `expand?: boolean`，默认 `true` |
| expandNode | 展开指定节点 | `param: TreeKey \| TreeData \| TreeNode` |
| collapseNode | 收起指定节点 | `param: TreeKey \| TreeData \| TreeNode` |
| updateKeyChildren | 更新指定 `key` 的子节点，懒加载适用 | `key: TreeKey`、`children: TreeData[]` |
| remove | 删除节点 | `param: TreeKey \| TreeData \| TreeNode` |
| append | 追加子节点 | `data: TreeData \| TreeData[]`、`parent?: TreeKey \| TreeData \| TreeNode \| null`，不传则追加到根 |
| insertBefore | 在参照节点前插入 | `data: TreeData`、`ref: TreeKey \| TreeData \| TreeNode` |
| insertAfter | 在参照节点后插入 | `data: TreeData`、`ref: TreeKey \| TreeData \| TreeNode` |
