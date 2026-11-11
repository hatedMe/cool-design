# Tag 标签

### 组件介绍

用简洁的标签展示状态、分类和筛选条件，支持不同样式及关闭操作。

## 用法

```vue
<Tag type="success" closable @close="removeTag">已启用</Tag>
<Tag type="warning" effect="dark" round>待审核</Tag>
```

## API 说明

### 属性

| 参数     | 说明                                              | 类型    | 默认值       |
| -------- | ------------------------------------------------- | ------- | ------------ |
| type                | 类型：`primary` / `success` / `warning` / `danger` / `info` | `TagType` | `primary` |
| closable            | 是否可关闭                                                | `boolean` | `false` |
| disable-transitions | 是否禁用关闭动画                                          | `boolean` | `false` |
| hit                 | 是否有边框描边                                            | `boolean` | `false` |
| color               | 自定义标签背景色                                          | `string` | — |
| size                | 尺寸：`small` / `default` / `large`                       | `Size` | 继承全局尺寸 |
| effect              | 主题：`light` / `plain` / `dark`                          | `TagEffect` | `light` |
| round               | 是否为圆角标签                                            | `boolean` | `false` |
| disabled            | 禁止点击与关闭（项目扩展属性）                            | `boolean` | `false` |

### 事件

| 事件名 | 说明                                   | 回调参数          |
| ------ | -------------------------------------- | ----------------- |
| click  | 点击标签                              | `event: MouseEvent` |
| close  | 标签关闭按钮触发，不自动移除          | `event: MouseEvent` |

### 插槽

| 名称    | 说明     |
| ------- | -------- |
| default | 标签内容 |

关闭按钮不会冒泡 `click` 事件，`close` 事件触发后由调用方决定是否移除标签。
