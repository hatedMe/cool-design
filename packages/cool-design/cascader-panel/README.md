# CascaderPanel 级联面板

### 介绍

级联选择的纯面板组件（对齐 Element Plus `CascaderPanel`），不含触发器输入框，适合嵌入弹层、设置页等自定义交互场景。

## 基础用法

`options` 传层级数据，点击节点展开下一列；`v-model` 绑定选中值（`emitPath` 默认输出完整路径数组）。`multiple` 多选（复选框级联，`check-strictly` 解耦），`border` 控制面板边框。

```vue
<CascaderPanel v-model="value" :options="options" />
```

## API

### 属性

| 参数            | 说明                                       | 类型                  | 默认值 |
| --------------- | ------------------------------------------ | --------------------- | ------ |
| `modelValue`    | 选中值（`v-model`），多选时为数组          | `CascaderModelValue`  | —      |
| `options`       | 层级数据                                   | `CascaderOption[]`    | `[]`   |
| `props`         | 字段映射（`label` / `value` / `children` / `disabled` / `leaf`） | `CascaderPropsMapping` | — |
| `emitPath`      | 值是否包含完整路径（false 时只输出节点值） | `boolean`             | `true` |
| `multiple`      | 多选（复选框级联）                         | `boolean`             | `false` |
| `checkStrictly` | 父子勾选解耦（单选时任意层级可选）         | `boolean`             | `false` |
| `border`        | 显示面板边框                               | `boolean`             | `true` |
| `lazy`          | 懒加载子级（展开无子级节点时调用 `lazyLoad`） | `boolean`          | `false` |
| `lazyLoad`      | 懒加载回调，`resolve(children)` 注入子级   | `(node, resolve) => void` | — |
| `expandTrigger` | 展开触发方式：`click` / `hover`            | `string`              | `click` |

与 `Cascader` 共享同一份节点建树、勾选级联与展开列逻辑，行为保持一致。

`CascaderOption`：`{ value?, label?, children?, disabled?, leaf?, ... }`；`CascaderModelValue`：`value | value[] | (value | value[])[] | null`。

### 事件

| 事件名              | 说明                     | 回调参数             |
| ------------------- | ------------------------ | -------------------- |
| `update:modelValue` | 选中值变化               | `value`              |
| `change`            | 选中值变化               | `value`              |
| `expand-change`     | 展开列变化（路径值数组） | `values`             |

### 插槽

| 名称      | 说明                                     |
| --------- | ---------------------------------------- |
| `default` | 自定义节点文本，作用域 `{ node, data }`  |

### 实例方法

| 方法                      | 说明                             |
| ------------------------- | -------------------------------- |
| `getCheckedNodes(leafOnly?)` | 获取选中节点数据（多选勾选态） |
