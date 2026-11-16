# Collapse 折叠面板

### 介绍

展开收起内容区域，支持多开与手风琴模式。API 对标 Element Plus，使用 `CollapseItem` 子组件组织面板，支持 `v-model` 受控与切换拦截。

### 基础用法

```vue
<Collapse v-model="active">
  <CollapseItem title="一致性" name="1">内容一</CollapseItem>
  <CollapseItem title="反馈" name="2">内容二</CollapseItem>
</Collapse>
```

设置 `accordion` 同时只展开一项。使用 `before-collapse` 拦截切换，返回 `false` 或 `Promise<false>` 可阻止。

### API

#### Collapse 属性

| 参数                      | 说明                                              | 类型                                                  | 默认值  |
| ------------------------- | ------------------------------------------------- | ----------------------------------------------------- | ------- |
| `model-value` / `v-model` | 激活面板 `name`；手风琴模式为单个值，否则为数组   | `string` / `number` / `array`                         | —       |
| `accordion`               | 是否为手风琴模式                                  | `boolean`                                             | `false` |
| `expand-icon-position`    | 展开图标位置：`left` / `right`                    | `string`                                              | `right` |
| `before-collapse`         | 切换前拦截，参数为切换后的激活数组与当前项 `name` | `(next, name) => boolean \| Promise<boolean> \| void` | —       |

#### Collapse 事件

| 事件名              | 说明       | 回调参数                       |
| ------------------- | ---------- | ------------------------------ |
| `update:modelValue` | 激活项变化 | 手风琴：`name`，否则：`name[]` |
| `change`            | 激活项变化 | 同上                           |

#### Collapse 插槽

| 名称      | 说明                  |
| --------- | --------------------- |
| `default` | `CollapseItem` 子组件 |

#### Collapse Exposes

| 方法                    | 说明                         |
| ----------------------- | ---------------------------- |
| `activeNames`           | 当前激活 `name` 数组（只读） |
| `setActiveNames(names)` | 设置激活项                   |

#### CollapseItem 属性

| 参数       | 说明                                           | 类型                   | 默认值  |
| ---------- | ---------------------------------------------- | ---------------------- | ------- |
| `name`     | 唯一标识                                       | `string` / `number`    | 序号    |
| `title`    | 标题文本                                       | `string`               | `''`    |
| `disabled` | 是否禁用                                       | `boolean`              | `false` |
| `icon`     | 自定义展开图标（图标类名或组件），替换默认箭头 | `string` / `Component` | —       |

#### CollapseItem 插槽

| 名称      | 说明                                   |
| --------- | -------------------------------------- |
| `title`   | 自定义标题，优先级高于 `title` 属性    |
| `default` | 面板内容                               |
| `icon`    | 自定义展开图标，优先级高于 `icon` 属性 |

### 使用说明

未提供 `modelValue` 时为非受控模式，内部管理展开状态。标题为原生按钮，支持 Enter/Space 切换，上下方向键、Home/End 在标题间移动焦点；展开状态通过 `aria-expanded` 与面板关联。
