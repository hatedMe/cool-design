# Popconfirm 气泡确认

### 介绍

在触发按钮附近确认操作，适合停用、移除等简单确认场景。API 对标 Element Plus，支持 `reference` 触发器、自定义图标、按钮文案与类型、受控显示。

### 基础用法

```vue
<Popconfirm title="确定删除该用户吗？" @confirm="remove">
  <template #reference>
    <Button type="danger">删除</Button>
  </template>
</Popconfirm>
```

### API

#### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `model-value` / `v-model` | 可选受控可见性，省略时内部管理 | `boolean` | — |
| `title` | 确认问题 | `string` | `确定执行此操作吗？` |
| `placement` | 方向：`top` / `top-start` / `top-end` / `bottom` / `bottom-start` / `bottom-end` / `left` / `left-start` / `left-end` / `right` / `right-start` / `right-end` | `Placement` | `bottom` |
| `confirm-button-text` | 确认按钮文字 | `string` | `确定` |
| `cancel-button-text` | 取消按钮文字 | `string` | `取消` |
| `confirm-button-type` | 确认按钮类型 | `default` / `primary` / `success` / `warning` / `danger` / `info` / `text` | `primary` |
| `cancel-button-type` | 取消按钮类型 | `default` / `primary` / `success` / `warning` / `danger` / `info` / `text` | `default` |
| `disabled` | 禁止打开确认框 | `boolean` | `false` |
| `icon` | 自定义图标（图标类名或组件） | `string` / `Component` | — |
| `icon-color` | 图标颜色 | `string` | `#f90` |
| `hide-icon` | 隐藏标题前图标 | `boolean` | `false` |
| `effect` | 主题：`light` / `dark` | `string` | `light` |
| `width` | 面板宽度，支持数字或 CSS 尺寸 | `number` / `string` | — |
| `teleported` | 是否将浮层传送到挂载容器 | `boolean` | `true` |
| `append-to` | 挂载容器选择器或元素 | `string` / `HTMLElement` | — |
| `persistent` | 关闭后是否保留浮层节点 | `boolean` | `false` |
| `hide-after` | 确认后自动关闭的延迟，单位 ms，`0` 表示确认后立即关闭 | `number` | `0` |

#### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `update:modelValue` | 可见性更新请求 | `value: boolean` |
| `confirm` | 确认操作 | — |
| `cancel` | 取消、外部点击、Esc 或自动关闭 | — |

#### 插槽

| 名称 | 说明 |
| --- | --- |
| `reference` | 触发元素（推荐） |
| `default` | 触发元素（兼容） |
| `icon` | 自定义标题前图标 |
| `actions` | 自定义底部按钮区 |

### 使用说明

确认与取消各只触发一次，重复点击不会重复触发；外部点击、Esc 视为取消。

打开后聚焦取消按钮，Tab 在确认框内循环；关闭后焦点恢复到触发元素。浮层定位与主题继承同 Tooltip。确认后立即请求关闭，异步操作的锁定与错误提示由调用者管理；需要确认框内失败重试时使用 MessageBox。
