# Popper 底层浮层

### 介绍

Popper、PopperTrigger、PopperContent、PopperArrow 组成底层定位组件族，对应同名 El 入口。显隐和 Teleport 由调用方控制，组件族不自动执行外部点击关闭。

## 用法

```vue
<Popper role="tooltip">
  <PopperTrigger id="tip" :open="open" @mouseenter="open = true" @mouseleave="open = false"><button>说明</button></PopperTrigger>
  <PopperContent v-show="open" id="tip" :visible="open">说明内容<PopperArrow /></PopperContent>
</Popper>
```

## API

### Popper 属性

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| role | `tooltip` / `dialog` / `grid` / `group` / `listbox` / `menu` / `navigation` / `tree` | `tooltip` |

### PopperTrigger 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| virtual-ref | 虚拟定位引用 | `HTMLElement` / `VirtualElement` | — |
| virtual-triggering | 不渲染默认触发节点，使用外部引用 | `boolean` | `false` |
| id | 关联内容 ID | `string` | — |
| open | 用于触发节点 ARIA 展开状态 | `boolean` | `false` |

### PopperContent 属性

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| placement | `Placement` | `bottom` |
| strategy | `absolute` / `fixed` | `absolute` |
| offset / boundaries-padding / arrow-offset | `number` | `12` / `0` / `5` |
| fallback-placements | `Placement[]` | — |
| popper-options | `Partial<Options>` | `{}` |
| gpu-acceleration / enterable / stop-popper-mouse-event | `boolean` | `true` |
| visible / pure / focus-on-show / trapping / virtual-triggering / loop | `boolean` | `false` |
| effect | `string` | `dark` |
| id / aria-label | `string` | — |
| style / popper-style | `StyleValue` | — |
| class-name / popper-class | `string` / `array` / `object` / `boolean` | — |
| reference-el / trigger-target-el | `HTMLElement` | — |
| z-index | `number` | 当前配置层级 |

`reference-el` 优先于根组件的 referenceRef 和 triggerRef。`trigger-target-el` 指定 ARIA 属性的目标，默认是内容元素。`visible` 用于定位监听与焦点管理，显示/隐藏请使用 `v-show` 或过渡。

### PopperArrow 属性

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| arrow-offset | `number` | `5` |

### 事件

Trigger 转发 `mouseenter`、`mouseleave`、`click`、`keydown`、`focus`、`blur`、`contextmenu` 原生事件。Content 提供 `mouseenter` / `mouseleave`（`MouseEvent`）、`focus` / `blur` / `close`（无参数）。根组件和 Arrow 无自定义事件。

### 插槽

| 组件 | default |
| --- | --- |
| Popper | 触发与内容组件 |
| PopperTrigger | 单个触发元素或组件，虚拟模式不渲染 |
| PopperContent | 内容和 Arrow |

Arrow 无插槽。

### 实例

- Popper：`triggerRef`、`contentRef`、`referenceRef`、`popperInstanceRef`、`role`。
- Trigger：`triggerRef`。
- Content：`popperContentRef`、`popperInstanceRef`、`contentStyle`、`updatePopper(shouldUpdateZIndex = true)`。
- Arrow：`arrowRef`。
