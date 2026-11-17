# TreeSelect 树形选择

### 介绍

从层级数据中选择节点，支持单选、多选和筛选。

## 用法

`<TreeSelect v-model="value" :data="nodes" multiple filterable />`。输入框回显节点 `label`；多选时以标签展示选中项并支持删除。多选默认父子勾选联动（勾选父节点级联勾选子孙，子节点勾满自动选中父节点），设置 `check-strictly` 后父子勾选解耦，部分子节点选中的父节点展示半选状态。

## API

### 属性

| 参数            | 说明                                       | 类型                                       | 默认值   |
| --------------- | ------------------------------------------ | ------------------------------------------ | -------- |
| `modelValue`    | 选中值，多选时为数组                       | `string \| number \| (string \| number)[] \| null` | `null`   |
| `data`          | 树形节点数据                               | `TreeSelectNode[]`                         | `[]`     |
| `multiple`      | 是否多选                                   | `boolean`                                  | `false`  |
| `checkStrictly` | 父子勾选是否解耦                           | `boolean`                                  | `false`  |
| `filterable`    | 是否显示筛选框                             | `boolean`                                  | `false`  |
| `collapseTags`  | 多选时折叠标签                             | `boolean`                                  | `false`  |
| `maxCollapseTags` | 折叠时显示的标签数                       | `number`                                   | `1`      |
| `placeholder`   | 占位文本                                   | `string`                                   | `请选择` |
| `clearable`     | 是否可清空                                 | `boolean`                                  | `false`  |
| `disabled`      | 是否禁用                                   | `boolean`                                  | `false`  |
| `validateEvent` | 选中变化时触发表单校验                     | `boolean`                                  | `true`   |

`TreeSelectNode`：`{ value: string | number; label: string; children?: TreeSelectNode[]; disabled?: boolean }`。

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
