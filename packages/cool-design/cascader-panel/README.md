# CascaderPanel 级联面板

### 介绍

级联选择的纯面板组件，不含触发器输入框，适合嵌入弹层、设置页等自定义交互场景。

## 基础用法

`options` 传层级数据，点击节点展开下一列；`v-model` 绑定选中值（`emitPath` 默认输出完整路径数组）。`multiple` 多选（复选框级联，`check-strictly` 解耦），`border` 控制面板边框。

```vue
<CascaderPanel v-model="value" :options="options" />
```

## API

### 属性

| 参数            | 说明                                       | 类型                  | 默认值 |
| --------------- | ------------------------------------------ | --------------------- | ------ |
| `model-value`    | 选中值（`v-model`），多选时为数组          | `CascaderModelValue`  | —      |
| `options`       | 层级数据                                   | `CascaderOption[]`    | `[]`   |
| `props`         | 字段映射（`label` / `value` / `children` / `disabled` / `leaf`） | `CascaderPropsMapping` | — |
| `emit-path`      | 值是否包含完整路径（false 时只输出节点值） | `boolean`             | `true` |
| `multiple`      | 多选（复选框级联）                         | `boolean`             | `false` |
| `check-strictly` | 父子勾选解耦（单选时任意层级可选）         | `boolean`             | `false` |
| `border`        | 显示面板边框                               | `boolean`             | `true` |
| `lazy`          | 懒加载子级（展开无子级节点时调用 `lazyLoad`） | `boolean`          | `false` |
| `lazy-load`      | 懒加载回调，`resolve(children)` 注入子级   | `(node, resolve) => void` | — |
| `expand-trigger` | 展开触发方式：`click` / `hover`            | `string`              | `click` |

与 `Cascader` 共享同一份节点建树、勾选级联与展开列逻辑，行为保持一致。

`CascaderOption`：`{ value?, label?, children?, disabled?, leaf?, ... }`；`CascaderModelValue`：`value | value[] | (value | value[])[] | null`。

`virtual-scroll`（`boolean`，默认 `false`）按窗口渲染选项。`item-size`（`number`，默认 `34`）指定行高，`height`（`number`，默认 `204`）指定滚动区域高度。两者均使用像素。

`props` 支持 `multiple`、`checkStrictly`、`emitPath`、`checkOnClickNode`（默认 `false`）、`checkOnClickLeaf`（默认 `true`）、`showPrefix`（默认 `true`）和 `hoverThreshold`（默认 `500` 毫秒）。单选非严格模式可直接点击叶节点。顶层 `multiple`、`checkStrictly` 和 `emitPath` 继续可用，显式设置时优先。懒加载回调第三个参数 `reject()` 结束本次加载并允许再次展开重试。


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
| `empty` | 自定义空状态，无参数 |

### 实例方法

| 方法                      | 说明                             |
| ------------------------- | -------------------------------- |
| `getCheckedNodes(leafOnly?)` | 获取选中节点数据（多选勾选态） |

实例还公开 `clearCheckedNodes()`、`getFlattedNodes(leafOnly?)`、`scrollToExpandingNode()` 、`loadLazyRootNodes()` 和 `handleKeyDown(event)`。`loadLazyRootNodes()` 加载懒加载模式的根节点。
