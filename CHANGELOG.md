# Changelog

## Unreleased

- Affix 默认跟随最近的纵向滚动祖先，`target` 现在约束固定内容的可见边界。依赖旧容器边缘阈值的页面可用 `offset` 设置视口偏移，`target-container` 仍可指定滚动宿主。新增固定时的 `teleported` 和 `append-to`，内容尺寸改变后可等待 `updateRoot()` 重新测量。

- Tabs 公开响应式 `currentName` 和 `tabNavRef`，并支持条件插槽与动态页签重排。声明式页签省略初始值时使用字符串 `"0"`，具名页签需要默认选中时可传入 `default-value`。`before-leave` 拒绝 Promise 时会阻止切换。

- Scrollbar 增加四向 `end-reached` 事件与默认 `0` 像素的 `distance` 触发距离。`tabindex` 现在作用于实际滚动元素，依赖外层聚焦的页面可在 Scrollbar 外添加可聚焦的包装元素。

- Pagination 的条数选择改用 Select，可用 `append-size-to`、`popper-class` 和 `popper-style` 定位并设置下拉样式。下拉默认传送，设置 `:teleported="false"` 可在分页内部显示。`change(currentPage, pageSize)` 在渲染更新后为实际页码或条数变化合并触发，翻页按钮同步报告当时的绑定页码。依赖请求值时可改用 `update:current-page` 或 `update:page-size`。保留 `page-size-change` 兼容事件，新增 `size` 及上下页自定义图标，显式按钮文字优先。

- Menu 的水平和折叠子菜单复用共享浮层，支持 `popper-style`、子菜单独立配置、展开和折叠图标对。浮层默认保留内容，需要在离场后销毁时可设 `:persistent="false"`。默认间距从 `4` 调整为 `6`，默认挂载规则为一级传送、嵌套就地渲染。水平悬停使用默认 `300` 毫秒展开和收起延时，可设为 `0` 恢复即时响应。子菜单浮层触发 `open` 和 `close`，`select` 补充菜单项路径与可选路由 Promise，成功导航后才更新激活项。

- Drawer 修复响应式关闭图标触发的 Vue 组件代理警告。`opened` 和 `closed` 在动画完成后发出，`close` 改为实际离场开始时发出，`update:modelValue(false)` 延后至离场结束。若离场结束时重新打开仍在等待 `open-delay`，则保留新的 `true` 并跳过模型更新事件。依赖关闭请求时机的页面可在 `before-close` 中处理。显式非 `body` 挂载目标优先，省略目标时使用 ConfigProvider 浮层宿主或就地渲染。旧版依赖自动挂到 `body` 或单独使用 `append-to="body"` 的页面可改用 `append-to-body`。

- Dialog 增加打开与关闭延时、可穿透的无遮罩模式、自定义遮罩类与标题等级，支持 `append-to-body` 和自定义挂载目标。`close` 改为实际离场开始时触发，`update:modelValue(false)` 在离场完成后触发。依赖旧关闭请求时机的页面可在 `before-close` 回调中处理。默认使用 `dialog-fade`，可以通过 `:transition="{ css: false }"` 禁用 CSS 动画。原无遮罩穿透和允许拖动越界的用法可分别加上 `modal-penetrable` 和 `overflow`。传给组件的 `class` 应用于面板，外层样式使用 `modal-class`。
  单独设置 `append-to="body"` 时改为就地渲染，旧版使用该写法挂载到 `document.body` 的页面可改用 `append-to-body`。

- Popconfirm 改用共享 Tooltip 和 Popper 定位，支持触发键、过渡、箭头、虚拟锚点和 `popper-options`。确认和取消按钮先发出原始点击事件，随后按默认 `200` 毫秒延迟请求关闭，实例 `hide()` 使用同一延迟。可传 `:hide-after="0"` 恢复立即关闭。入场焦点默认落在面板。启用 `persistent` 时从首次渲染起保留节点。依赖旧定位的页面可设置 `popper-options.strategy` 为 `fixed`，并将 `offset` modifier 配置为 `[0, 8]`。

- DropdownItem 的 `click` 也会在按键激活时触发，回调类型扩展为 `MouseEvent | KeyboardEvent`。鼠标点击监听器调用 `preventDefault()` 后会取消命令，菜单保持打开。

- Dropdown 默认保留隐藏的菜单节点，并使用 Popper 的 `absolute` 定位。可设置 `:persistent="false"` 在离场后销毁，设置 `:max-height="172"` 恢复旧的滚动区上限，或用 `popper-options.strategy` 恢复 `fixed` 定位。默认按键为 `Enter`、`Space`、`ArrowDown`、`NumpadEnter`，兼容旧键名。只有单独使用 `hover` 时应用默认 `150` 毫秒延时。`command` 在命令和菜单项实例之后补充原始事件。新增虚拟锚点、挂载宿主、箭头与 Popper 配置。

- Popover 默认宽度为 `150`，定位策略为 `absolute`，并从首次渲染起保留浮层节点。旧布局可显式设置 `width="auto"` 或 `strategy="fixed"`，关闭后需要销毁时设置 `:persistent="false"`。默认插槽提供立即请求关闭的 `hide()`，离场完成时会再次发送 `update:visible(false)`。虚拟 `click` 或 `contextmenu` 触发模式现在会在点击外部时请求关闭。

- Tooltip 的默认定位从 `fixed` 改为 `absolute`，可显式传入 `strategy="fixed"` 延续旧布局。启用 `persistent` 后，内容从首次渲染起挂载并在关闭时隐藏。实例方法 `hide()` 立即请求关闭，需要保留 `hide-after` 延迟时改用 `onClose()`。

- TreeV2 增加 `setData(data)` 实例方法，默认插槽同时提供 `node` 和 `data`。替换 `data` 属性时，勾选状态按节点键保留。

- Form 增加选择性重置与清除、字段查询、重置初值设置及校验状态。`validate` 和 `validateField` 的失败字段映射改为 `{ message, field, fieldValue }[]`。`validateField` 省略回调时，失败改为拒绝 Promise，依赖失败返回 `false` 的调用可传入回调或捕获拒绝。

- 修复消息确认框根入口缺少静态服务方法及构建后子路径默认导出丢失；新增 `ElMessageBox` 可调用入口，保留 `MessageBox` 声明式组件用法。
- Form 支持 `validator(rule, value, callback)`、`asyncValidator` 和多触发器。FormItem 接受数组路径，`fields` 和表单校验错误映射中的 `items[0].name` 统一为 `items.0.name`。

对齐 Element Plus 的功能/参数专项（阶段 0～3）。以下为本次变更摘要，破坏性变更附迁移说明。

### 🆕 新增组件

- **Cascader 级联选择**（替换原占位实现）、**CascaderPanel 级联面板**
- **SelectV2 虚拟化选择器**、**TreeV2 虚拟化树**（窗口化渲染，任意数据量滚动流畅）
- **InputTag 标签输入框**、**InputOtp 验证码输入**、**Mention 提及**
- **Affix 固钉**、**Anchor 锚点**、**Countdown 倒计时**、**Segmented 分段控制器**、**TimeSelect 时间选择**、**Tour 漫游式引导**、**Splitter 分割面板**
- **Text 文本**、**Scrollbar 滚动条**、**SelectOptionGroup 选项分组**、**SplitterPanel 分割面板项**
- **排版规范**：字号阶梯 / 行高 / 字体栈设计 token（对齐 EP Typography）

### ⚠️ Breaking Changes（破坏性变更）

| 组件 | 变更 | 迁移说明 |
| --- | --- | --- |
| `Tree` / `TreeV2` | `check-on-click-leaf` 默认值由 `false` 改为 `true`，显示复选框时点击叶节点默认切换勾选 | 依赖原默认行为的页面请显式传 `:check-on-click-leaf="false"` |
| `Table` | `maxHeight` 默认值 `440` → 不设默认：未显式传入时不再限制滚动区高度 | 依赖默认 4px 高度上限的页面请显式传 `:max-height="440"` |
| `TableV2` | `headerHeight` 和 `rowHeight` 默认值由 40px 改为 50px | 原布局可显式传 `:header-height="40" :row-height="40"` |
| `Rate` | `texts` 默认文案由英文改为中文：`['极差', '失望', '一般', '满意', '惊喜']` | 依赖英文文案的场景请显式传 `:texts` |
| `Space` | `wrap` 默认值 `true` → `false`；内置尺寸 4/8/12px → 8/12/16px；数组 `size` 语义改为 `[列间距, 行间距]`；每个子项包装在 `.i-space__item` 中 | 依赖默认换行的布局请显式传 `wrap`；依赖旧间距像素的样式需复查；自定义子项选择器改用 `.i-space__item` |
| `Popconfirm` | `hide-after` 语义反转：现在表示「确认后延迟自动关闭」（原为「打开后自动取消」） | 依赖自动取消行为的用法请改为显式处理 `cancel` |
| `MessageBox` | `title` 默认值 `'操作确认'` → `''`；遮罩点击默认关闭（原为不关闭）；promise 拒绝值在未开启 `distinguish-cancel-and-close` 时把 `close` 归并为 `cancel` | 需要显式标题的场景请传 `title`；依赖遮罩不可关闭的场景请传 `:close-on-click-modal="false"`；依赖 `reject('close')` 的场景请开启 `distinguish-cancel-and-close` |
| `Avatar` | `size` 默认值 `'large'` → `'default'` | 依赖默认大号头像的场景请显式传 `size="large"` |

### Features

- **Cascader**：全新实现（原为占位组件）——级联面板、多选级联、`emitPath`、`check-strictly`、过滤、表单联动、浮动弹层
- **TreeSelect**：基于 `Tree` 重构 —— 回显 label、多选标签（折叠/删除）、半选态、`check-strictly` 解耦、表单联动
- **Select**：新增 `SelectOptionGroup` 分组、`value-key` 对象值、`empty-values` / `value-on-clear`、`loading-text`、`fit-input-width`、`automatic-dropdown`、`tag-type`、`validate-event`
- **Form / FormItem**：`labelSuffix` 渲染落地、`labelWidth` / `labelPosition` / `inline` 布局真正生效；新增 `validate` 事件、`scrollToField()`、`fields`、`hide-required-asterisk`、`require-asterisk-position`、`inline-message`、`status-icon`、`scroll-to-error`；FormItem 支持单项 `rules` / `error` / `inline-message` / `size` / `label` 插槽与实例方法
- **Autocomplete**：键盘导航、`highlight-first-item`、`select-when-unmatched`、图标/尺寸/长度限制、`hide-loading`、暴露 `focus` / `blur` / `select` / `handleSelect`、表单联动
- **InputNumber / RadioGroup / DatePicker / TimePicker / DateTimePicker**：表单校验联动（`validate-event`）；RadioGroup 新增 `fill` / `text-color`；DateTimePicker 转发插槽
- **Dropdown**：真实浮层定位（自动翻转 / 跟随滚动 / 外点关闭），新增 `show-timeout` / `hide-timeout` / `max-height` / `teleported` / `popper-class`
- **MessageBox**：新增 `distinguish-cancel-and-close`、`round-button`、`container`、`custom-class`、`lock-scroll`、`close-on-click-modal` / `close-on-press-escape`
- **Message**：新增 `icon`、`close-icon`、`grouping`（同内容合并计数）
- **Dialog**：新增 `draggable`、`align-center`、`close-icon`、`z-index`
- **Button**：`dark` 自定义颜色暗色模式真正生效；**Watermark**：`font` 配置真正生效；**Badge**：新增 `badge-style` / `badge-class`；**Empty**：`description` 默认 `'No Data'`
- **Popover**：补发 `before-show` / `show` / `before-hide` / `hide` / `visible-change`，与 Tooltip 事件面统一（旧事件名保留兼容）

### Bug Fixes

- Dialog 关闭后不再在 DOM 中保留 `role="dialog"`，MessageBox 内容关闭即销毁（修复 `examples/user-management` 长期失败的验收测试）
- Watermark 内容/属性 XML 转义，data URI 全量百分号编码（修复含括号内容的 `url()` 解析）
- 表单 `labelWidth` / `labelPosition` / `inline` 此前只有类名无样式的问题
- 日期类组件 model 类型允许区间初始值 `[null, null]`（`DateModelValue`）
- Menu `router` / Breadcrumb `to` 从透传占位改为真实 vue-router 导航
- `pnpm build:docs` 样式编译与 `typecheck:docs` 类型门禁修复

### Docs

- 修正 19 处文档与实现不一致（未文档化的属性/事件、错误的默认值与载荷、过时的限制说明），统一类型反引号格式

### Build & Publish（构建与发布健康）

- 类型声明范围改为通配单一来源（`vite.config.ts` 与 `tsconfig.build.json` 同步），此前遗漏的 21 个组件目录（affix、anchor、scrollbar、splitter、text、input-number、input-tag、input-otp、mention、cascader、cascader-panel、select-v2、tree-v2、rate、time-select、progress、segmented、tour、countdown、select-option-group、date-picker）全部产出 `.d.ts`，子路径 `exports` 的 `types` 字段不再 404
- 修复 Calendar 声明展开失败（TS4023）导致的 `date-picker/index.d.ts` 缺失：移除组件定义中的内部插槽类型声明，与库内其他组件写法一致
- `dayjs`、`async-validator` 改为构建外部依赖，产物不再把 `es/node_modules/.pnpm/**`、`es/_virtual/**` 打包进包
- 主入口版本号内联为字面量（`scripts/sync-version.mjs` 随发版同步），消除 `es/package.json.js` 副产物
- `checkbox-button`、`table-v2` 注册为独立构建入口，修复「主入口引用图未覆盖导致子路径无 JS 产物」的导入 404
- 新增发布守卫测试：全量组件子路径的 ESM/CJS 入口与类型声明齐全性、产物依赖泄漏与副产物断言

### Chores（死代码清理）

- 删除零引用的遗留目录：`mask/`（旧版遮罩实现，模块别名不可解析）、`advanced-form/`（无组件的聚合样式，其中未被组件目录覆盖的 autocomplete、color-picker 规则已迁至各自 `index.scss`）；`slider`/`upload`/`tree-select` 与其重复的旧规则随之移除，`style.css` 体积下降
- 删除根目录 `types/` 手写声明（含文件名拼写错误文件），代码中零引用
- 删除 Vue 2 时代的 `message/demo.js`、`message-box/demo.js` 演示脚本与 `checkbox-group/index.scss`、`select-option/index.scss` 空样式文件
- 构建副产物（`es/node_modules`、`es/_virtual`、`es/package.json.js`）随依赖外部化消失，`.gitignore` 已覆盖产物目录

### Styling Architecture（样式架构）

- 十二个无自有样式的组件（card、image、timeline、drawer、watermark、menu、breadcrumb、tabs、dropdown、steps、page-header 及 image-viewer）全部建立目录级 `index.scss`，组件入口自引入样式——**任意组件子路径单独引入时样式齐备**
- 三个聚合样式目录（data-display、feedback、navigation）删除；其中 descriptions/tree/skeleton/statistic/result 的过期重复规则一并清除
- 拆分同时将硬编码色值替换为设计 token（背景、文字、边框、主色、成功/警告/危险色），**暗色主题下相关组件可读**；drawer 此前的硬编码亮色问题随之修复
- `style/index.scss` 汇总登记全部组件样式（含此前遗漏的 alert、notification 等 33 项），删除零引用的 flex 工具类样式文件

### Form Integration（表单集成对齐）

- **Transfer / ColorPicker**：接入表单字段上下文——禁用状态继承 FormItem、`change` 后触发校验（新增 `validate-event` 属性）、绑定字段 `id` 与 `aria-describedby`
- **Checkbox / CheckboxButton**：尺寸继承链补齐（自身 → 分组 → FormItem → 全局配置），CheckboxButton 补齐禁用继承
- **Slider**：禁用与尺寸继承 FormItem、无表单回退全局配置；`show-input` 复用数字输入框组件，`range` 模式渲染起止双输入框并相互约束
- **InputNumber / RadioGroup / Radio / Rate**：统一尺寸回退链，补全局配置兜底
- **SelectV2**：过滤改为整组扫描，保留仍有命中子项的分组头；Select 未命名分组不再渲染空分组头
- **Form**：`validate()` 对齐上游契约——通过时 resolve `true`，失败或校验期间模型变化时 reject 并携带 `invalidFields`（`prop → 消息数组` 映射）；新增 `validate-on-rule-change`、`scroll-to-error-offset`；字段上下文补充 `error()`；自定义校验器支持同步抛错
- 每项均附「禁用表单内控件不可交互」「change 触发校验」回归测试；Form 契约测试覆盖拒绝载荷与规则变化自动校验

#### ⚠️ Form validate 契约迁移

| 变更 | 迁移说明 |
| --- | --- |
| `Form.validate()` 失败时由 resolve `false` 改为 reject 携带无效字段映射 | `await form.validate()` 判断失败的写法改为 `try/catch` 或 `.catch()`；拒绝值为 `{ [prop]: string[] }` |

### Overlay Unification（弹层体系统一）

- **Select / SelectV2 / TreeSelect / Mention / TimeSelect**：下拉层迁移到共享浮层体系——默认传送 `body`（`teleported`），`overflow: hidden` 祖先不再裁剪；统一补齐 `persistent` / `placement` / `fallback-placements` / `popper-options` / `popper-class` / `popper-style` / `effect` 属性族；外点关闭由浮层统一处理，移除各组件手写的文档级监听
- **Select / SelectV2**：打开时优先高亮选中项；键盘导航时高亮项滚动跟随（SelectV2 为虚拟窗口滚动对齐）
- **SelectV2**：补隐藏 `name` 输入，原生表单提交不再丢值（多选序列化为 JSON 数组）
- **Tooltip / Popover**：新增 `auto-close`（打开指定毫秒后自动关闭，独立计时不与显隐延迟冲突）与 `fallback-placements`；实例方法补 `updatePopper` 兼容别名；新增 `v-popover` 指令——值为内容字符串或配置对象，随值更新自动重建
- **Dropdown**：新增 `effect` / `role` / `tabindex` / `trigger-keys` 属性；`command` 事件第二参数补 DropdownItem 组件实例；split-button 复用按钮组件与按钮组，新增 `type` / `button-props`
- **Drawer**：新增 `close-icon`（字符串按文本、组件按节点渲染）；开关补遮罩淡入淡出与面板按方向滑入滑出过渡
- **Menu**：折叠弹层默认传送 `body`，菜单级新增 `popper-offset` / `popper-effect` / `popper-class` / `teleported` / `show-timeout` / `hide-timeout`，子菜单配置优先、回退菜单级
- 面板均补暗色主题（`effect="dark"`）样式与传送回归测试
