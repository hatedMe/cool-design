# Element Plus 对标审计（2026-11-20）

本次目标：核实当前组件库距离 Element Plus 迁移兼容还缺什么。只新增本报告，未修改组件代码。

## 一、范围与结论

- 检查主入口、组件目录、公开类型、README、测试、构建配置及实际 ESM/CJS 产物；扫描官方组件 API 表，并对高影响项人工复核。
- 对照依据为审计当天 Element Plus 官方文档。npm 查询得到最新版本为 `2.14.8`；官方 `dev` 文档扫描仅用于发现候选差异，不把开发分支新增项直接判为稳定版缺陷。固定版本 GitHub 文档下载部分超时，因此不声称完成了 `2.14.8` 每个 API 的逐项认证。
- 项目已经覆盖大部分常用组件。主要差距是公开入口契约、复杂表单/虚拟化组件、全局配置，以及部分默认值和交互行为。
- “有目录”“API 名称出现过”“测试通过”均不能证明完整兼容。下文明确区分已确认问题、接口缺项和需要专项验收的范围。
- 目录和实现总体符合当前 Vant 式的按组件组织方式，无需为了对标功能改成 Element Plus 的内部目录结构。

## 二、已确认的高优先级问题

### 1. MessageBox 主入口与文档不一致，子路径默认导出在构建后丢失（P1）

依据：`packages/cool-design/index.ts` 将 `MessageBoxComponent` 作为 `MessageBox` 导出；`packages/cool-design/message-box/index.ts` 的可调用默认导出没有被主入口使用，也没有作为独立构建入口保留。

构建后实际检查：

```text
typeof root.MessageBox                 object
typeof root.MessageBox.confirm         undefined
typeof root.MessageBox.alert           undefined
typeof messageBoxSubpath.default       undefined
CJS 子路径 default                     undefined
```

所以 README 中 `import { MessageBox } from 'cool-design'; MessageBox.confirm(...)` 无法工作。扫描全部源码含默认导出的组件子路径，发现 MessageBox 存在上述默认导出丢失。

建议：区分服务对象与声明式组件；保留兼容入口，确保发布后的 ESM/CJS 均保留服务导出。测试必须实际加载并调用文档中的 API，不能只检查文件存在。

### 2. Form 自定义校验协议不兼容（P1）

依据：`form/types.ts:12` 规定 `validator(value)`；`form-item/form-item.tsx:96` 实际只传入值。官方常用写法是 `validator(rule, value, callback)`。

直接迁移时参数错位，callback 为 undefined；某些只读取第二参数的规则还可能错误放行。还存在：

- `trigger` 只接受单个 `'blur' | 'change'`，数组触发器不会被正确匹配。
- `FormItem.prop` 只支持字符串，缺少字符串路径数组。
- `validate` 缺少 callback 调用方式；`validateField` 校验失败返回 false，未对齐失败拒绝与 callback 协议。
- `resetFields`、`clearValidate` 无字段参数，传入字段名仍会操作全部字段。
- `invalidFields` 当前是字符串数组，未对齐验证错误对象结构。
- 缺少 `scroll-into-view-options`、`getField`；FormItem 缺少 `validate-status` 及完整校验状态暴露。

建议优先支持官方规则与实例方法协议，再保留当前简写作为兼容扩展。参考：[官方 Form](https://element-plus.org/en-US/component/form.html)。

### 3. TableV2 受控排序与渲染协议差距（P1）

依据：`table-v2/table-v2.tsx:80` 仅初始化读取 `sortBy`；后续 watcher 只监听自定义 `sortState`。外部替换 `sort-by` 不更新内部排序状态。

其他已核实的接口差距：

- 列类型缺少 `cellRenderer`、`headerCellRenderer` 等官方渲染接口；目前使用自有 `cell` / `header-cell` 插槽。
- 未实现官方 `estimated-row-height` 的实际内容测量；当前是数字或函数预先提供行高，不等价。
- 缺少 `fixed-data`、`default-expanded-row-keys`、`rows-rendered`、`row-expand`、`overlay` 等入口。
- `headerHeight` 仅数字，未对齐多行表头数组；默认行高/表头高度为 40，官方为 50。
- 缺少 `scrollToLeft` / `scrollToTop` 等实例方法；滚动方法参数还需对照官方签名。

建议先完成受控值、渲染器和动态行高协议，不宜仅以当前“支持虚拟滚动”标记完全对标。参考：[官方 TableV2](https://element-plus.org/en-US/component/table-v2.html)。

### 4. SelectV2 仍是部分实现（P1）

依据：`select-v2/select-v2.tsx:14` 的 props 及对应实现。

缺少 `remote` / `remote-method`、`allow-create`、`default-first-option`、`reserve-keyword`、`append-to`、`empty-values` / `value-on-clear` 等重要能力。`filterMethod` 是本地逐选项布尔判定，不能直接替代官方自定义过滤回调协议。`persistent` 当前默认 false，官方默认 true。

此外，虽然公开值类型写为 unknown，运行时 `modelValue` 构造器未列 Boolean，布尔值迁移仍需检查并补齐。参考：[官方 SelectV2](https://element-plus.org/en-US/component/select-v2.html)。

### 5. Tree 默认值与官方相反（P1）

依据：`tree/tree.tsx:57`，当前 `checkOnClickLeaf: false`。官方文档明确默认 true。开启复选框后，直接点击叶子节点的选中行为因此不同。

TreeV2 也设置了 false，需按它自己的官方契约独立对齐，不能沿用旧计划的结论。旧修复计划曾建议统一改 false，应更正，避免重复引入不兼容。参考：[官方 Tree](https://element-plus.org/en-US/component/tree.html)。

### 6. Tour 组件使用协议不兼容（P1）

`tour/index.ts` 只导出 Tour 组件与 TourStep 类型，没有可渲染的 TourStep 子组件。实现依赖 `steps` 数组，默认插槽用于当前步骤内容，不能直接接收原版 TourStep 声明。

同时当前 `gap` 是数字，插槽叫 `indicator`；官方使用对象形式 gap 和 `indicators` 插槽。还需补齐 `append-to`、Escape 关闭控制、目标区域点击配置及步骤按钮属性。参考：[官方 Tour](https://element-plus.org/en-US/component/tour.html)。

## 三、真正缺失的组件和公开入口

| 项目 | 当前情况 | 建议 |
| --- | --- | --- |
| ColorPickerPanel | 无独立公开组件与子路径 | 新增组件、入口、文档、示例和测试 |
| DatePickerPanel | 有内部 `date-picker/date-picker-panel.tsx`，但未作为公共组件导出，事件协议也不是独立面板协议 | 在复用实现基础上补公共封装，不能只加 export |
| TourStep | 只有配置接口类型 | 新增可注册子组件并与 Tour 建立上下文 |
| CheckTag | Tag 目录只导出 Tag | 补独立勾选标签组件及 change 协议 |
| AutoResizer | 没有对应实现/入口 | 若要迁移官方虚拟表格示例，需要提供自动尺寸组件 |
| AvatarGroup | 本地未实现；上游开发文档已有相关 API | 先确认目标稳定版本是否包含，再纳入排期，不与已确认稳定版缺失混算 |

不要误判：InfiniteScroll 已在 `directives` 实现并导出；Calendar、TimePicker、DateTimePicker 通过 date-picker 实现和独立入口存在；Typography 已有 `doc/markdown/guide/typography.md`，它是设计指南，不能因为没有同名组件目录就判缺失。

组件范围参考：[官方组件总览](https://element-plus.org/zh-CN/component/overview.html)。

## 四、已有组件的差距清单

此表覆盖组件族；“未发现明显接口缺口”仅表示本次静态核对未定位具体问题，不代表视觉、无障碍与全部边界已经兼容。

| 组件或组件族 | 当前结论与需要处理的内容 | 优先级 |
| --- | --- | --- |
| ConfigProvider | 缺组件级默认配置；语言、namespace、服务层级接入不完整，详见下一节 | P1 |
| Form / FormItem | 规则签名、路径、触发器、方法参数及校验结果结构不兼容 | P1 |
| SelectV2 | 远程搜索、创建条目、空值策略和过滤回调等缺失 | P1 |
| TableV2 | 受控排序、列渲染器、动态测量及多项 API 未对齐 | P1 |
| TreeSelect | 仅明确透传一部分 Tree 属性；没有完整 Select 协议；实例只暴露 focus/blur，缺 getCheckedKeys 等树方法及 selectRef | P1 |
| Tour | 缺 TourStep 声明协议，gap 类型、插槽名称不同 | P1 |
| MessageBox | 主入口与子路径发布问题；源码通过不代表发布后可用 | P1 |
| Tree / TreeV2 | 叶子勾选默认值需校正；TreeV2 缺 setData，默认插槽只提供 node，未同时提供 data | P1/P2 |
| Autocomplete | 已有防抖和请求序号；仍缺 value-key、Teleport/定位属性、header/footer 插槽及部分暴露方法，列表仍内联渲染，可能被祖先 overflow 裁剪 | P1/P2 |
| ColorPicker | 已有确认/清空和预览分离；主面板仍依赖原生 type=color，与官方色相/饱和度面板交互不同；缺 popper-style、空值配置、persistent；size 固定默认 default，未继承表单/全局尺寸 | P1/P2 |
| TimeSelect | 当前只有按钮选择，缺 editable、format、include-end-time、前缀/清空图标、空值策略；键盘只打开列表，缺上下移动/回车选中 | P2 |
| DatePicker / DateTimePicker / TimePicker | 功能已较丰富；value-on-clear 不接受函数且未读取全局空值配置；日期面板语言硬编码；随机面板 ID 有 SSR 一致性风险 | P2 |
| Cascader / CascaderPanel | 已有懒加载等基础；缺 persistent、空值策略、部分标签/浮层属性及 prefix/header/footer 等插槽；CascaderProps 中点击勾选与 hoverThreshold 等仍需补齐 | P2 |
| Select / Option / OptionGroup | 已支持声明式选项、options、映射、外部异步回调及 append-to；仍缺自定义 clear/suffix 图标、部分标签效果、滚动事件和 selectedLabel | P2 |
| Checkbox / CheckboxButton / CheckboxGroup | Form 继承已接入；缺旧 true-label/false-label 别名；label 当前只作为字符串文本，未兼容旧版 label 作为选项值的迁移；组按钮 text-color/fill 不完整 | P2 |
| Radio / RadioButton / RadioGroup | 键盘和尺寸继承已实现；RadioGroup 缺 options 入口，需按目标版本补齐 | P2 |
| Input | 原生属性要按实际 input/textarea 落点检查，不能仅凭未声明 props 判缺失；需专项验证 modifiers、实例暴露与双类型输入行为 | 待专项 |
| InputNumber | 已有提交值 change 与 Form 集成；较新 disabled-scientific API 是候选缺项，需锁定版本后补 | P2/待版本核实 |
| InputTag | tag-effect 已实现，Tooltip 主题 effect 未暴露；相关折叠浮层主题与官方用法仍有差距 | P2 |
| InputOTP / Mention | 已有实现与测试；Mention 缺 tooltip 暴露；OTP 完成事件、外部值重置、粘贴与 IME 边界需浏览器验收 | P2/待专项 |
| Segmented | 无 useField/useConfig 接入，不继承 Form disabled、不触发校验、不继承全局 size；缺 direction、validate-event 等 | P1/P2 |
| Transfer | 已接入 Form；缺 leftPanel/rightPanel 暴露；开发分支虚拟滚动相关 API 需确认稳定版范围后处理 | P2 |
| Slider / Switch / Rate / Upload | 已有较多 API 和针对性测试，本次未定位同等级确定性主路径缺口；需保留真实浏览器拖拽、键盘、上传取消/竞态验收 | 待专项 |
| Table / TableColumn | 声明式列与嵌套分组已实现；缺 render-header、tooltip-options、append-filter-panel-to 等；自定义包装列组件不展开是已知限制 | P2 |
| Dialog | 缺 modal-class、append-to-body、open-delay/close-delay、header-aria-level 等接口；穿透和 transition 新参数应按版本补 | P2 |
| Drawer | close-icon 与过渡已实现；图标组件作为响应式对象产生 Vue 警告，需消除；视觉与焦点链仍待浏览器验收 | P2 |
| Tooltip / Popover | 未完整支持 Popper options 协议；缺 transition、trigger-keys 等；Tooltip persistent 默认 false，与官方 true 不一致 | P2 |
| Dropdown / DropdownItem / DropdownMenu | 缺虚拟触发、append-to、persistent、show-arrow 及部分浮层配置 | P2 |
| Popconfirm | actions 插槽已有；缺 popperRef 暴露，仍需确认 Tooltip 属性继承范围 | P2 |
| Menu / SubMenu / MenuItem / MenuItemGroup | 基础路由、折叠和浮层已有；缺部分 popper-style/persistent 与展开收起图标定制 | P2 |
| Pagination | 基础受控/非受控已修；缺 append-size-to、尺寸下拉浮层样式/挂载配置、prev-icon/next-icon | P2 |
| Scrollbar | 缺 end-reached、distance 等新接口；tabindex 应核实落在滚动元素而不是根节点 | P2 |
| Tabs / TabPane | 溢出箭头、方向、键盘已实现；缺 currentName/tabNavRef 等暴露；测试出现插槽在 render 外调用警告 | P2 |
| Affix | 缺 updateRoot 及新挂载属性族，需按目标版本补齐 | P2 |
| Text | 缺 isTruncated 暴露 | P2 |
| Space | 缺 prefix-cls；默认布局与换行需视觉对照，不能仅核对 props 名称 | P2 |
| Button / ButtonGroup | 主体 API 已有，shouldAddSpace 暴露缺失 | P2 |
| Message / Notification | 服务与组件导出命名不一致；固定层级 2100，未接全局 zIndex；服务文案/上下文与多应用隔离需验收 | P1/P2 |
| Loading / InfiniteScroll / ClickOutside / v-popover | 已有服务或指令，不能列为缺失组件；剩余看 modifiers、边界滚动与真实 DOM 生命周期 | 待专项 |
| Container / Header / Aside / Main / Footer / Row / Col | 有完整入口、文档及布局实现，本次未定位具体高优先级 API 缺口 | 基础已有 |
| Link / Icon / Divider / Splitter / SplitterPanel | 有实现；保留项目主题和 i 前缀不等于功能缺陷，是否提供原版别名另见全局兼容 | 基础已有 |
| Avatar / Badge / Card / Collapse / Descriptions / Empty | 基础组件存在；子组件见第三节；通用语言与样式问题同样适用 | 基础已有 |
| Calendar / Carousel / CarouselItem / Progress / Result / Skeleton / SkeletonItem | 已有组件、文档与测试，本次未定位同等级明确主路径缺口 | 基础已有 |
| Tag / Timeline / TimelineItem / Statistic / Countdown | 主组件已有；CheckTag 缺失；语言、默认值和插槽作用域需保持差异测试 | 基础已有/部分缺失 |
| Anchor / AnchorLink / Backtop / Breadcrumb / BreadcrumbItem / Steps / Step / PageHeader | 已有实现及测试；不重复把旧审计中已修的监听、路由、图标问题列为现存缺陷 | 基础已有 |
| Alert / Watermark | 已有实现，旧计划中的样式拆分等不能直接视为仍未完成 | 基础已有 |

TimeSelect 的 `include-end-time` 不能简单理解为“任何情况下不得显示 end”：官方对齐网格与非对齐结束时间的具体行为应复用上游用例验证。本次不凭循环中的 `<=` 就认定边界比较错误。参考：[官方 TimeSelect](https://element-plus.org/en-US/component/time-select.html)。

## 五、跨组件兼容缺口

### 1. 命名与服务入口

`with-install.ts` 只注册 `i-button` / `IButton` 等名称。主入口无完整 `ElButton`、`ElSelect` 等别名；服务只有部分 El 名称。Notification 目前是声明式组件，服务名是 Notify，与官方函数式入口的迁移方式不同。

若目标是“只换包名就迁移”，这些是必修项；若保留品牌 API，也应提供明确的兼容层。不要直接删除现有 i 前缀接口。

### 2. namespace、语言、层级和空值配置

- `useNamespace` 基础 hook 有实现，但绝大多数组件仍硬编码 `i-*`，设置 Provider namespace 不能切换全组件类名，Sass 也需配套。
- 搜索组件源码，实际调用 `useLocale` 的组件只有 Select；内置语言包仅含少量组件文案，其他组件多处中文硬编码。
- Message / Notification 样式固定 `z-index: 2100`，当 Dialog 使用更高基础层级时，消息可能被遮挡。
- 空值策略只在部分组件落实；日期时间、颜色、虚拟选择等需要统一接入，而不是仅在 Provider 增加属性。
- Provider 缺 button/link/dialog/message/table 等组件级配置。
- Segmented 没接入 Form，ColorPicker 没有继承 size；不能宣称全库 disabled/size 一致。

参考：[官方 ConfigProvider](https://element-plus.org/en-US/component/config-provider.html)。

### 3. 类型与样式发布

- 全库未检出统一 Vue `GlobalComponents` / `ComponentCustomProperties` 扩展。全局安装后模板组件和 `$message` 等属性的类型体验不完整。
- 构建输出单个 `es/style.css`；各组件 SCSS 导入生成空 JS 占位文件。组件子路径 JS 可以导入，不等于已经实现组件级 CSS 按需加载。
- `package.json` 无明确组件 CSS 子路径发布协议；应增加真实样式入口并校验发布后的消费用法。
- 当前是项目自己的品牌 token 与主题，不是官方视觉主题。若要求视觉一致，需要额外对照尺寸、间距、色板、焦点与暗色，不能用 API 测试替代。

### 4. SSR 与浏览器验收

DatePicker、Cascader 使用随机 panel ID；Provider/useId 也有随机前缀。服务端与客户端独立生成时存在 hydration/ARIA 关联不一致风险。此项为静态风险判断，本次未做 SSR hydration 复现。

现有验证主要为 jsdom 单测；实际定位、滚动裁剪、拖拽、焦点恢复、IME 与暗色可读性仍需浏览器回归。不能据此宣称已经发现所有视觉缺陷。

## 六、文档和测试需要调整的内容

1. 修复 MessageBox README 中根入口服务示例与实现的矛盾。
2. 明确“兼容接口”“本项目扩展”“尚未支持”三类能力。例如 Table columns、Tour steps、函数行高都属于扩展，不能替代官方声明协议。
3. API 表补齐默认值、事件完整参数、作用域插槽、实例方法，类型按项目要求使用反引号。
4. 修正旧计划中 Tree 叶子勾选默认 false 的错误结论；不要继续照旧清单机械修改。
5. `doc/site/catalog.ts:18` 起对 README、源码、演示组件均 eager 加载；本次文档主包约 1232.56 kB，建议按页懒加载示例。
6. 发布测试除“入口文件存在”外，应对比源码/产物的导出集合，覆盖默认导出、服务方法、全局注册和真实消费者类型检查。
7. 增加原版风格契约用例：校验器三个参数、指定字段 reset/clear、动态 sort-by、TourStep 声明、SelectV2 远程回调、全局 disabled/size/locale、空值函数。
8. 处理已有 Vue 警告：Tabs 插槽在渲染函数外调用、Drawer 图标组件响应式代理；Breadcrumb 测试还出现 jsdom 不支持导航提示。

## 七、本次验证结果与建议顺序

已执行：

| 检查 | 结果 |
| --- | --- |
| pnpm test | 117 个文件、1133 项测试通过 |
| pnpm typecheck | 通过 |
| pnpm typecheck:docs | 通过 |
| pnpm lint | 0 错误，4 个 v-html 警告 |
| pnpm build | 通过 |
| pnpm build:docs | 通过，有主包体积警告 |
| 构建后动态加载与接口检查 | 复现 MessageBox 根入口方法缺失及子路径默认导出缺失 |

上述通过项证明当前自身测试和构建健康，不证明 Element Plus 全量兼容。本次未执行浏览器视觉对照、完整 SSR hydration 或每个组件的逐 API 黑盒对照。

建议实施顺序：

1. **发布与表单契约**：MessageBox、Form 校验/实例协议、Tree 默认值、TableV2 sort-by。
2. **业务常用复杂组件**：SelectV2、TreeSelect、Autocomplete、ColorPicker、TourStep。
3. **全库一致性**：disabled/size、locale、zIndex、empty-values、全局类型及兼容别名。
4. **组件补齐与进阶能力**：独立面板、CheckTag、AutoResizer、虚拟化渲染协议和剩余公开 API。
5. **交付验收**：组件样式入口、文档懒加载、实际浏览器交互与视觉回归、SSR。

?????????
