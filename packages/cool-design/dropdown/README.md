# Dropdown 下拉菜单

## 组件介绍

Dropdown 将多个操作收纳到下拉菜单中，支持悬停/点击/右键触发、分裂按钮与键盘操作。支持 `DropdownMenu` / `DropdownItem` 子组件与 `dropdown` 插槽，同时兼容旧版 `items` 数据驱动用法。

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

触发方式支持 `hover`、`click`、`contextmenu` 和数组组合。单独使用 `hover` 时，打开、关闭各延迟 `150` 毫秒，可通过 `show-timeout` 和 `hide-timeout` 修改。其他触发配置即时响应。键盘按 `KeyboardEvent.code` 匹配，仍接受原有 `enter` 和 `space`。方向键在可用菜单项间移动，`Escape` 关闭并将焦点还给触发器。

## 分裂按钮与数据驱动

```vue
<Dropdown split-button size="small" :items="items" @click="onMain" @command="onCommand">
  操作
</Dropdown>
```

分裂按钮的主按钮触发 `click`。箭头作为菜单锚点，并在 `hover` 模式下继续支持点击切换。开启 `virtual-triggering` 后，可通过 `virtual-ref` 绑定外部触发元素。分裂按钮使用外部元素时也优先采用 `virtual-ref`。

菜单默认会保留隐藏节点，依赖关闭时销毁子组件的用法可设置 `:persistent="false"`。默认不限制菜单滚动区的固定高度，可用 `:max-height="172"` 恢复旧版限制。菜单使用固定的 `el-zoom-in-top` 过渡和 Popper 绝对定位，Popper 默认关闭 GPU 加速，支持用 `popper-options` 覆盖。

## API

### Dropdown 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `items` | 数据驱动菜单项（兼容） | `DropdownItemOption[]` | `[]` |
| `trigger` | 触发方式 | `hover` / `click` / `contextmenu` | `hover` |
| `hide-on-click` | 点击菜单项后是否关闭 | `boolean` | `true` |
| `placement` | 菜单位置，默认按 `bottom`、`top` 尝试回退 | `DropdownPlacement` | `bottom` |
| `show-timeout` / `hide-timeout` | hover 触发的展开/收起延时，单位 ms，`0` 表示立即 | `number` | `150` |
| `max-height` | 菜单滚动区最大高度，数字按像素处理 | `number` / `string` | `''` |
| `teleported` | 是否传送菜单到 `append-to` 指定的宿主，默认使用 body | `boolean` | `true` |
| `append-to` | 浮层的 Teleport 宿主 | `string` / `HTMLElement` | — |
| `persistent` | 隐藏时保留菜单节点 | `boolean` | `true` |
| `virtual-triggering` | 使用外部触发元素 | `boolean` | `false` |
| `virtual-ref` | 外部触发元素或 Popper 虚拟定位参考 | `TooltipVirtualRef` | — |
| `show-arrow` | 显示浮层箭头 | `boolean` | `true` |
| `popper-class` | 菜单浮层自定义类名 | `string` / `array` / `object` | — |
| `popper-style` | 菜单浮层自定义样式 | `string` / `CSSProperties` / `CSSProperties[]` | — |
| `popper-options` | Popper 定位配置，支持 `strategy`、`modifiers` 和 `onFirstUpdate` | `PopperOptions` | — |
| `effect` | 菜单主题：`light` / `dark` | `string` | `light` |
| `role` | 菜单无障碍角色 | `string` | `menu` |
| `tabindex` | 触发器 Tab 顺序 | `string` / `number` | `0` |
| `id` | 触发器 ID，同时用于标记菜单的无障碍名称 | `string` | — |
| `loop` | 方向键是否在首尾菜单项之间循环 | `boolean` | `true` |
| `trigger-keys` | 打开或关闭菜单的键盘 `code` | `string[]` | `['Enter', 'Space', 'ArrowDown', 'NumpadEnter']` |
| `split-button` | 是否为分裂按钮（复用按钮组） | `boolean` | `false` |
| `type` | 分裂按钮类型 | `''` / `default` / `primary` / `success` / `warning` / `danger` / `info` / `text` | — |
| `button-props` | 透传给分裂按钮组内的主按钮和箭头按钮 | `object` | — |
| `size` | 分裂按钮尺寸 | `large` / `default` / `small` | `''` |
| `disabled` | 是否禁用 | `boolean` | `false` |

### Dropdown 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `click` | 分裂按钮左侧点击 | `event: MouseEvent` |
| `command` | 激活菜单项 | `command: DropdownCommand`、`item: DropdownItemInstance`、`event: MouseEvent \| KeyboardEvent` |
| `visible-change` | 下拉显隐变化 | `visible: boolean` |

### Dropdown 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 触发内容；分裂按钮时为左侧按钮文字 |
| `dropdown` | 下拉菜单（通常为 `DropdownMenu`） |

### Dropdown 方法

| 方法名 | 说明 | 参数 |
| ------ | ---- | ---- |
| `handleOpen` | 打开下拉，遵循当前触发配置的延时 | — |
| `handleClose` | 关闭下拉，遵循当前触发配置的延时 | — |

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
| `icon` | 前置图标，字符串按图标类名经 Icon 渲染 | `string \| Component` | `''` |

### DropdownItem 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `click` | 点击或键盘激活可用菜单项，先于 Dropdown 的 `command`。鼠标事件调用 `preventDefault()` 会取消命令并保留菜单 | `event: MouseEvent \| KeyboardEvent` |

### DropdownItem 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 菜单项内容 |
| `icon` | 自定义图标 |
