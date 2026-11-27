# Element Plus 2.14.8 底层公共组件契约

本规格用于本次 T09—T11。来源固定为 [2.14.8 组件源码](https://github.com/element-plus/element-plus/tree/2.14.8/packages/components)。本地继续使用 Vant 风格组件目录，公开品牌名称与 El 别名指向同一实现。

| 官方入口 | 本地入口 | 注册方式 |
| --- | --- | --- |
| `ElCollapseTransition` | `CollapseTransition` / `i-collapse-transition` | 按需及全量安装 |
| `ElOverlay` | `Overlay` / `i-overlay` | 按需及全量安装 |
| `ElPopper` | `Popper` / `i-popper` | 按需及全量安装 |
| `ElPopperArrow` | `PopperArrow` / `i-popper-arrow` | 按需及全量安装 |
| `ElPopperContent` | `PopperContent` / `i-popper-content` | 按需及全量安装 |
| `ElPopperTrigger` | `PopperTrigger` / `i-popper-trigger` | 按需及全量安装 |

## CollapseTransition

来源：`collapse-transition/src/collapse-transition.vue`。默认插槽包裹一个可过渡元素；透传 Vue Transition 参数及生命周期回调。进入/离开对 max-height、padding、overflow 做临时处理；完成、取消后恢复样式。没有额外自定义属性、事件或实例方法。

消费示例：`<ElCollapseTransition><div v-show="open">内容</div></ElCollapseTransition>`。

## Overlay

来源：`overlay/src/overlay.ts`。

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| mask | `boolean` | `true` |
| custom-mask-event | `boolean` | `false` |
| overlay-class | `string` / `array` / `object` / `boolean` | — |
| z-index | `string` / `number` | — |

默认插槽为遮罩内容。click 事件参数为原生 MouseEvent，仅当按下、释放、点击都在遮罩自身时发送；custom-mask-event 开启后不自动发送。mask=false 时仍有固定占满容器，无默认遮罩样式/遮罩点击。无公开实例方法。

消费示例：`<ElOverlay :z-index="2100" @click="close"><section>内容</section></ElOverlay>`。

## Popper 根组件

来源：`popper/src/popper.ts`、`popper.vue`、`constants.ts`。role 默认为 `tooltip`；可选 `dialog` / `grid` / `group` / `listbox` / `menu` / `navigation` / `tooltip` / `tree`。默认插槽无额外包装元素，无自定义事件。

公开 triggerRef、contentRef、referenceRef、popperInstanceRef 和 role；根上下文共享这些 ref。实例暴露经 Vue 解包后可直接读取值。

## PopperTrigger

来源：`popper/src/trigger.ts`、`trigger.vue`。

支持 virtual-ref（提供 getBoundingClientRect 的对象）、virtual-triggering=false、id、open=false；支持 onMouseenter、onMouseleave、onClick、onKeydown、onFocus、onBlur、onContextmenu 回调及原生属性。默认插槽为单个触发元素/组件，正常模式不增加包装节点，虚拟模式不渲染触发节点。

tooltip role 下打开时通过 aria-describedby 关联 id；其他 role 使用 aria-haspopup、aria-expanded、aria-controls。虚拟 HTMLElement 也绑定监听及 ARIA，引用变化/卸载时清理并恢复已有属性。公开 triggerRef。

## PopperContent

来源：`popper/src/content.ts`、`content.vue`、`composables/use-content-dom.ts`。

| 属性族 | 默认值与类型 |
| --- | --- |
| boundaries-padding / offset / arrow-offset | `number`，依次为 `0` / `12` / `5` |
| placement / strategy | Popper `Placement` / `absolute` 或 `fixed`，默认为 `bottom` / `absolute` |
| fallback-placements / popper-options | `Placement[]` / `Partial<Options>`，默认未设置 / 空对象 |
| gpu-acceleration / enterable / stop-popper-mouse-event | `boolean`，默认 `true` |
| visible / pure / focus-on-show / trapping / virtual-triggering / loop | `boolean`，默认 `false` |
| effect | `string`，默认 `dark` |
| id / aria-label | `string`，默认未设置 |
| style / popper-style | Vue `StyleValue`，默认未设置 |
| class-name / popper-class | Vue class 值，默认未设置 |
| reference-el / trigger-target-el | `HTMLElement`，默认未设置 |
| z-index | `number`，默认未设置，使用当前配置层级 |

默认插槽放内容及 PopperArrow；内容不自行 Teleport，不接管父组件的显隐过渡。reference-el 优先于根 referenceRef/triggerRef。trigger-target-el 指定 role/id/aria-label/aria-modal 的落点，未指定时落在内容节点。

事件：mouseenter / mouseleave 携带 MouseEvent；focus / blur / close 无参数。focus-on-show 控制打开后的焦点，trapping/loop 控制焦点约束；Escape 请求 close。公开 popperContentRef、popperInstanceRef、contentStyle、updatePopper(shouldUpdateZIndex=true)。

## PopperArrow

来源：`popper/src/arrow.ts`、`arrow.vue`。arrow-offset 默认为 `5`；在 PopperContent 中渲染带 data-popper-arrow 的箭头，定位样式由内容上下文提供。公开 arrowRef，无自定义事件和插槽。

组合消费示例：

```vue
<ElPopper role="tooltip">
  <ElPopperTrigger id="example-tip" :open="open" @mouseenter="open = true" @mouseleave="open = false">
    <button>查看说明</button>
  </ElPopperTrigger>
  <ElPopperContent v-show="open" id="example-tip" :visible="open" placement="bottom">
    说明内容
    <ElPopperArrow />
  </ElPopperContent>
</ElPopper>
```

## 本地复用边界

- `src/utils/with-install.ts` 负责品牌名及 El 别名注册；构建入口继续由组件 index.ts 自动发现。
- 定位复用 `src/utils/use-floating.ts` 及已有 `@popperjs/core`，不新增定位依赖；底层 Content 不默认接管外部点击关闭。
- 遮罩只提供元素和点击协议，不复制 Dialog/Drawer 的滚动锁、弹层栈或焦点控制。
- 不要求重写已有 Tooltip / Popover；保留其现有行为，通过回归验证公共组件新增不影响它们。

?????????
