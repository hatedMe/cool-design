# Menu 菜单

## 组件介绍

Menu 用于页面导航和分组操作，支持水平/垂直模式、折叠、子菜单展开收起。支持 `MenuItem`、`SubMenu`、`MenuItemGroup` 子组件与默认插槽，同时兼容旧版 `items` 数据驱动用法。

## 基础用法

使用 `default-active` 设置激活项，`default-openeds` 设置默认展开的子菜单。

```vue
<Menu default-active="1-1" :default-openeds="['1']" @select="onSelect">
  <SubMenu index="1">
    <template #title>导航一</template>
    <MenuItem index="1-1">选项一</MenuItem>
    <MenuItem index="1-2" disabled>选项二</MenuItem>
  </SubMenu>
</Menu>
```

模式：`vertical` / `horizontal`。折叠时设置 `collapse`。

## 子菜单浮层

水平菜单和折叠后的垂直菜单使用浮层。一级浮层默认挂载到浮层宿主，嵌套浮层默认渲染在父浮层中。使用子菜单的 `teleported` 可以覆盖挂载位置。

浮层沿用根菜单的 `text-color`、`active-text-color` 和 `background-color`，可以用 `popper-style` 覆盖这些样式。设置 `--i-menu-active-color` 可以覆盖面板内的激活色。

在浮层标题上按方向键可展开并聚焦首个可用菜单项。按 `Escape` 关闭当前浮层并将焦点返回标题，点击浮层之外可收起当前浮层。

将 `persistent` 设为 `false` 时，浮层关闭并完成离场后销毁内容。图标按组配置，展开组用于垂直展开菜单和水平一级子菜单，折叠组用于其它浮层子菜单。

```vue
<Menu collapse :persistent="false" :popper-style="['padding: 4px', { minWidth: '200px' }]">
  <SubMenu
    index="settings"
    :collapse-close-icon="PlusIcon"
    :collapse-open-icon="MinusIcon"
    :hide-timeout="400">
    <template #title>设置</template>
    <MenuItem index="account">账户</MenuItem>
  </SubMenu>
</Menu>
```

## 数据驱动（兼容）

通过 `items` 传入菜单项并使用 `v-model` 控制激活项，`children` 会渲染为子菜单。

```vue
<Menu v-model="active" :items="items" mode="horizontal" />
```

## API

### Menu 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `modelValue` | 激活项索引（兼容用法），受控 | `string` | — |
| `default-active` | 初始激活项索引 | `string` | `''` |
| `default-openeds` | 初始展开的子菜单索引 | `string[]` | `[]` |
| `items` | 数据驱动菜单项（兼容） | `MenuItemData[]` | `[]` |
| `mode` | 模式 | `vertical` / `horizontal` | `vertical` |
| `collapse` | 是否折叠 | `boolean` | `false` |
| `unique-opened` | 是否只展开一个子菜单 | `boolean` | `false` |
| `menu-trigger` | 水平子菜单的触发方式。折叠垂直菜单也读取该配置，`hover` 支持悬停，`click` 通过点击触发 | `hover` / `click` | `hover` |
| `collapse-transition` | 是否开启动画类名 | `boolean` | `true` |
| `background-color` | 背景色 | `string` | — |
| `text-color` | 文字颜色 | `string` | — |
| `active-text-color` | 激活文字颜色 | `string` | — |
| `router` | 开启后点击菜单项通过 vue-router 导航（目标取 `route`/`to`，缺省用 `index`） | `boolean` | `false` |
| `ellipsis` | 控制样式类 `is-ellipsis`，当前无溢出重排 | `boolean` | `true` |
| `popper-offset` | 浮层与触发器的间距，单位 px | `number` | `6` |
| `popper-effect` | 浮层主题，内置 `light` / `dark` | `string` | `light` |
| `popper-class` | 浮层的自定义类名 | `MenuPopperClass` | — |
| `popper-style` | 浮层面板的行内样式，支持字符串、对象及嵌套数组 | `StyleValue \| boolean` | — |
| `teleported` | 统一指定浮层挂载位置（兼容用法），子菜单显式设置优先 | `boolean` | `undefined` |
| `show-timeout` | 悬停展开延时，单位毫秒 | `number` | `300` |
| `hide-timeout` | 悬停收起延时，单位毫秒 | `number` | `300` |
| `persistent` | 从首次渲染起挂载浮层内容，关闭时保留内容 | `boolean` | `true` |

`MenuPopperClass` 接受字符串、布尔值、类名对象或这些值组成的嵌套数组。可在子菜单设置 `false` 清除继承的类名或样式。

### Menu 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:modelValue` | 激活项变化（兼容 `v-model`） | `index: string` |
| `select` | 选中菜单项。启用且提供路由实例时附带导航 Promise，成功导航后更新激活项 | `index: string, indexPath: string[], item: MenuItemClicked, routerResult?: MenuRouterResult` |
| `open` | 子菜单展开 | `index: string, indexPath: string[]` |
| `close` | 子菜单收起 | `index: string, indexPath: string[]` |

`MenuItemClicked` 包含 `index`、`indexPath` 及可选的 `route`、`to`。路由模式下 `route` 是实际导航目标。 `MenuRouterResult` 为 `Promise<void \| Error>`。

### Menu 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | `MenuItem` / `SubMenu` / `MenuItemGroup` 子组件 |

### Menu 方法

| 方法名 | 说明 | 参数 |
| ------ | ---- | ---- |
| `open` | 展开子菜单 | `index: string` |
| `close` | 收起子菜单 | `index: string` |
| `updateActiveIndex` | 手动更新激活项 | `index?: string` |
| `handleResize` | 兼容方法（无操作） | — |

如果 `persistent` 为 `false` 且插槽中的嵌套子菜单已经卸载，调用 `open` 时先展开父级使子菜单重新挂载。

### MenuItem 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `index` | 唯一索引（必填） | `string` | — |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `route` | 路由目标（`router` 开启时导航） | `string \| Record<string, unknown>` | — |
| `to` | 链接目标（`router` 开启时导航） | `string \| Record<string, unknown>` | — |

### MenuItem 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `click` | 鼠标点击菜单项 | `event: MouseEvent` |

### MenuItem 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 菜单项内容 |
| `title` | 菜单项标题，作为默认插槽的回退内容 |

### SubMenu 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `index` | 唯一索引（必填） | `string` | — |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `popper-class` | 当前浮层的自定义类名 | `MenuPopperClass` | 继承菜单 |
| `popper-style` | 当前浮层的行内样式 | `StyleValue \| boolean` | 继承菜单 |
| `popper-offset` | 当前浮层的间距，单位 px | `number` | 继承菜单 |
| `show-timeout` | 当前浮层的悬停展开延时，单位毫秒 | `number` | 继承菜单 |
| `hide-timeout` | 当前浮层的悬停收起延时，单位毫秒 | `number` | 继承菜单 |
| `teleported` | 是否将当前浮层传送到浮层宿主 | `boolean` | 一级 `true`，嵌套 `false` |
| `expand-close-icon` | 展开组的关闭态图标，与 `expand-open-icon` 成对使用 | `string \| Component` | — |
| `expand-open-icon` | 展开组的打开态图标，与 `expand-close-icon` 成对使用 | `string \| Component` | — |
| `collapse-close-icon` | 折叠组的关闭态图标，与 `collapse-open-icon` 成对使用 | `string \| Component` | — |
| `collapse-open-icon` | 折叠组的打开态图标，与 `collapse-close-icon` 成对使用 | `string \| Component` | — |

图标字符串使用应用中注册的组件名称。每组缺少任一状态的图标时使用默认箭头。

### SubMenu 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `title` | 子菜单标题 |
| `default` | 子菜单项 |

### SubMenu 实例

| 属性 | 说明 | 类型 |
| ---- | ---- | ---- |
| `opened` | 当前展开状态 | `boolean`（只读） |

### MenuItemGroup 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `title` | 分组标题 | `string` | `''` |

### MenuItemGroup 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `title` | 自定义标题 |
| `default` | 分组内菜单项 |
