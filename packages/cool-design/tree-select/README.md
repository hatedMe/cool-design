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
| `multiple`      | 是否多选                                   | `boolean`                                  | `false`  |
| `checkStrictly` | 父子勾选是否解耦                           | `boolean`                                  | `false`  |
| `filterable`    | 是否显示筛选框                             | `boolean`                                  | `false`  |
| `collapseTags`  | 多选时折叠标签                             | `boolean`                                  | `false`  |
| `maxCollapseTags` | 折叠时显示的标签数                       | `number`                                   | `1`      |
| `placeholder`   | 占位文本                                   | `string`                                   | `请选择` |
| `clearable`     | 是否可清空                                 | `boolean`                                  | `false`  |
| `emptyValues` | 单选中视作未选中的值 | `unknown[]` | 继承 ConfigProvider |
| `valueOnClear` | 单选清空值或工厂，多选清空为 `[]` | `string \| number \| boolean \| null \| (() => unknown)` | 继承 ConfigProvider |
| `disabled`      | 是否禁用                                   | `boolean`                                  | `false`  |
| `validateEvent` | 选中变化时触发表单校验                     | `boolean`                                  | `true`   |
| `teleported`    | 下拉面板是否传送到 body                    | `boolean`                                  | `true`   |
| `persistent`    | 关闭后是否保留面板节点（树实例状态保留）   | `boolean`                                  | `false`  |
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

### 实例方法

| 方法      | 说明           |
| --------- | -------------- |
| `focus()` | 聚焦触发器按钮 |
| `blur()`  | 取消聚焦       |


### 插槽

当前版本不提供自定义节点插槽。

> 以上为当前支持的 Tree 参数；未完整透传 Tree / Select 的全部属性、事件、插槽和实例方法。多选仍沿用父子联动结果包含父子键值的现有行为。

单选清空默认提交 `undefined`。依赖原默认值 `null` 的页面可以显式设置 `:value-on-clear="null"`。布尔清空值可用于双向绑定，树节点的键继续使用字符串或数字。
