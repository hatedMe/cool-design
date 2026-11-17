# Menu 菜单

## 组件介绍

Menu 用于页面导航和分组操作，支持水平/垂直模式、折叠、子菜单展开收起。API 对标 Element Plus，支持 `MenuItem`、`SubMenu`、`MenuItemGroup` 子组件与默认插槽，同时兼容旧版 `items` 数据驱动用法。

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
| `menu-trigger` | 子菜单触发方式（水平模式） | `hover` / `click` | `hover` |
| `collapse-transition` | 是否开启动画类名 | `boolean` | `true` |
| `background-color` | 背景色 | `string` | — |
| `text-color` | 文字颜色 | `string` | — |
| `active-text-color` | 激活文字颜色 | `string` | — |
| `router` | 开启后点击菜单项通过 vue-router 导航（目标取 `route`/`to`，缺省用 `index`） | `boolean` | `false` |
| `ellipsis` | 水平模式是否收纳溢出（类名） | `boolean` | `true` |

### Menu 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:modelValue` | 激活项变化（兼容 `v-model`） | `index: string` |
| `select` | 选中菜单项 | `index: string, indexPath: string[], item: unknown` |
| `open` | 子菜单展开 | `index: string, indexPath: string[]` |
| `close` | 子菜单收起 | `index: string, indexPath: string[]` |

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

### MenuItem 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `index` | 唯一索引（必填） | `string` | — |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `route` | 路由目标（`router` 开启时导航） | `string \| Record` | — |
| `to` | 链接目标（`router` 开启时导航） | `string \| Record` | — |

### MenuItem 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 菜单项内容 |

### SubMenu 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `index` | 唯一索引（必填） | `string` | — |
| `disabled` | 是否禁用 | `boolean` | `false` |

### SubMenu 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `title` | 子菜单标题 |
| `default` | 子菜单项 |

### MenuItemGroup 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `title` | 分组标题 | `string` | `''` |

### MenuItemGroup 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `title` | 自定义标题 |
| `default` | 分组内菜单项 |
