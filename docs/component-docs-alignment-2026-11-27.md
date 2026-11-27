# 组件文档对齐检查（2026-11-27）

## 结论

**修复前存在明确的文档展示问题、漏项与过时描述，本轮已修正并分别提交。当前文档与实现的已确认偏差已处理；不能据此宣称与 Element Plus 全部功能、默认值及交互完全一致。**

本次以当前实现和 Element Plus `2.14.8` 为依据，扫描 105 份组件 README、117 个可识别的运行时 props/emits 接口，并复核文档站页面、运行示例、关联 API 和公开实例类型。只修改文档与文档站回归测试，没有修改组件运行时代码。

## 已修复问题

| 范围 | 修复前问题 | 当前状态 |
| --- | --- | --- |
| Collapse / Carousel / Card / Dialog / Popover / Popconfirm / Tooltip | 使用 `### API`，文档站按 `## API` 分割，API 没有独立显示 | 统一标题层级；7 个实际页面回归先失败后通过 |
| 40 份属性表 | 模板属性名称混用 camelCase 和 kebab-case | 309 行使用标准模板属性名称；事件、JS 对象字段、服务选项保留原协议 |
| 22 个无自定义事件的组件 | 缺少事件说明 | 明确无自定义事件，不凭空增加事件 |
| Menu | 正文无条件声称点击外部可收起，新属性另附在末尾 | 明确 close-on-click-outside 默认关闭，新属性并入主 API；标注主题默认值差异 |
| Tour / TourStep | gap 类型不完整，缺 show-arrow 等主 API；只列旧 indicator 名称；声明式步骤说明分散 | 完整声明式示例、对象 gap、标准 indicators 插槽和步骤覆盖规则；单列扩展、默认值差异；prev/next 参数明确为目标索引 |
| SelectV2 | 使用说明仍只讲固定高度；候选位置默认数组过时；prefix 仅在正文说明；新增属性在附表 | 补动态高度路径，修正 fallback-placements；prefix 入插槽表，新属性并入主表；语言默认值按 locale 描述，selectedLabel 单列只读实例属性 |
| CheckboxButton / CheckboxGroup | 漏旧值别名、fill、text-color、validate-event | 补已支持的属性与优先级 |
| RadioGroup | 漏 options、props、type | 补数据驱动选项及字段映射 |
| DatePicker | 漏日期时间模式的箭头和禁用时间属性 | 补对应参数及生效范围 |
| TreeSelect | 漏部分 Tree/Select 透传属性 | 补展开、当前项、拖拽、远程、标签及无障碍等参数 |
| Tooltip | 漏 aria-label、trigger-class、hover-on-focus | 补 API，标注项目扩展 |
| Form | 方法表只写失败 reject，与 callback 模式说明矛盾 | 明确有 callback 时 resolve false，无 callback 时 reject |
| Row | 声称 gutter 可传响应式对象，实际只支持 number | 改为只支持数字 |
| Link | 图标类型只写 string；事件、插槽混在正文 | 补 Component 类型和专门的事件/插槽表 |
| Statistic | 实例 displayValue 写为 ComputedRef | 按公开实例接口改为已解包的只读 string |
| Message | 未说明插槽能力 | 明确当前不消费自定义插槽，使用 message 字符串/VNode |
| Popper | 类型表混用非类型文字 | 明确 Placement 和 class 类型 |
| 快速上手 | 模板属性与 JavaScript 字段命名边界不清 | 增加命名约定和兼容范围说明 |

补齐的原未提及公开属性共 30 项；共享文档、事件回调参数与内部协作参数没有重复计数。

## 避免误报的处理

- DateTimePicker 的共用属性已链接 DatePicker，不要求复制整张 API 表；它仍作为本库扩展入口说明。
- TableColumn 的其余列配置已链接 Table，JavaScript 列字段保留 camelCase；Vue 的保留 key 不作为普通组件参数强行列出。
- PopperTrigger 的 onMouseenter/onClick 等为原生事件回调，按事件说明，不另造 on-mouseenter 这样的模板属性。
- CascaderPanel embedded、ColorPickerPanel popupEditor、DatePicker inlineTimeRules、Tooltip 内部关闭协调回调及 Message repeatNum 属于内部协作，不因 runtime props 能看到就承诺为用户公共接口。
- Boolean/数值文档默认值与 props.default 不同的候选，结合 Form/Provider、旧别名和运行时回退规则复核；未把继承默认值误改成 undefined。
- Border、Color、Layout 为基础样式或组合指南，不机械添加无意义的事件与插槽段落。

运行时字段名扫描结合上述继承与排除后，没有留下新的待复核缺项。该扫描用于发现候选，**不能证明每个参数类型、默认值、插槽作用域和事件时序已逐一认证**。

## 仍存在的实现差异

| 项目 | 当前实现及文档说明 | 官方对照 |
| --- | --- | --- |
| Menu popper-effect | 默认 light，文档如实记录；需要原版默认观感时显式设为 dark | [2.14.8 Menu 文档](https://github.com/element-plus/element-plus/blob/2.14.8/docs/en-US/component/menu.md) |
| Tour gap | 默认数字 10；支持显式对象，可传 `{ offset: 6, radius: 2 }` | [2.14.8 Tour 文档](https://github.com/element-plus/element-plus/blob/2.14.8/docs/en-US/component/tour.md) |
| TimePicker 插槽 | 当前不消费自定义插槽，文档已明确限制 | [本地 TimePicker 支持范围](../packages/cool-design/time-picker/README.md) |
| 国际化 | 本轮之前完成 SelectV2；其他组件的确定缺项和候选仍按 LOC01—LOC06 跟进 | [语言盘点及后续任务](locale-coverage-2026-11-27.md) |
| 扩展接口 | 配置式 Tour steps、部分回调返回值、列配置等继续作为扩展说明 | 各组件 README 的扩展和支持范围 |

这些应作为后续实现对齐任务，不能只改文档默认值或补一个空 API 来制造兼容结论。

## 验证

- `pnpm test examples/docs`：2 个文件、152 项测试通过，包含 7 个新增 API 页面展示回归。
- `pnpm typecheck:docs`：通过；Tour 新完整 SFC 示例按文档站既有源文件导入规则单独纳入编译验证。
- `pnpm build:docs`：通过，保留既有大 chunk 提示。
- 全部 README 表格列数检查通过；组件文档内部路由链接检查未发现失效目标。
- 文档测试文件 ESLint 与 Git diff whitespace 检查通过。

## 本轮提交

```text
c8d0d4e docs(components): restore dedicated api sections
92a1d2d docs(api): use canonical template attribute names
136a15b docs(api): clarify components without custom events
7ad834e docs(checkbox-button): document legacy value aliases
111f360 docs(checkbox-group): complete group attributes
6f5116d docs(date-picker): document time control attributes
691e7a9 docs(form): clarify callback validation results
5745e13 docs(link): align icon types and event slots
28f0dca docs(menu): clarify outside click and theme defaults
89439fa docs(message): clarify content and slot support
4dbb33d docs(popper): clarify placement and class types
947ab0a docs(radio-group): document data driven options
2a12abf docs(row): correct gutter support
cea07fa docs(select-v2): align defaults slots and dynamic sizing
fd9149a docs(statistic): correct exposed display value type
48d3187 docs(tooltip): document accessibility and trigger options
f889c48 docs(tour): align steps slots and compatibility defaults
7cb7c87 docs(tree-select): complete forwarded attributes
372a66a docs(guide): clarify template and object api naming
```

最终检查报告另行提交。全部工作在当前 dev 分支，沿用独立修复分别提交的约定。

?????????
