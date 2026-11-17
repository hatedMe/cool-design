# Dropdown 下拉菜单

## 组件介绍

Dropdown 将多个操作收纳到下拉菜单中，支持悬停/点击/右键触发、分裂按钮与键盘操作。API 对标 Element Plus，支持 `DropdownMenu` / `DropdownItem` 子组件与 `dropdown` 插槽，同时兼容旧版 `items` 数据驱动用法。

## 基础用法

```vue
<Dropdown trigger="click" @command="onCommand">
  <button type="button">更多操作</button>
  <template #dropdown>
    <DropdownMenu>
      <DropdownItem command="edit">编辑</DropdownItem>
      <DropdownItem command="delete" divided>删除</DropdownItem>
    </DropdownMenu>
  </template>
</Dropdown>
```

触发方式：`hover` / `click` / `contextmenu`，支持数组组合。命令值支持 `string` / `number` / `object`。

## 分裂按钮与数据驱动

```vue
<Dropdown split-button size="small" :items="items" @click="onMain" @command="onCommand">
  操作
</Dropdown>
```

## API

### Dropdown 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `items` | 数据驱动菜单项（兼容） | `DropdownItemOption[]` | `[]` |
| `trigger` | 触发方式 | `hover` / `click` / `contextmenu` | `hover` |
| `hide-on-click` | 点击菜单项后是否关闭 | `boolean` | `true` |
| `placement` | 菜单位置（自动翻转、随浮层定位） | `string` | `bottom` |
| `show-timeout` / `hide-timeout` | hover 触发的展开/收起延时，单位 ms，`0` 表示立即 | `number` | `150` |
| `max-height` | 菜单最大高度，超出滚动 | `number` / `string` | `172` |
| `teleported` | 菜单是否传送到 body | `boolean` | `true` |
| `popper-class` | 菜单浮层自定义类名 | `string` | — |
| `split-button` | 是否为分裂按钮 | `boolean` | `false` |
| `size` | 分裂按钮尺寸 | `large` / `default` / `small` | `''` |
| `disabled` | 是否禁用 | `boolean` | `false` |

### Dropdown 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `click` | 分裂按钮左侧点击 | `event: MouseEvent` |
| `command` | 点击菜单项 | `command: string \| number \| object` |
| `visible-change` | 下拉显隐变化 | `visible: boolean` |

### Dropdown 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 触发内容；分裂按钮时为左侧按钮文字 |
| `dropdown` | 下拉菜单（通常为 `DropdownMenu`） |

### Dropdown 方法

| 方法名 | 说明 | 参数 |
| ------ | ---- | ---- |
| `handleOpen` | 打开下拉 | — |
| `handleClose` | 关闭下拉 | — |

### DropdownMenu 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | `DropdownItem` 列表 |

### DropdownItem 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `command` | 命令值 | `string \| number \| object` | `''` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `divided` | 是否显示分隔线 | `boolean` | `false` |
| `icon` | 图标 | `string` | `''` |

### DropdownItem 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `click` | 点击菜单项（未禁用时） | `event: MouseEvent` |

### DropdownItem 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 菜单项内容 |
| `icon` | 自定义图标 |
