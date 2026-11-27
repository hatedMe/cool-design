# Element Plus 组件完整性排查（2026-11-27）

> 开发后更新：以下为修复前的审计快照。当前本轮确定性缺陷已处理，6 个底层入口已补齐；最新状态、逐项证据与仍需后续处理的国际化范围，见 [开发交付与验收报告](element-plus-compatibility-completion-2026-11-27.md)。

## 结论与统计口径

本次针对当前工作区重新检查，不直接沿用 2026-11-20 的缺项结论。未修改组件、测试或配置，只新增本报告。

- **官方总览 82 个条目均有对应实现或设计指南，主组件名单层面没有发现整项缺失。** 其中 Border、Color、Typography 是设计基础条目，不应要求同名可注册组件；Layout 对应 Row / Col；InfiniteScroll 对应指令；DateTimePicker / TimePicker / Calendar 存在共享实现。
- **公共组件导出还没有全部对齐。** Element Plus `2.14.8` 发布包有 123 个 `El*` 运行时导出，本项目实际构建产物有其中 117 个，缺 6 个底层组件入口，详见下文。该统计只比较 `El*` 名称，不包括全部 hooks、常量、类型与内部工具。
- **不能认定功能、参数、事件、插槽已经完全兼容。** 已确认 SelectV2 动态高度和前缀插槽、TableV2 尺寸和缩进、Menu 配置、Tour 内容样式、Tooltip 聚焦、Scrollbar 遮罩及 ARIA 落点等差距。
- 本地有 101 个业务组件/设计基础目录（排除 `style`、`directives`、`__test__`），全部有 README；这个数字包含拆出的子组件和共享入口，**不能直接拿来与官方 82 个页面数量比较**。

### 对照来源与方法

1. 在线查看[官方组件总览](https://element-plus.org/en-US/component/overview.html)，确认当前展示条目。
2. npm registry 查询得到稳定版本 `2.14.8`，随后下载该固定版本的[组件入口源码](https://github.com/element-plus/element-plus/blob/2.14.8/packages/components/index.ts)、79 份可匹配的官方组件文档以及[发布包运行时入口](https://unpkg.com/element-plus@2.14.8/es/index.mjs)。本次确定性缺项均以固定版本为依据。
3. 对本地实现、根导出、安装逻辑、README、文档路由和演示、测试进行交叉检查；自动扫描 API 表仅用于定位候选，继而复核共享实现和属性透传，避免把继承属性或同目录之外的实现误判为缺失。
4. 重新构建并实际加载 ESM / CJS，核对导出集合、全量安装及服务入口；对部分缺项进行 jsdom 挂载检查。

这里的“覆盖”只表示存在对应实现/指南，**不是所有行为已通过原版对照测试**。未执行逐组件浏览器视觉对照、完整 SSR hydration、全部默认值/参数类型/事件时序的差异测试，不提供缺乏证据的“功能兼容百分比”。

## 已确认差距

### P1：SelectV2 动态高度协议未实现

位置：[select-v2.tsx](../packages/cool-design/select-v2/select-v2.tsx#L20)。

当前提供固定 `itemHeight` 虚拟列表，没有官方 `estimated-option-height` 动态尺寸入口；`fit-input-width`、`scrollbar-always-on` 也未实现。`prefix` 插槽未调用，构建产物挂载时传入前缀内容没有渲染。

影响：迁移自定义多行选项时无法按官方协议启用动态尺寸；前缀消失；浮层宽度和滚动条定制无法直接迁移。应补动态尺寸能力和尺寸/插槽接口，不能只声明属性。

依据：[固定版本 SelectV2 文档](https://github.com/element-plus/element-plus/blob/2.14.8/docs/en-US/component/select-v2.md)。此前报告中远程搜索、创建条目、空值配置、persistent 默认值等问题已补入，不再列作现存缺项。

### P1：全局 locale 尚未贯通

位置：[SelectV2 默认文案](../packages/cool-design/select-v2/select-v2.tsx#L45)、[加载文案](../packages/cool-design/select-v2/select-v2.tsx#L581)。

SelectV2 仍使用中文 `placeholder`、空数据、无匹配、加载文案，没有读取 ConfigProvider 的语言配置。源码实际调用 `useLocale` 的组件实现目前仅发现 Select 与 DatePickerPanel；这不意味着其他组件全部没有间接语言支持，但足以确认尚不能承诺全库语言一致。

应先补 SelectV2 明确缺失的语言接入，再逐一验证其他有内置文案的组件。不能仅以 Provider 存在 locale 参数视为已经完成国际化。

### P2：公共入口缺 6 个底层组件

构建后的 ESM / CJS 根入口均缺：

| 官方导出 | 本地情况 | 建议 |
| --- | --- | --- |
| `ElCollapseTransition` | 无同名公共组件 | 若要求官方导入语句可迁移，补独立过渡组件及入口 |
| `ElOverlay` | 有覆盖层相关内部逻辑，无同名公共组件 | 补公共封装及事件契约 |
| `ElPopper` | 有浮层定位工具，无同名公共组件 | 明确是否支持官方底层组件协议 |
| `ElPopperArrow` | 未导出 | 与 Popper 组件族一起处理 |
| `ElPopperContent` | 未导出 | 与 Popper 组件族一起处理 |
| `ElPopperTrigger` | 未导出 | 与 Popper 组件族一起处理 |

这些是发布包实际公开的组件，但不在官方总览的独立组件页面清单中。因此“总览条目齐全”和“公开组件导出缺 6 个”可以同时成立。不要为追求名称数量把内部工具简单重命名导出；应先明确迁移需求并提供真实兼容协议。

此外，官方发布包还公开 `FixedSizeList` / `DynamicSizeList` / Grid 等虚拟化基础工具，以及大量 props、常量、类型。本次未对这部分作完整同构认证，不能把 117/123 理解成全包 API 覆盖率。

### P2：TableV2 尺寸与树形缩进配置不完整

位置：[table-v2.tsx 属性](../packages/cool-design/table-v2/table-v2.tsx#L58)、[树形缩进](../packages/cool-design/table-v2/table-v2.tsx#L656)。

未实现 `max-height`、`indent-size`、`h-scrollbar-size`、`v-scrollbar-size`、`scrollbar-always-on`。当前树形层级宽度硬编码为 `level * 16`，官方 `indent-size` 默认 `12`，不仅缺配置，默认视觉布局也有差异。

此前报告中的 sort-by 监听、列渲染器、动态行高测量、fixed-data、多行表头及滚动方法现已加入，不再按旧报告判为缺失。

依据：[固定版本 TableV2 文档](https://github.com/element-plus/element-plus/blob/2.14.8/docs/en-US/component/table-v2.md)。

### P2：Menu 缺省略图标与外部点击配置

位置：[menu.tsx](../packages/cool-design/menu/menu.tsx#L20)。

缺 `ellipsis-icon` 与 `close-on-click-outside`。已有 ellipsis 横向溢出机制和子菜单浮层，并不等于支持自定义溢出图标或官方外部点击收起开关。应分别补属性、传递和交互验证。

依据：[固定版本 Menu 文档](https://github.com/element-plus/element-plus/blob/2.14.8/docs/en-US/component/menu.md)。

### P2：Tour / TourStep 缺 content-style

位置：[tour.tsx](../packages/cool-design/tour/tour.tsx)、[tour-step.tsx](../packages/cool-design/tour-step/tour-step.tsx#L6)、[TourStep 类型](../packages/cool-design/tour/types.ts#L18)。

Tour 和 TourStep 均未声明或消费 `content-style`；配置类型也没有该字段。直接迁移单步骤内容样式定制无法按官方协议生效。应接入内容面板并明确步骤配置覆盖关系。

TourStep 本身已经存在；“Tour 没有声明式步骤组件”是旧状态，现不能继续这么判断。

依据：[固定版本 Tour 文档](https://github.com/element-plus/element-plus/blob/2.14.8/docs/en-US/component/tour.md)。

### P2：Tooltip 缺 focus-on-target

位置：[tooltip.tsx](../packages/cool-design/tooltip/tooltip.tsx#L269)。

没有 `focus-on-target` 开关和对应 hover 聚焦逻辑。现有 trapFocus 控制浮层内部焦点，不能替代该参数所要求的触发元素聚焦。

依据：[固定版本 Tooltip 文档](https://github.com/element-plus/element-plus/blob/2.14.8/docs/en-US/component/tooltip.md)。

### P2：Scrollbar 新遮罩能力与 ARIA 落点不一致

位置：[scrollbar.tsx 属性](../packages/cool-design/scrollbar/scrollbar.tsx#L26)、[渲染](../packages/cool-design/scrollbar/scrollbar.tsx#L215)。

- 缺 `mask` 渐变边缘遮罩能力；这是官方 `2.14.8` 已有接口，不是 dev 分支候选项。
- `role`、`aria-label`、`aria-orientation` 未作为 view 属性消费，而是按 Vue 默认行为落在根节点。对构建产物挂载 `role="listbox"`，实际节点为 `.i-scrollbar`，不是 `.i-scrollbar__view`；官方定义这些参数作用于 view。

应按官方语义将 ARIA 属性传至内容视图，并补遮罩显示、方向及主题变量。

依据：[固定版本 Scrollbar 文档](https://github.com/element-plus/element-plus/blob/2.14.8/docs/en-US/component/scrollbar.md)。

### P3：补充核对项与文档欠项

- ConfigProvider 缺 `experimental-features`，其对 Virtualized Select 等实验能力的影响应按版本评估，优先级低于稳定主路径。
- Select 缺 `show-arrow` / 旧 `suffix-transition` 兼容入口；Cascader 缺自定义 `clear-icon`。其中旧兼容参数可按明确的迁移支持策略决定是否补齐。
- TreeV2 官方文档列出 `node-drop`，当前事件列表和节点渲染没有对应处理；这是外部拖入节点的事件，**不应直接扩展成要求 TreeV2 提供与 Tree 相同的内部节点拖拽能力**。
- CheckboxGroup、RadioGroup README 未列默认插槽 API；TimePicker README 未列插槽 API。应补实际支持项或写明支持范围，避免用户依靠阅读共享实现判断能力。Link 已在正文描述插槽和 click，不能因缺独立标题就判为完全没有文档。
- 这些补充项以源码/文档核对为主，未逐个作浏览器交互复现；原生 input 属性、共享实现和兼容旧别名不纳入自动扫描直接定罪。

## 旧审计中已补齐的重点

实际根入口导出并全量注册了 `ElAvatarGroup`、`ElDatePickerPanel`、`ElColorPickerPanel`、`ElTourStep`、`ElAutoResizer`、`ElCheckTag`。AvatarGroup 虽未直接列入根安装数组，但 Avatar.install 会注册它，不能据此误报漏装。

MessageBox / ElMessageBox 根入口已经可调用，confirm 方法存在；ESM 与 CJS 导出键集合一致。Form 已接入 async-validator，支持 callback、数组 trigger、路径和指定字段方法；Tree / TreeV2 的 checkOnClickLeaf 已为 true。组件 CSS 子路径、全局组件类型、El 别名、文档演示懒加载等也已加入。

上述是当前实现和现有验证所能确认的改进，仍不等于所有边界已与原版一致。

## 官方总览逐项清单

下表的“文档/实现”给出本地可追溯入口；演示与测试仅表示有对应文件/共享用例，不代表场景足够。子组件往往在父组件目录实现，不重复按缺少目录计数。

| 分类 | 官方条目 | 文档/实现 | 演示 | 测试文件 | 结论 |
| --- | --- | --- | --- | --- | --- |
| 基础 | `button` | [本地入口](../packages/cool-design/button/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 基础 | `border` | [本地入口](../packages/cool-design/border/README.md) | 有 | 设计基础，无专属单测 | 设计基础/布局组合，已覆盖 |
| 基础 | `color` | [本地入口](../packages/cool-design/color/README.md) | 有 | 设计基础，无专属单测 | 设计基础/布局组合，已覆盖 |
| 基础 | `container` | [本地入口](../packages/cool-design/container/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 基础 | `icon` | [本地入口](../packages/cool-design/icon/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 基础 | `layout` | [本地入口](../packages/cool-design/layout/README.md) | 有 | 有 | 设计基础/布局组合，已覆盖 |
| 基础 | `link` | [本地入口](../packages/cool-design/link/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 基础 | `text` | [本地入口](../packages/cool-design/text/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 基础 | `scrollbar` | [本地入口](../packages/cool-design/scrollbar/README.md) | 有 | 有 | 有明确差距：mask、ARIA 落点 |
| 基础 | `space` | [本地入口](../packages/cool-design/space/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 基础 | `splitter` | [本地入口](../packages/cool-design/splitter/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 基础 | `typography` | [本地入口](../doc/markdown/guide/typography.md) | 指南 | 不适用 | 设计指南，已覆盖 |
| 配置 | `config-provider` | [本地入口](../packages/cool-design/config-provider/README.md) | 有 | 有 | 语言贯通、实验配置仍需补齐 |
| 表单 | `autocomplete` | [本地入口](../packages/cool-design/autocomplete/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `cascader` | [本地入口](../packages/cool-design/cascader/README.md) | 有 | 有 | 有清空图标参数差距 |
| 表单 | `checkbox` | [本地入口](../packages/cool-design/checkbox/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `color-picker-panel` | [本地入口](../packages/cool-design/color-picker-panel/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `color-picker` | [本地入口](../packages/cool-design/color-picker/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `date-picker-panel` | [本地入口](../packages/cool-design/date-picker-panel/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `date-picker` | [本地入口](../packages/cool-design/date-picker/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `datetime-picker` | [本地入口](../packages/cool-design/date-time-picker/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `form` | [本地入口](../packages/cool-design/form/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `input` | [本地入口](../packages/cool-design/input/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `input-number` | [本地入口](../packages/cool-design/input-number/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `input-tag` | [本地入口](../packages/cool-design/input-tag/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `input-otp` | [本地入口](../packages/cool-design/input-otp/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `mention` | [本地入口](../packages/cool-design/mention/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `radio` | [本地入口](../packages/cool-design/radio/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `rate` | [本地入口](../packages/cool-design/rate/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `select` | [本地入口](../packages/cool-design/select/README.md) | 有 | 有 | 有部分兼容参数差距 |
| 表单 | `select-v2` | [本地入口](../packages/cool-design/select-v2/README.md) | 有 | 有 | 有明确差距：动态尺寸、宽度、前缀、语言 |
| 表单 | `slider` | [本地入口](../packages/cool-design/slider/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `switch` | [本地入口](../packages/cool-design/switch/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `time-picker` | [本地入口](../packages/cool-design/time-picker/README.md) | 有 | 有 | 共享实现，插槽文档需补 |
| 表单 | `time-select` | [本地入口](../packages/cool-design/time-select/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `transfer` | [本地入口](../packages/cool-design/transfer/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `tree-select` | [本地入口](../packages/cool-design/tree-select/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 表单 | `upload` | [本地入口](../packages/cool-design/upload/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `avatar` | [本地入口](../packages/cool-design/avatar/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `badge` | [本地入口](../packages/cool-design/badge/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `calendar` | [本地入口](../packages/cool-design/calendar/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `card` | [本地入口](../packages/cool-design/card/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `carousel` | [本地入口](../packages/cool-design/carousel/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `collapse` | [本地入口](../packages/cool-design/collapse/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `descriptions` | [本地入口](../packages/cool-design/descriptions/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `empty` | [本地入口](../packages/cool-design/empty/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `image` | [本地入口](../packages/cool-design/image/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `infinite-scroll` | [本地入口](../packages/cool-design/directives/index.ts) | 指令文档/演示 | 有 | 以指令提供，已导出和安装 |
| 数据展示 | `pagination` | [本地入口](../packages/cool-design/pagination/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `progress` | [本地入口](../packages/cool-design/progress/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `result` | [本地入口](../packages/cool-design/result/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `skeleton` | [本地入口](../packages/cool-design/skeleton/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `table` | [本地入口](../packages/cool-design/table/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `table-v2` | [本地入口](../packages/cool-design/table-v2/README.md) | 有 | 有 | 有明确差距：尺寸、缩进、滚动条 |
| 数据展示 | `tag` | [本地入口](../packages/cool-design/tag/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `timeline` | [本地入口](../packages/cool-design/timeline/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `tour` | [本地入口](../packages/cool-design/tour/README.md) | 有 | 有 | 有明确差距：内容样式 |
| 数据展示 | `tree` | [本地入口](../packages/cool-design/tree/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `tree-v2` | [本地入口](../packages/cool-design/tree-v2/README.md) | 有 | 有 | node-drop 事件待补 |
| 数据展示 | `statistic` | [本地入口](../packages/cool-design/statistic/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 数据展示 | `segmented` | [本地入口](../packages/cool-design/segmented/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 导航 | `affix` | [本地入口](../packages/cool-design/affix/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 导航 | `anchor` | [本地入口](../packages/cool-design/anchor/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 导航 | `backtop` | [本地入口](../packages/cool-design/backtop/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 导航 | `breadcrumb` | [本地入口](../packages/cool-design/breadcrumb/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 导航 | `dropdown` | [本地入口](../packages/cool-design/dropdown/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 导航 | `menu` | [本地入口](../packages/cool-design/menu/README.md) | 有 | 有 | 有明确差距：省略图标、外部点击 |
| 导航 | `page-header` | [本地入口](../packages/cool-design/page-header/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 导航 | `steps` | [本地入口](../packages/cool-design/steps/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 导航 | `tabs` | [本地入口](../packages/cool-design/tabs/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `alert` | [本地入口](../packages/cool-design/alert/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `dialog` | [本地入口](../packages/cool-design/dialog/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `drawer` | [本地入口](../packages/cool-design/drawer/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `loading` | [本地入口](../packages/cool-design/loading/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `message` | [本地入口](../packages/cool-design/message/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `message-box` | [本地入口](../packages/cool-design/message-box/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `notification` | [本地入口](../packages/cool-design/notification/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `popconfirm` | [本地入口](../packages/cool-design/popconfirm/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `popover` | [本地入口](../packages/cool-design/popover/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 反馈 | `tooltip` | [本地入口](../packages/cool-design/tooltip/README.md) | 有 | 有 | 有明确差距：hover 聚焦 |
| 其他 | `divider` | [本地入口](../packages/cool-design/divider/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |
| 其他 | `watermark` | [本地入口](../packages/cool-design/watermark/README.md) | 有 | 有 | 条目已覆盖，未认证全量兼容 |

## 本次验证结果

| 检查 | 实际结果 |
| --- | --- |
| `pnpm test` | 151 个文件、1804 项测试通过 |
| `pnpm typecheck` | 通过 |
| `pnpm typecheck:docs` | 通过 |
| `pnpm lint` | 0 错误、4 条现有 `v-html` 警告 |
| `pnpm build` | 通过 |
| `pnpm build:docs` | 通过，仍有大 chunk 警告，最大主 chunk 约 831 kB |
| 构建后 ESM / CJS 导出集合 | 两种格式的根导出键集合一致 |
| 官方发布包 `El*` 根导出差集 | 123 项中覆盖 117 项，缺 6 项底层组件 |
| 新补组件全量安装 | 上述 6 个已补组件均可用并注册 |
| MessageBox 根服务 | `ElMessageBox` 与 `.confirm` 均为函数 |
| SelectV2 prefix 挂载检查 | 传入 prefix 插槽未渲染，已复现 |
| Scrollbar ARIA 挂载检查 | role 落在根节点，未落至 view，已复现 |

测试使用项目现有 jsdom 环境，不能替代真实浏览器定位、滚动、动态行高、键盘焦点及视觉对照。测试日志还存在个别现有 Vue 警告，测试通过不代表运行时没有警告。

## 建议处理顺序

1. 先处理业务可见行为：SelectV2 动态尺寸/前缀/语言、TableV2 尺寸及缩进、Menu 外部点击和图标。
2. 再补公共稳定 API：Tour content-style、Tooltip focus-on-target、Scrollbar mask 和 ARIA。
3. 若目标是官方公共组件导入完全可迁移，再补 6 个底层组件入口及其真实协议；hooks、常量和类型作为另一个明确范围验收。
4. 完善文档欠项，补官方风格的契约测试，再开展浏览器交互、视觉和 SSR 回归。

最终判断：**组件目录和官方总览覆盖已经基本补齐；后续重点是 API 与行为兼容，另有 6 个底层公共组件入口待补。**

?????????
