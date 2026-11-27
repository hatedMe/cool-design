# Element Plus 组件兼容性开发修复任务

> 执行说明：直接在当前工作区的当前分支执行，使用“逐项执行计划”技能，按任务编号实施并记录验收结果。不新建或切换分支，不创建额外工作树。本轮开发已执行，具体交付、验证结果和范围说明见末尾执行记录。

**目标：** 修复本次审计确认的组件 API 与交互差距，补齐 6 个底层公共组件入口，使约定范围内的 Element Plus `2.14.8` 用法可迁移。

**实现方式：** 复用现有组件、配置上下文和浮层工具；组件功能、属性、事件、插槽与默认值对齐 Element Plus，目录与组件组织延续当前 Vant 风格。每个任务单独形成可测试、可审查的交付。

**技术栈：** Vue 3、TypeScript、TSX、SCSS、Vitest、Vue Test Utils、Vite、pnpm。

**需求依据：** [2026-11-27 对标审计](../../element-plus-parity-audit-2026-11-27.md)。官方契约固定参考 `https://github.com/element-plus/element-plus/tree/2.14.8`，不混入 dev 分支新增能力。

## 一、范围和约束

- 所有修复、测试和验收均在当前分支完成，保留工作区已有改动，不覆盖或回退与本任务无关的内容。
- 保留现有 `i-*` / `I*` 用法、`El*` 兼容别名、品牌主题以及项目扩展；不通过删除旧接口达成兼容。
- 只修改任务涉及的源码、类型、样式、测试、文档和发布入口，不顺手重构其他组件。
- 属性必须实际参与渲染或交互；增加同名属性、空组件、空方法不算完成。
- 新增或修改 API 同步公开类型、README 与演示。文档包含介绍、用法、属性、事件和插槽；无对应事件或插槽时明确说明。类型、枚举值使用反引号。
- 修复行为先写可复现的失败用例，再实现并运行相关测试。几何测量的单测明确模拟尺寸，另做真实浏览器验收。
- MessageBox、Form、独立面板、TourStep、CheckTag、AutoResizer、AvatarGroup 等已修复内容只做必要回归，不重新实现。
- 本期不承诺所有官方 hooks、常量、内部注入键和工具的完全同构，也不进行全库视觉重设计。
- 用户已授权在当前分支每项修复单独提交；不自动发布 npm。提交使用英文 Conventional Commits，例如 `fix(select-v2): support dynamic option heights`。

## 二、排期与依赖

| 阶段 | 编号 | 内容 | 优先级 | 依赖 |
| --- | --- | --- | --- | --- |
| 业务修复 | T01 | SelectV2 动态高度 | P1 | 无 |
| 业务修复 | T02 | SelectV2 宽度、滚动条与前缀 | P1 | T01 |
| 业务修复 | T03 | SelectV2 国际化及其余文案盘点 | P1 | 无 |
| 业务修复 | T04 | TableV2 尺寸、缩进和滚动条 | P2 | 无 |
| 业务修复 | T05 | Menu 省略图标和外部点击 | P2 | 无 |
| 业务修复 | T06 | Tour 内容样式 | P2 | 无 |
| 业务修复 | T07 | Tooltip hover 聚焦 | P2 | 无 |
| 业务修复 | T08 | Scrollbar mask 和 ARIA | P2 | 无 |
| 公共组件 | T09 | 底层组件契约清单 | P2 | 无 |
| 公共组件 | T10 | CollapseTransition 与 Overlay | P2 | T09 |
| 公共组件 | T11 | Popper 组件族 | P2 | T09 |
| 收尾 | T12 | 补充 API 与文档欠项 | P3 | 无 |
| 验收 | T13 | 发布产物、浏览器与全量验证 | 必须 | T01—T12 |

建议按表中顺序执行。依赖只描述代码前置条件，不要求并行开发或额外启动代理。

## 三、重点回归条件

1. 弹层打开期间发生尺寸、选项或语言变化，应响应更新；由 T01—T03 覆盖。
2. 嵌套 ConfigProvider 与组件显式参数同时存在时，显式参数优先；由 T03 覆盖。
3. Teleport 子菜单内的点击不能当成菜单外部点击；由 T05 覆盖。
4. 用户关闭动画、快速开关、卸载弹层时，不能留下监听、观察器或焦点副作用；由 T07、T10、T11 覆盖。
5. ESM、CJS、按需安装、全量安装与消费端类型必须指向同一套公共契约；由 T13 覆盖。

## 四、开发任务

### T01：SelectV2 动态选项高度

**文件：** `packages/cool-design/select-v2/select-v2.tsx`、`types.ts`、`index.ts`、`__test__/index.spec.ts`、`__test__/scale.spec.ts`、`README.md`；新增 `demo/dynamic-height.vue`，在 `doc/site/catalog.ts` 注册演示。确需拆分测量逻辑时放在当前组件目录，不创建全库虚拟列表框架。

**接口：** 增加 `estimatedOptionHeight?: number`，对应 `estimated-option-height`。未提供时继续使用固定 `itemHeight`；提供时以估计值初始化，并以实际测量维护行偏移和总高度。

- [x] 编写失败用例：不同高度选项滚动后命中正确选项；键盘高亮项滚入可见区；过滤、远程结果替换后不沿用错误的高度索引；分组选项和空列表不产生非法偏移。
- [x] 运行 `pnpm test packages/cool-design/select-v2`，确认新增用例因目标能力未实现而失败。
- [x] 实现可见行测量、偏移更新、尺寸缓存失效和观察器清理；保持固定高度模式及现有远程查询行为。
- [x] 重跑相关测试与 `pnpm typecheck`，确认通过；浏览器检查多行选项滚动、窗口变化后无重叠、空洞和明显跳动。
- [x] 补动态高度属性文档及多行选项演示。

### T02：SelectV2 浮层宽度、滚动条与 prefix

**文件：** `packages/cool-design/select-v2/select-v2.tsx`、`index.scss`、公开实例/属性相关类型、`__test__/index.spec.ts`、`README.md`、`demo/basic.vue`。

**接口：** `fitInputWidth: boolean | number`，默认 `true`；`scrollbarAlwaysOn: boolean`，默认 `false`；`prefix` 插槽。具体宽度计算规则参考固定版本官方实现。

- [x] 写失败用例：`true` 跟随输入框；数字使用指定宽度；`false` 使用官方内容宽度规则；打开期间输入框尺寸变化能更新。
- [x] 写失败用例：prefix 内容实际出现且不替换已选标签；滚动条开关改变真实滚动区域样式。
- [x] 运行 `pnpm test packages/cool-design/select-v2` 确认失败，再实现属性、插槽与样式，保留 append-to、Teleport 和现有 class/style 合并行为。
- [x] 重跑用例，浏览器验证长标签、远程搜索、单选/多选与 T01 动态模式组合。
- [x] 同步文档、演示与类型。

### T03：SelectV2 国际化与其余组件文案盘点

**文件：** `packages/cool-design/select-v2/select-v2.tsx`、`__test__/index.spec.ts`、`README.md`；按实际缺项修改 `packages/cool-design/config-provider/locale/en.ts`、`locale/zh-cn.ts`、`__test__/compat.spec.ts`；新增 `docs/locale-coverage-2026-11-27.md` 记录盘点。

**接口：** 复用现有 `useLocale()` 与 `el.select.placeholder`、`loading`、`noData`、`noMatch`，不新增相同含义的配置协议。

- [x] 写失败用例：英文配置展示英文默认文案；运行时切换语言即时更新；显式 placeholder/loading-text/no-data-text/no-match-text 优先；嵌套 Provider 采用最近配置。
- [x] 运行 `pnpm test packages/cool-design/select-v2 packages/cool-design/config-provider` 确认失败，再替换硬编码默认文案。避免 props 的固定中文 default 覆盖 Provider。
- [x] 重跑测试并同步 README，说明语言配置与显式属性优先级。
- [x] 盘点所有带内置文案的组件，逐项记录“已接入/间接继承/确认缺失/无文案”及文件证据；对其余确认缺失项建立后续编号，不直接声称全库国际化已完成。

### T04：TableV2 尺寸与缩进

**文件：** `packages/cool-design/table-v2/table-v2.tsx`、`types.ts`、`index.ts`、`index.scss`、`__test__/index.spec.ts`、`README.md`、`demo/basic.vue`。

**接口：** `maxHeight?: number`、`indentSize: number = 12`、`hScrollbarSize: number = 6`、`vScrollbarSize: number = 6`、`scrollbarAlwaysOn: boolean = false`。

- [x] 写失败用例：max-height 在少量/大量数据及固定表头、底部内容下按官方规则生效；默认层级缩进为 12，自定义值参与各层级计算。
- [x] 写失败用例：横纵滚动条厚度影响实际轨道和占位补偿，固定列与表头对齐；不能只把值落为 DOM attribute。
- [x] 运行 `pnpm test packages/cool-design/table-v2` 确认失败，再实现高度约束、缩进和滚动条布局。
- [x] 重跑测试；浏览器验证固定列、横向滚动、动态行高、树形展开组合，无表头错位和滚动区域遮挡。
- [x] 补类型、文档与演示，回归已有 sort-by、渲染器和实例滚动方法。

### T05：Menu 配置补齐

**文件：** `packages/cool-design/menu/menu.tsx`、`overflow.tsx`、`sub-menu.tsx`、相关上下文/类型、`__test__/overflow.spec.ts`、`__test__/popup.spec.ts`、`README.md`、`demo/basic.vue`。

**接口：** `ellipsisIcon?: string | Component`、`closeOnClickOutside: boolean = false`。

- [x] 写失败用例：横向溢出菜单使用自定义图标；关闭 ellipsis 时不渲染溢出按钮；未传图标时保留默认表现。
- [x] 写失败用例：外部点击开关关闭时不主动收起，开启时按官方规则收起；菜单内部、Teleport 子菜单内部点击不被误判；卸载清理监听。
- [x] 运行 `pnpm test packages/cool-design/menu` 确认失败，再实现属性传递和外部区域判断，复用已有点击外部工具。
- [x] 重跑测试并回归路由、键盘、折叠、嵌套和溢出行为；更新文档与示例。

### T06：Tour / TourStep 内容样式

**文件：** `packages/cool-design/tour/tour.tsx`、`types.ts`、`index.ts`、`__test__/index.spec.ts`、`README.md`，`packages/cool-design/tour-step/tour-step.tsx`、公开类型及 README。

**接口：** Tour、TourStep 与配置式步骤均支持 `contentStyle?: CSSProperties`。按固定版本实现核定步骤值和全局值的优先级，并在用例中固定该规则。

- [x] 写失败用例：全局内容样式作用于内容面板；指定步骤样式按官方优先级生效；切换步骤不残留上一项样式；声明式与配置式用法一致。
- [x] 运行 `pnpm test packages/cool-design/tour packages/cool-design/tour-step` 确认失败，再接入属性、类型和内容节点。
- [x] 保留定位、层级和主题所需样式；重跑用例并更新文档及现有演示。

### T07：Tooltip focus-on-target

**文件：** `packages/cool-design/tooltip/tooltip.tsx`、`index.ts`、`__test__/index.spec.ts`、`README.md`。

**接口：** `focusOnTarget: boolean = false`，只负责官方约定的 hover 触发元素聚焦，与 trapFocus 分开处理。

- [x] 写失败用例：默认 hover 不抢焦点；开启后 hover 聚焦触发元素；disabled、不具备 focus 方法的虚拟引用不会抛异常；focus 事件不造成重复开关。
- [x] 运行 `pnpm test packages/cool-design/tooltip` 确认失败，再实现焦点行为，不给用户元素强制添加未经官方协议要求的 tabindex。
- [x] 重跑测试，回归虚拟触发、键盘、延迟、受控显隐和卸载；同步类型与文档。

### T08：Scrollbar mask 与 ARIA 落点

**文件：** `packages/cool-design/scrollbar/scrollbar.tsx`、`index.scss`、`index.ts`、`__test__/index.spec.ts`、`README.md`、`demo/basic.vue`。

**接口：** `mask: boolean | 'top' | 'bottom' | 'left' | 'right' = false`；role、aria-label、aria-orientation 按官方语义作用于 view。

- [x] 写失败用例：mask 关闭、全方向和单方向；根据可滚动空间及当前位置控制遮罩；不拦截内容点击和滚动。
- [x] 写失败用例：ARIA 值位于 view、没有同时错误落在根节点；class/style 仍按原约定透传；tabindex 保持滚动容器语义。
- [x] 运行 `pnpm test packages/cool-design/scrollbar` 确认失败，再实现遮罩节点/样式与属性分发，提供主题变量。
- [x] 重跑测试；浏览器检查横纵滚动、native 模式、内容更新、暗色和拖动；补类型、API 与示例。

### T09：锁定底层公共组件契约

**新增文件：** `docs/specs/element-plus-2.14.8-public-primitives.md`。

- [x] 从固定版本源码整理 CollapseTransition、Overlay、Popper、PopperArrow、PopperContent、PopperTrigger 的属性、默认值、事件、插槽、公开实例成员、注册方式和相互依赖，标注对应上游文件链接。
- [x] 明确 6 个 El 名称与本地品牌名称映射；区分需要公开的协议与可以继续使用本地实现的内部细节。
- [x] 为每个组件列至少一个可运行的官方风格消费示例，作为 T10/T11 的契约测试输入。
- [x] 对照现有 `src/utils/use-floating.ts`、`src/utils/overlay-stack.ts`、`src/utils/with-install.ts` 记录可复用项，避免重做定位、遮罩栈或引入新的浮层依赖。

**验收：** 契约表没有“待定”字段；下游能据此写出具体失败用例。先完成此任务，再实现公共组件，不能只补导出名。

### T10：CollapseTransition 与 Overlay 公共组件

**新增目录：** `packages/cool-design/collapse-transition/`、`packages/cool-design/overlay/`，各含 `index.ts`、同名实现文件、所需 SCSS、`README.md`、`demo/basic.vue`、`__test__/index.spec.ts`。

**修改文件：** `packages/cool-design/index.ts`、`global-types.ts`、`doc/site/catalog.ts`；仅在现有自动构建无法覆盖时调整 `vite.config.ts` 或构建脚本。

**接口：** 严格采用 T09 锁定的协议，提供 `ElCollapseTransition`、`ElOverlay` 及对应品牌入口。

- [x] 根据 T09 示例写失败用例：展开/收起生命周期、过渡结束和快速切换后的内联样式恢复；关闭动画及卸载期间清理。
- [x] 写 Overlay 失败用例：遮罩开关、自定义 class、zIndex、插槽以及点击事件的目标判断符合约定。
- [x] 运行两个新目录的组件测试确认失败，再实现最小公共组件和注册/类型入口。
- [x] 重跑测试，验证全量/按需安装，并补文档站演示。内部使用方仅在必要时接入，避免批量重构已有 Dialog/Drawer。

### T11：Popper 公共组件族

**新增目录：** `packages/cool-design/popper/`，包含 `index.ts`、`popper.tsx`、`popper-arrow.tsx`、`popper-content.tsx`、`popper-trigger.tsx`、上下文/类型文件、所需 SCSS、README、演示及 `__test__/index.spec.ts`。

**修改文件：** 根入口、全局类型、文档站目录；按实际需求复用现有浮层工具。

**接口：** 采用 T09 契约，提供 `ElPopper`、`ElPopperArrow`、`ElPopperContent`、`ElPopperTrigger`；四者放在同一组件族目录中。

- [x] 根据 T09 组合示例写失败用例，固定根上下文、触发引用、内容定位、箭头、事件和实例暴露协议；验证虚拟引用、禁用、快速开关和卸载清理。
- [x] 运行 `pnpm test packages/cool-design/popper` 确认失败，再实现真实可组合组件，不能将定位函数直接作为组件导出。
- [x] 重跑组件测试，并回归 Tooltip / Popover / Popconfirm / Dropdown；不要求为使用新组件族重写这些组件。
- [x] 补根导出、类型、按需安装和组合示例；浏览器验收溢出裁剪、位置更新、箭头和焦点。

### T12：补充 API 核实与文档补齐

**涉及目录：** `config-provider`、`select`、`cascader`、`tree-v2`、`checkbox-group`、`radio-group`、`time-picker`，以及共享实现 `checkbox`、`radio`、`date-picker`。

- [x] 按固定版本核实并记录 experimental-features 的准确配置结构、消费方和默认行为；补实现及消费方测试，不能仅增加 Provider 透传字段。需要尚未实现的独立实验机制时，单列后续任务并说明边界，不伪称已经支持。
- [x] 为 Select 的 show-arrow、suffix-transition 和 Cascader 的 clear-icon 分别写失败用例、补行为、重跑所属目录测试；旧参数按固定版本保留兼容并标注文档状态。
- [x] 核实 TreeV2 node-drop 的触发边界，写外部元素拖入节点的事件测试，校验 `(data, node, event)`。不额外实现内部节点拖拽排序。
- [x] 为 CheckboxGroup、RadioGroup 补默认插槽 API；核对共享 TimePicker 实际支持的插槽并写明支持范围。文档中所有类型与枚举值使用反引号。
- [x] 每项保留独立验收记录，运行对应组件测试和文档类型检查，不把多项“已声明属性”作为完成依据。

### T13：最终交付与回归

**修改/新增文件：** `packages/cool-design/__test__/index.spec.ts`；新增 `scripts/verify-element-plus-exports.mjs`；在任务书附执行结果，必要时更新审计状态。

- [x] 导出检查脚本使用固定 `2.14.8` 的 123 个 El 名称作为基准，并记录来源；本地检查构建后 ESM / CJS，不能使用“当前构建导出自身快照”代替上游基准。
- [x] 验证 123 个名称全部存在、两种格式导出集合一致；6 个新增入口可实际使用，符合 T09 注册约定。保留 MessageBox 函数服务和原有子组件注册回归。
- [x] 从消费端检查根导入、组件子路径、样式子路径、ESM/CJS 声明、全局模板类型；运行 `pnpm pack --pack-destination <临时目录>` 后，在临时消费项目安装生成包验证上述用法，避免仅验证源码。
- [x] 执行 `pnpm verify`，预期类型检查、Lint、组件构建、全量测试、文档构建全部通过。记录真实测试数量、现有与新增警告，不把当前 1804 项当作修复后的固定数量。
- [x] 执行 `node scripts/verify-element-plus-exports.mjs`，预期缺失列表为空、ESM/CJS 差集为空，异常时以非零退出码失败。
- [x] 真实浏览器完成 T01—T08、T10—T11 指定场景；记录浏览器版本、场景、结果和截图/复现路径。至少覆盖普通/暗色、Teleport、自定义 namespace、键盘与焦点、动态尺寸变化。
- [x] 对新增公共组件检查 SSR 导入和渲染不访问未定义的 window/document；有动态 ID 或 Teleport 的修改补服务端渲染/客户端接管验证。
- [x] 更新审计：逐条写“已修复及证据”或“后续任务编号及原因”，没有验证的项不得标为完全兼容。

## 五、完成标准

- [x] T01—T08 的确定性缺陷均已修复，并有对应行为测试及浏览器记录。
- [x] T09—T11 的 6 个底层组件有真实协议、公共入口、类型、文档和用例，123 个 El 名称检查通过。
- [x] T12 全部逐项有结论；需要独立实验机制的项目有明确后续任务，其余补充 API 和文档完成。
- [x] T13 的构建产物消费、全量验证及回归通过，无新增未解释警告。
- [x] 保留原有组件使用方式，改动范围可追溯到任务编号；不将本期完成表述为全库 API、视觉、SSR 已完全认证。

## 六、执行记录（2026-11-27）

已在当前 `dev` 分支执行 T01—T13，按独立修复提交。细节见 [开发交付与验收报告](../../element-plus-compatibility-completion-2026-11-27.md)。

原计划步骤采用以下明确解释，避免把检查表当成全库认证：

- 测试按行为归入各组件目录；新回归用例集中在 `__test__/compatibility*.spec.ts`，与既有规模、远程搜索、浮层、类型和发布用例共同验收。
- T09 固定版本源码确认 `experimental-features` 为空预留接口，无实验消费方；T12 实现配置接受与继承，并验证未虚构功能，不增加实验开关。
- Tour 保留已有 maskStyle 面板变量扩展，在其后应用 contentStyle，避免破坏已覆盖用法。
- Popper 四个组件共同交付为一个组件族；原计划不要求把子组件拆成四个独立目录。
- TableV2 使用当前原生滚动布局和实际滚动条尺寸处理占位，未另建虚拟滚动框架。
- 新增底层组件的文档单列“底层组件”导航，Popper 子组件有独立地址并共享组合示例。
- T03 仅修复已约定的 SelectV2 语言问题，其余已确认和候选文案进入 [LOC01—LOC06 后续任务](../../locale-coverage-2026-11-27.md)，不计为全库国际化已完成。
- 修复过程中发现的实际回归逐项补测试并提交；完整命令结果及现有警告记录在交付报告中。

?????????
