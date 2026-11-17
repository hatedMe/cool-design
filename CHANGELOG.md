# Changelog

## Unreleased

对齐 Element Plus 的功能/参数专项（阶段 0～3）。以下为本次变更摘要，破坏性变更附迁移说明。

### ⚠️ Breaking Changes（破坏性变更）

| 组件 | 变更 | 迁移说明 |
| --- | --- | --- |
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

### Docs

- 修正 19 处文档与实现不一致（未文档化的属性/事件、错误的默认值与载荷、过时的限制说明），统一类型反引号格式
