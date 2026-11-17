# TreeV2 虚拟化树

### 介绍

窗口化渲染的树形控件，任意数据量下滚动流畅（对齐 Element Plus `TreeV2`）。

## 基础用法

`data` 传树形数据，`props` 映射字段（`value` 为唯一标识字段，默认 `id`）；`height` / `item-size` 控制可视窗口与行高，仅渲染可见行。

```vue
<TreeV2 :data="data" :props="{ value: 'id', label: 'label', children: 'children' }" :height="200" />
```

`show-checkbox` 显示复选框（勾选级联，`check-strictly` 解耦，`check-on-click-leaf` 叶子点选默认开）；`default-expanded-keys` / `default-checked-keys` / `current-node-key` 初始化状态；`filter-method` + 实例 `filter()` 过滤；`highlight-current` 高亮当前行；`icon` 自定义展开图标（或使用默认插槽 `{ node }` 自定义行内容）。

## API

### 属性

| 参数                  | 说明                                       | 类型                        | 默认值  |
| --------------------- | ------------------------------------------ | --------------------------- | ------- |
| `data`                | 树形数据                                   | `TreeV2Data[]`              | `[]`    |
| `emptyText`           | 数据为空文案                               | `string`                    | `暂无数据` |
| `props`               | 字段映射（`value` / `label` / `children` / `disabled` / `class`） | `TreeV2PropsMapping` | — |
| `height`              | 树高度（px）                               | `number`                    | `200`   |
| `itemSize`            | 行高（px，虚拟滚动依据）                   | `number`                    | `26`    |
| `indent`              | 层级缩进（px）                             | `number`                    | `16`    |
| `highlightCurrent`    | 高亮当前节点                               | `boolean`                   | `false` |
| `expandOnClickNode`   | 点击节点展开/收起                          | `boolean`                   | `true`  |
| `checkOnClickNode`    | 点击节点切换勾选                           | `boolean`                   | `false` |
| `checkOnClickLeaf`    | 点击叶子切换勾选                           | `boolean`                   | `true`  |
| `showCheckbox`        | 显示复选框                                 | `boolean`                   | `false` |
| `checkStrictly`       | 勾选父子解耦                               | `boolean`                   | `false` |
| `defaultExpandedKeys` | 初始展开的节点 key                         | `TreeV2Key[]`               | `[]`    |
| `defaultCheckedKeys`  | 初始勾选的节点 key                         | `TreeV2Key[]`               | `[]`    |
| `currentNodeKey`      | 当前节点 key（受控）                       | `TreeV2Key`                 | —       |
| `filterMethod`        | 过滤方法（配合实例 `filter()`）            | `(query, node) => boolean`  | —       |
| `icon`                | 自定义展开图标                             | `string` / `Component`      | —       |
| `scrollbarAlwaysOn`   | 滚动条常显                                 | `boolean`                   | `false` |

`TreeV2Node`：`{ key, level, parent?, children?, data, disabled?, label?, isLeaf?, expanded?, isEffectivelyChecked? }`。

### 事件

| 事件名           | 说明                     | 回调参数                                  |
| ---------------- | ------------------------ | ----------------------------------------- |
| `node-click`     | 点击节点                 | `data, node, event`                       |
| `node-contextmenu` | 右键节点               | `event, data, node`                       |
| `check-change`   | 单节点勾选态变化         | `data, checked`                           |
| `check`          | 勾选后触发               | `data, { checkedKeys, checkedNodes, halfCheckedKeys, halfCheckedNodes }` |
| `current-change` | 当前节点变化             | `data, node`                              |
| `node-expand` / `node-collapse` | 展开/收起  | `data, node`                              |

### 插槽

| 名称      | 说明                                     |
| --------- | ---------------------------------------- |
| `default` | 自定义行内容，作用域 `{ node }`          |
| `empty`   | 自定义空状态                             |

### 实例方法

| 方法                              | 说明                                   |
| --------------------------------- | -------------------------------------- |
| `filter(query)`                   | 过滤节点（需 `filter-method`）         |
| `getCheckedNodes(leafOnly?)`      | 获取勾选节点数据                       |
| `getCheckedKeys(leafOnly?)`       | 获取勾选节点 key                       |
| `setCheckedKeys(keys)`            | 设置勾选的 key                         |
| `setChecked(key, checked, deep?)` | 设置单节点勾选（`deep` 级联子节点）    |
| `setExpandedKeys(keys)`           | 设置展开的 key                         |
| `getHalfCheckedNodes()` / `getHalfCheckedKeys()` | 获取半选节点           |
| `getCurrentKey()` / `getCurrentNode()` | 获取当前节点                     |
| `setCurrentKey(key)`              | 设置当前节点                           |
| `getNode(keyOrData)`              | 获取节点（`TreeV2Node`）               |
| `expandNode(node)` / `collapseNode(node)` | 展开/收起指定节点             |
| `scrollTo(offset)` / `scrollToNode(key)` | 滚动到位置/节点               |
