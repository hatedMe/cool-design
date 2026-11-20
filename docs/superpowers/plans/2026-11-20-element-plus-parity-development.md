# 组件兼容性修复开发计划

> 执行方式：主执行者逐项实施，每项交给独立代码审查者审查；修复所有发现的问题、复审通过后，才允许创建该项 Git 提交。用户已授权按本计划修复和本地提交，不自动推送或发布。

**目标：** 修复 2026-11-20 审计发现的功能、入口、类型、文档及交付差距，使已声明支持的接口具备可验证的迁移兼容性。

**依据：** `docs/element-plus-parity-audit-2026-11-20.md`。API 以 Element Plus `2.14.8` 固定版本为基线；官方开发分支候选项先复核，不机械实现。

**架构：** 保留 Vue 3、TypeScript、TSX、Vant 式组件目录及现有品牌主题。复用 useField、useConfig、useEmptyValues、useFloating、overlay stack；保留现有 i 前缀和配置式扩展，通过兼容入口补齐原版使用协议。

**技术栈：** Vue 3、TypeScript、Vite、Vitest、Vue Test Utils、Sass、async-validator、Day.js、pnpm。

## 约束与完成标准

- 每个编号是独立修复单元，禁止把未审查的下一项混入提交。
- 审计的候选差异先对照固定版本源码/官方用例核实。已支持或不属于基线的项目，记录证据后关闭，不制造无意义改动。
- 不删除既有扩展，不大范围重构。默认值修正及迁移影响写入 CHANGELOG。
- 新组件使用 `packages/cool-design/<name>/`，包含实现、index.ts、index.scss、README、demo、测试；同步主入口、全量安装、样式与文档目录。
- 文档包括介绍、用法、属性、事件、插槽、实例方法；类型和枚举使用反引号。
- 默认不新增运行时依赖；只有确认既有设施无法提供所需协议时才评估依赖方案。
- 不关闭检查规则掩盖问题，不通过仅改测试期望“修复”兼容性缺陷。
- 视觉基线保留品牌主题；需修复暗色、焦点、溢出和尺寸行为，不承诺复制官方色板。

## 每项必须执行的流程

1. 读取本项文件及固定版本对应 API，记录确切预期和 BASE 提交。
2. 先添加能复现差异的行为/消费者测试并观察失败；对于候选项，先复现，无法确认则记录证据。
3. 最小修改实现，同步类型、README 和必要示例、迁移记录。
4. 运行本项测试与关联组件测试、`pnpm typecheck`、`pnpm lint`；涉及文档示例时加 `pnpm typecheck:docs`；涉及入口/构建时先构建再测试实际产物。
5. 将未提交 diff、要求、验证结果交给独立审查者。审查覆盖正确性、兼容性、回归、测试有效性和范围，不仅检查格式。
6. 任何审查发现均修复或以源码/测试证据排除误报，再请求复审。最终记录“无未解决问题”才允许提交。
7. 明确列出本项文件后 `git add <files>`，不使用 `git add .`。提交信息描述本次行为；记录提交 SHA、验证结果和审查结论。
8. 更新本计划执行记录并继续下一项；不能以“测试通过”代替“审查通过”。

纯计划/文档变更采用文档一致性审查，不新增镜像测试。每阶段结束运行 `pnpm verify`；最终还必须完成浏览器与 SSR 专项。

## 阶段 A：发布与高影响行为

### 01. MessageBox 发布入口

- [x] 文件：`packages/cool-design/index.ts`、`message-box/index.ts`、`__test__/index.spec.ts`、`__test__/package-exports.spec.ts`、README 与 CHANGELOG；通过根入口保留服务引用即可保全默认导出，无需增加构建配置或改动既有示例。
- 保留根入口 MessageBox / MessageBoxComponent 声明式组件，在 MessageBox 上附加 confirm/alert/prompt/msgbox/close；根入口 ElMessageBox 和子路径默认导出提供可调用服务，不破坏旧模板消费方式。
- 验收：源码与构建后的 ESM/CJS 根入口和子路径导出一致；执行服务、确认/取消及关闭；全量/单组件安装仍注册声明式组件。
- 验证：先 `pnpm build`，再 `pnpm exec vitest run packages/cool-design/__test__ packages/cool-design/message-box/__test__`，并检查示例类型。

### 02. Form 校验规则协议

- [x] 文件：`form/types.ts`、`form/context.ts`、`form-item/form-item.tsx`、相应 README 与测试。
- 接入官方 validator(rule,value,callback)、asyncValidator、trigger 数组；兼容既有单参数 Promise 校验器；支持 prop 路径数组，注册字段使用统一路径键。
- 验收：同步 callback、异步 callback、Promise、抛错、多个触发器、嵌套/数组字段均正确；过期校验不覆盖新状态；回调不能重复结束。
- 验证：`pnpm exec vitest run packages/cool-design/form/__test__`，关联输入控件测试及类型检查。

### 03. Form 实例与状态协议

- [x] 文件：`form/form.tsx`、`form-item/form-item.tsx`、`form/types.ts`、测试和 README。
- 补 validate/validateField callback 与 Promise 契约、官方错误字段结构、指定字段 resetFields/clearValidate、getField、scroll-into-view-options、validate-status 和校验状态暴露；根据基线复核初始值设置 API。
- 验收：仅指定字段被重置/清除；失败 reject、callback 参数、错误对象正确；既有无参数调用保持可用。
- 依赖：02。验证：Form 全部测试及全部表单组件回归。

### 04. Tree 与 TreeV2 默认值、插槽和实例方法

- [ ] 文件：`tree/`、`tree-v2/`、相关旧计划与 CHANGELOG。
- 分别核实并修正 check-on-click-leaf 默认值；补 TreeV2 setData、默认插槽 data；不能根据 Tree 的契约推断 TreeV2。
- 验收：默认点击叶节点与显式 false 两条路径；替换数据后 checked/current/expanded 状态符合基线；修正旧文档错误。
- 验证：`pnpm exec vitest run packages/cool-design/tree/__test__ packages/cool-design/tree-v2/__test__ packages/cool-design/tree-select/__test__`。

### 05. TableV2 受控排序

- [ ] 文件：`table-v2/table-v2.tsx`、测试、README。
- 监听官方 sortBy 动态变化，明确与已有 sortState 扩展的优先级；排序清空与列变化不遗留旧状态。
- 验收：替换对象、修改 key/order、清空排序后表头与数据一致；保留自有排序循环行为。
- 验证：TableV2 全部测试。

## 阶段 B：全局基础协议

### 06. 全局服务层级及组件默认配置

- [ ] 文件：`config-provider/`、`message/`、`notification/`、`dialog/`、`button/`、`link/`、`table/` 与测试。
- 按基线补组件配置对象；服务接入全局 zIndex、上下文与递增层级，显式组件参数优先。
- 验收：高层 Dialog 内的消息可见；嵌套 Provider 正确继承；多应用配置互不串扰；closeAll 清理实例。

### 07. 空值协议

- [ ] 文件：`packages/hooks/use-empty-values.ts`、SelectV2/TreeSelect/DatePicker/TimePicker/ColorPicker/Cascader/TimeSelect。
- 分组件独立完成并审查提交；统一 emptyValues/valueOnClear 及函数返回 undefined/null，尊重组件级覆盖与全局继承。
- 验收：每次清空函数仅调用一次，模型、change/clear 参数一致；范围值和多选值按对应 API 处理。

### 08. 尺寸、禁用及表单集成

- [ ] 文件：`segmented/`、`color-picker/`、各表单组件回归测试。
- Segmented 补 useField/useConfig、direction、validate-event、aria-label；ColorPicker size 采用组件 > Form > Provider 顺序。
- 验收：全局/表单禁用下鼠标和键盘均不能修改值；尺寸继承正确；validate-event=false 不触发校验。

### 09. 公开兼容别名与全局类型

- [ ] 文件：`src/utils/with-install.ts`、主入口、服务入口、新全局类型声明、发布类型消费者测试。
- 保留 i-* / I*，添加基线 El* 命名与注册；明确 Notification/Notify 及 MessageBox 的服务/组件命名；声明 GlobalComponents 与 ComponentCustomProperties。
- 验收：命名导出、模板全局组件、服务类型在消费者项目可用；无重名覆盖和循环导出；旧接口继续工作。

## 阶段 C：选择与输入

### 10. SelectV2 搜索与选项协议

- [ ] 文件：`select-v2/`。
- 补 remote/remote-method/debounce、allow-create、default-first-option、reserve-keyword；对齐 filter-method，保留逐项过滤扩展需使用明确兼容方式；支持布尔模型值。
- 验收：外部异步 options、请求竞态、创建后选中、禁用选项、分组过滤、键盘导航及空值清理。

### 11. SelectV2 浮层、标签与暴露

- [ ] 文件：`select-v2/`，复用 `src/utils/use-floating.ts`。
- 补 append-to、persistent 默认值、图标/标签效果、loading-text、selectedLabel、滚动事件及基线虚拟列表接口。
- 验收：overflow 容器和指定宿主可用；关闭后保留面板符合配置；滚动定位不丢选中态。

### 12. TreeSelect 组合协议

- [ ] 文件：`tree-select/`、Tree/Select 关联测试。
- 对齐支持的 Select/Tree 属性、事件、插槽及 selectRef/treeRef 暴露；将 getCheckedKeys 等操作转发到真实 Tree，禁止只声明空实现。
- 验收：懒加载、缓存标签、严格/级联勾选、筛选、原生表单值、键盘及方法调用。

### 13. Autocomplete 定位和建议协议

- [ ] 文件：`autocomplete/`。
- 补 value-key、共享浮层与挂载、header/footer、官方实例方法；保留已有防抖和竞态保护，修复防抖等待期间旧响应覆盖的边界。
- 验收：自定义建议字段、指定挂载、关闭/卸载中的请求、方向键循环与 IME。

### 14. TimeSelect

- [ ] 文件：`time-select/`。
- 补 editable/format/include-end-time/图标、输入筛选和完整键盘选择；对齐起止值、步长、min/max 边界，复用基线用例而非猜测。
- 验收：非对齐结束时间、自定义格式、输入与选择模型一致、禁用项不可选。

### 15. Cascader 与 CascaderPanel

- [ ] 文件：`cascader/`、`cascader-panel/`。
- 补 persistent、浮层/标签配置、prefix/header/footer/suggestion-item、点击勾选、hoverThreshold；复核稳定版虚拟滚动及 show-checked-strategy 范围。
- 验收：单/多选、严格/级联、懒加载、hover、过滤与 tag 删除；Panel 与弹出选择器共享语义。

### 16. Select

- [ ] 文件：`select/`、`select-option/`、`select-option-group/`。
- 补 clear/suffix 图标、tag-effect、滚动事件、selectedLabel 等基线差项；复核 autocomplete/debounce/remote-show-suffix。
- 验收：声明式与 options 两种方式、外部异步、分组、自定义图标、布尔/对象值及实例暴露。

### 17. Checkbox 与 Radio

- [ ] 文件：`checkbox/`、`checkbox-group/`、`radio/`、`radio-group/`、`radio-button/`。
- Checkbox 补旧 true-label/false-label 和 label 值兼容，value 优先；组按钮 fill/text-color。RadioGroup 按基线补 options/字段映射。
- 验收：新旧属性优先级、数字/布尔值、禁用、min/max、组键盘导航；两组件族分别审查提交。

### 18. Input / InputNumber / InputTag / Mention / InputOTP

- [ ] 文件：对应组件目录；每个组件作为独立子项提交。
- Input 检查 attrs 落点、model-modifiers 与 textareaStyle；InputNumber 核实 disabled-scientific；InputTag 补 effect；Mention 补 tooltip 暴露；OTP 修复实际复现的外部重置、finish、粘贴/IME 差异。
- 验收：未声明 prop 但已透传的能力不重复修改；原生输入属性落到正确元素；值变化和事件时机符合基线。

### 19. Transfer

- [ ] 文件：`transfer/`。
- 补真实 leftPanel/rightPanel 引用及基线实例方法；先核实虚拟化是否为稳定版 API。
- 验收：筛选、选中清理、targetOrder、Form 禁用及面板方法，不破坏已有 props 映射。

## 阶段 D：新增组件与复杂展示

### 20. CheckTag

- [ ] 新建 `check-tag/`，同步主入口、样式和目录。
- 受控 checked、disabled、type、update:checked/change 及默认插槽按基线实现。
- 验收：鼠标/键盘、受控更新、禁用、安装和实际发布入口。

### 21. AutoResizer

- [ ] 新建 `auto-resizer/`，同步文档目录与入口。
- ResizeObserver 提供 width/height 插槽参数和 onResize 协议；支持 disableWidth/disableHeight 等基线参数。
- 验收：初始化、尺寸变化、卸载断开、SSR 无 DOM；嵌入 TableV2 官方风格示例可用。

### 22. TourStep 与 Tour

- [ ] 新建 `tour-step/`；修改 `tour/` 与主入口。
- 支持声明式步骤，保留 steps 扩展；gap 对象、indicators、步骤插槽/按钮属性、append-to、Escape 及目标点击配置。
- 验收：动态步骤/目标、受控 current、最后步骤 finish、关闭清理监听、键盘和缺失目标。

### 23. ColorPickerPanel 与 ColorPicker

- [ ] 新建 `color-picker-panel/`；复用/拆分 `color-picker/` 中颜色转换及面板逻辑。
- 实现色相、饱和度/亮度、透明度、文本与预设编辑；共享面板，分别对齐面板即时值和选择器预览/确认协议；ColorPicker 补 popper-style、persistent，并验证指定样式与关闭后面板保留/销毁。
- 验收：各颜色格式、alpha、清空/取消/确认、鼠标与键盘、Form/配置、独立组件与发布入口。

### 24. DatePickerPanel 与日期时间

- [ ] 新建公共 `date-picker-panel/`；复用 `date-picker/date-picker-panel.tsx`，同步各日期时间 README。
- 公共封装使用基线模型/事件；完善已核实日期时间差项，不把内部 select 事件直接当公共 v-model。
- 验收：单/范围/多值/周/月/年、禁用日期、value-format、范围中间态、日期与时间确认联动。

### 25. TableV2 渲染器和公开协议

- [ ] 文件：`table-v2/types.ts`、`table-v2.tsx`、README/示例。
- 补列渲染器、header/row/cell props、固定数据/默认展开、事件、overlay 和官方滚动方法；保留扩展插槽并明确优先级。
- 验收：渲染器参数、固定区、受控展开、多行表头、空态与 overlay、滚动接口。

### 26. TableV2 动态测量与网格

- [ ] 文件：`table-v2/`，必要时新增局部测量工具，不泛化成新框架。
- estimated-row-height 使用实际渲染测量，维护行高前缀和与滚动锚点；固定列和横纵滚动同步；对齐默认高度。
- 验收：长文本变化、异步内容、滚动窗口复用、排序/展开后测量失效、万行数据 DOM 有界。

### 27. Table / TableColumn

- [ ] 文件：`table/`、`table-column/`。
- 补 render-header、tooltip-options、append-filter-panel-to 及核实后的 row-expandable；评估自定义列包装展开，不能执行任意组件副作用来探测列。
- 验收：声明式/配置式、分组动态列、排序过滤、浮层宿主、固定列和展开。

## 阶段 E：弹层、导航与小型 API

### 28. Tooltip / Popover / Dropdown / Popconfirm

- [ ] 文件：对应目录及 `src/utils/use-floating.ts`；每个组件分开审查提交。
- 对齐 trigger-keys、transition、persistent、虚拟触发、append-to、箭头及实例暴露；对 popper-options 支持基线必要配置，不把 offset/placement 两字段宣称完整 Popper 协议。
- 验收：嵌套浮层、Escape、外部点击、虚拟锚点、滚动重定位、关闭后焦点与挂载清理。

### 29. Dialog / Drawer

- [ ] 文件：`dialog/`、`drawer/`。
- 补 modal-class、append-to-body、开关延迟、header-aria-level 及基线 transition/穿透；修正 Drawer 图标响应式警告。
- 验收：延迟取消、快速开关、嵌套锁滚动、焦点恢复、无遮罩与可穿透配置；分组件审查提交。

### 30. Menu / Pagination

- [ ] 文件：`menu/`、`pagination/`。
- Menu 补浮层样式/持久化与展开图标；Pagination 补前后图标、尺寸选择挂载与浮层属性。
- 验收：路由/折叠/键盘、尺寸切换/非受控分页、浮层宿主；分组件提交。

### 31. Scrollbar / Tabs / Affix

- [ ] 文件：对应组件目录。
- Scrollbar 补 end-reached/distance/原生 tabindex；Tabs 暴露 currentName/tabNavRef 并修复插槽警告；Affix 补 updateRoot 和基线挂载参数。
- 验收：边界重复事件、动态布局、Tabs 动态插槽更新、监听卸载；分组件提交。

### 32. Text / Space / Button 与 AvatarGroup 核实

- [ ] 文件：`text/`、`space/`、`button/`、`avatar/`。
- 分别补 isTruncated、prefix-cls、shouldAddSpace；核实 AvatarGroup 是否在 2.14.8，若属于则按新组件规范补齐，否则记录不适用证据。
- 验收：真实截断尺寸、类名前缀、中文间距判断、暴露值响应式；每项单独提交。

## 阶段 F：跨库交付

### 33. 国际化

- [ ] 文件：`config-provider/locale/`、所有包含固定界面文案的组件。
- 按基础/表单/展示/导航反馈分批，每批内按组件审查提交；使用官方 el 键结构，支持插值、中文/英文和第三方语言对象，补 Day.js locale 协调。
- 验收：运行时切换、嵌套继承、缺失键回退、服务上下文；不把用户内容误当语言键。

### 34. namespace

- [ ] 文件：`packages/hooks/use-namespace.ts`、组件实现/样式、token 与 Sass 配置。
- 按组件迁移动态类名，配套可配置 Sass namespace；保留默认 i；运行时 namespace 与编译样式必须有明确配套文档。
- 验收：默认主题回归、自定义命名空间完整样式、Teleport 浮层、服务、动画和 CSS 变量，不全局字符串替换。

### 35. 组件 CSS 发布入口

- [ ] 文件：`scripts/build.mjs`、`vite.config.ts`、`package.json`、发布测试和快速开始文档。
- 生成真实组件级 CSS，包含其依赖样式与 token，导出明确路径；保留全量 style.css。
- 验收：独立消费者仅引入一个组件及 CSS 即可显示；ESM/CJS、字体资源、树摇和全部子路径声明有效。

### 36. SSR ID 与多应用隔离

- [ ] 文件：`packages/hooks/use-id.ts`、Provider、DatePicker、Cascader、服务及相关上下文。
- 改用可注入且服务端/客户端一致的 ID 协议；不引入要求超出 Vue peerDependencies 的 API；服务状态归属明确。本项依赖06的上下文协议，完成后回归服务测试。
- 验收：真实 renderToString + hydration 无 mismatch；同页多应用不重复 ID/不串配置；请求间无状态泄漏。

### 37. 文档懒加载与消费者示例

- [ ] 文件：`doc/site/catalog.ts`、`doc/App.vue`、DemoBlock、文档站测试与 guide。
- 演示组件按页加载，保持源码展示与导航；统一示例真实导入、类型包裹、实例方法和兼容扩展标识；Breadcrumb 的 jsdom 导航提示通过测试事件处理消除，不改变正确导航行为。
- 验收：首屏无全量演示代码；切页/锚点/复制/代码高亮/错误提示可用；build:docs 与文档类型通过。

### 38. 浏览器交互、视觉和最终回归

- [ ] 文件：组件示例、必要的浏览器验证脚本、审计状态表。
- 覆盖审计中未确定具体缺陷的 Slider/Switch/Rate/Upload、布局、展示、指令等组件；真实验证焦点/键盘/拖拽/IME/overflow/暗色/缩放，复现的问题作为独立修复单元，审查后单独提交。
- 验收：全量 `pnpm verify`、发布消费者 ESM/CJS/类型/CSS、SSR 与浏览器结果均记录；审计每行有“修复提交”或“验证通过/不适用证据”。

## 审查重点

1. 文档声明与构建后真实导出必须一致，源码对象存在不代表发布成功。
2. 异步回调重复结束、竞态、关闭卸载后更新、IME 输入不能破坏值或状态。
3. undefined/null/false/0/空字符串、对象值、数组路径必须保留正确语义。
4. Provider 继承、组件显式覆盖、多应用与 SSR 请求不得串配置或重复 ID。
5. 键盘、定位、样式依赖与真实浏览器行为不能被 jsdom 的零尺寸结果掩盖。

## 执行记录

状态只在验证和审查完成后更新。格式：编号 / 测试与结果 / 审查结论 / 提交 SHA。分组件子项分别记录，不提前勾选整个阶段。

- 计划：独立审查发现3处缺漏，已修订并复审通过；计划提交 `6e121cd`。
- 01：完成。旧实现回归测试2项失败，修复后定向136项、全量117文件1134项通过；build、typecheck、typecheck:docs、lint通过（4个既有警告）。独立审查通过，无未解决问题；审查者额外验证实际ESM/CJS服务调用、声明式挂载与安装。修复及本条记录属于同一提交，可用 `git log --grep="修复消息确认框公开入口"` 查询。
- 02：完成。兼容三参数/异步校验、触发器数组和数组字段路径；独立审查提出的动态字段迁移、实例注销、规则短路、过期整表校验和错误合并问题均已增加红绿回归并修复。Form35项、关联165项、全量1149项测试及两项类型/lint通过（4个既有警告），独立复审通过，无未解决问题。提交可用 `git log --grep="修复表单规则与动态字段校验协议"` 查询。单参数 validator 沿用旧协议，默认/剩余参数隐藏签名的官方调用用 asyncValidator 显式选择，README已说明。
- 03：完成。Form 42 项、关联组件共 104 个文件 1004 项测试通过，类型、文档类型与 lint 通过（4 条既有文档警告）。独立审查和两次复审通过，无未解决问题。修改覆盖校验回调与错误结构、指定字段重置与清除、路径滚动、`getField`、`setInitialValues` 和 FormItem 校验状态。验证包含重复路径迁移、过期校验、类型化数组和普通类实例重置。提交可用 `git log --grep="修复表单实例方法与校验状态"` 查询。
- 04–38：待执行。

?????????
