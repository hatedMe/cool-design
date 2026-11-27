# 内置语言文案覆盖盘点（2026-11-27）

本表是 T03 的静态盘点交付，不是全库国际化通过证明。范围为业务/设计基础目录，排除 style、directives、__test__。源码及共享实现存在中文不必然意味着全部不可配置；“候选”须结合具体控件和 locale 行为复核。

| 组件 | 状态 | 源码证据 / 后续任务 |
| --- | --- | --- |
| `affix` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/affix) |
| `alert` | 存在文案候选，未认证语言支持 | [alert.tsx](../packages/cool-design/alert/alert.tsx#L47)；LOC06 |
| `anchor` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/anchor) |
| `aside` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/aside) |
| `auto-resizer` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/auto-resizer) |
| `autocomplete` | 已确认缺项，后续专项 | [autocomplete.tsx](../packages/cool-design/autocomplete/autocomplete.tsx#L218)；LOC05：清空按钮 ARIA 文案固定中文 |
| `avatar` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/avatar) |
| `avatar-group` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/avatar-group) |
| `backtop` | 存在文案候选，未认证语言支持 | [backtop.tsx](../packages/cool-design/backtop/backtop.tsx#L101)；LOC06 |
| `badge` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/badge) |
| `border` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/border) |
| `breadcrumb` | 存在文案候选，未认证语言支持 | [breadcrumb.tsx](../packages/cool-design/breadcrumb/breadcrumb.tsx#L54)；LOC06 |
| `button` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/button) |
| `button-group` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/button-group) |
| `calendar` | 已确认缺项，后续专项 | [calendar.tsx](../packages/cool-design/date-picker/calendar.tsx#L1)；LOC03：年/月导航 ARIA 固定中文 |
| `card` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/card) |
| `carousel` | 存在文案候选，未认证语言支持 | [carousel.tsx](../packages/cool-design/carousel/carousel.tsx#L214)；LOC06 |
| `cascader` | 存在文案候选，未认证语言支持 | [cascader.tsx](../packages/cool-design/cascader/cascader.tsx#L75)；LOC06 |
| `cascader-panel` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/cascader-panel) |
| `check-tag` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/check-tag) |
| `checkbox` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/checkbox) |
| `checkbox-button` | 共享实现，需随组件族验证 | [checkbox/button.tsx](../packages/cool-design/checkbox/button.tsx) |
| `checkbox-group` | 共享实现，需随组件族验证 | [checkbox/group.tsx](../packages/cool-design/checkbox/group.tsx) |
| `col` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/col) |
| `collapse` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/collapse) |
| `collapse-transition` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/collapse-transition) |
| `color` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/color) |
| `color-picker` | 存在文案候选，未认证语言支持 | [color-picker.tsx](../packages/cool-design/color-picker/color-picker.tsx#L128)；LOC06 |
| `color-picker-panel` | 存在文案候选，未认证语言支持 | [color-picker-panel.tsx](../packages/cool-design/color-picker-panel/color-picker-panel.tsx#L117)；LOC06 |
| `config-provider` | 已直接接入（按支持的文案范围） | [context.ts](../packages/cool-design/config-provider/context.ts) |
| `container` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/container) |
| `countdown` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/countdown) |
| `date-picker` | 存在文案候选，未认证语言支持 | [date.ts](../packages/cool-design/date-picker/date.ts#L120)；LOC06 |
| `date-picker-panel` | 已直接接入（按支持的文案范围） | [date-picker-panel.tsx](../packages/cool-design/date-picker-panel/date-picker-panel.tsx) |
| `date-time-picker` | 共享实现，需随组件族验证 | [date-picker/date-time-picker.tsx](../packages/cool-design/date-picker/date-time-picker.tsx) |
| `descriptions` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/descriptions) |
| `dialog` | 存在文案候选，未认证语言支持 | [dialog-content.tsx](../packages/cool-design/dialog/dialog-content.tsx#L150)；LOC06 |
| `divider` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/divider) |
| `drawer` | 存在文案候选，未认证语言支持 | [drawer.tsx](../packages/cool-design/drawer/drawer.tsx#L413)；LOC06 |
| `dropdown` | 存在文案候选，未认证语言支持 | [dropdown.tsx](../packages/cool-design/dropdown/dropdown.tsx#L177)；LOC06 |
| `empty` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/empty) |
| `footer` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/footer) |
| `form` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/form) |
| `form-item` | 共享实现，需随组件族验证 | [form-item/form-item.tsx](../packages/cool-design/form-item/form-item.tsx) |
| `header` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/header) |
| `icon` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/icon) |
| `image` | 存在文案候选，未认证语言支持 | [image-viewer.tsx](../packages/cool-design/image/image-viewer.tsx#L256)；LOC06 |
| `input` | 存在文案候选，未认证语言支持 | [input.tsx](../packages/cool-design/input/input.tsx#L258)；LOC06 |
| `input-number` | 存在文案候选，未认证语言支持 | [input-number.tsx](../packages/cool-design/input-number/input-number.tsx#L190)；LOC06 |
| `input-otp` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/input-otp) |
| `input-tag` | 存在文案候选，未认证语言支持 | [input-tag.tsx](../packages/cool-design/input-tag/input-tag.tsx#L230)；LOC06 |
| `layout` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/layout) |
| `link` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/link) |
| `loading` | 存在文案候选，未认证语言支持 | [service.ts](../packages/cool-design/loading/service.ts#L74)；LOC06 |
| `main` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/main) |
| `mention` | 存在文案候选，未认证语言支持 | [mention.tsx](../packages/cool-design/mention/mention.tsx#L267)；LOC06 |
| `menu` | 存在文案候选，未认证语言支持 | [overflow.tsx](../packages/cool-design/menu/overflow.tsx#L191)；LOC06 |
| `message` | 存在文案候选，未认证语言支持 | [message.tsx](../packages/cool-design/message/message.tsx#L82)；LOC06 |
| `message-box` | 存在文案候选，未认证语言支持 | [message-box.tsx](../packages/cool-design/message-box/message-box.tsx#L26)；LOC06 |
| `notification` | 存在文案候选，未认证语言支持 | [notify.ts](../packages/cool-design/notification/notify.ts#L7)；LOC06 |
| `overlay` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/overlay) |
| `page-header` | 存在文案候选，未认证语言支持 | [page-header.tsx](../packages/cool-design/page-header/page-header.tsx#L23)；LOC06 |
| `pagination` | 存在文案候选，未认证语言支持 | [pagination.tsx](../packages/cool-design/pagination/pagination.tsx#L168)；LOC06 |
| `popconfirm` | 存在文案候选，未认证语言支持 | [popconfirm.tsx](../packages/cool-design/popconfirm/popconfirm.tsx#L27)；LOC06 |
| `popover` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/popover) |
| `popper` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/popper) |
| `progress` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/progress) |
| `radio` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/radio) |
| `radio-button` | 共享实现，需随组件族验证 | [radio/radio.tsx](../packages/cool-design/radio/radio.tsx) |
| `radio-group` | 共享实现，需随组件族验证 | [radio/group.tsx](../packages/cool-design/radio/group.tsx) |
| `rate` | 存在文案候选，未认证语言支持 | [rate.tsx](../packages/cool-design/rate/rate.tsx#L28)；LOC06 |
| `result` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/result) |
| `row` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/row) |
| `scrollbar` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/scrollbar) |
| `segmented` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/segmented) |
| `select` | 已直接接入（按支持的文案范围） | [select.tsx](../packages/cool-design/select/select.tsx) |
| `select-option` | 共享实现，需随组件族验证 | [select-option/select-option.tsx](../packages/cool-design/select-option/select-option.tsx) |
| `select-option-group` | 共享实现，需随组件族验证 | [select-option-group/option-group.tsx](../packages/cool-design/select-option-group/option-group.tsx) |
| `select-v2` | 已直接接入（按支持的文案范围） | [select-v2.tsx](../packages/cool-design/select-v2/select-v2.tsx) |
| `skeleton` | 存在文案候选，未认证语言支持 | [skeleton.tsx](../packages/cool-design/skeleton/skeleton.tsx#L73)；LOC06 |
| `slider` | 存在文案候选，未认证语言支持 | [slider.tsx](../packages/cool-design/slider/slider.tsx#L295)；LOC06 |
| `space` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/space) |
| `splitter` | 存在文案候选，未认证语言支持 | [splitter.tsx](../packages/cool-design/splitter/splitter.tsx#L276)；LOC06 |
| `statistic` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/statistic) |
| `steps` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/steps) |
| `switch` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/switch) |
| `table` | 已确认缺项，后续专项 | [table.tsx](../packages/cool-design/table/table.tsx#L77)；LOC01：筛选确认文案固定中文 |
| `table-column` | 共享实现，需随组件族验证 | [table-column/table-column.tsx](../packages/cool-design/table-column/table-column.tsx) |
| `table-v2` | 已确认缺项，后续专项 | [table-v2.tsx](../packages/cool-design/table-v2/table-v2.tsx#L92)；LOC01：emptyText 默认中文 |
| `tabs` | 存在文案候选，未认证语言支持 | [tabs.tsx](../packages/cool-design/tabs/tabs.tsx#L408)；LOC06 |
| `tag` | 存在文案候选，未认证语言支持 | [tag.tsx](../packages/cool-design/tag/tag.tsx#L45)；LOC06 |
| `text` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/text) |
| `time-picker` | 共享实现，需随组件族验证 | [date-picker/time-picker.tsx](../packages/cool-design/date-picker/time-picker.tsx) |
| `time-select` | 已确认缺项，后续专项 | [time-select.tsx](../packages/cool-design/time-select/time-select.tsx#L42)；LOC04：placeholder 默认中文 |
| `timeline` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/timeline) |
| `tooltip` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/tooltip) |
| `tour` | 存在文案候选，未认证语言支持 | [tour.tsx](../packages/cool-design/tour/tour.tsx#L284)；LOC06 |
| `tour-step` | 共享实现，需随组件族验证 | [tour/tour.tsx](../packages/cool-design/tour/tour.tsx) |
| `transfer` | 存在文案候选，未认证语言支持 | [transfer.tsx](../packages/cool-design/transfer/transfer.tsx#L32)；LOC06 |
| `tree` | 已确认缺项，后续专项 | [tree.tsx](../packages/cool-design/tree/tree.tsx#L66)；LOC02：emptyText 默认中文 |
| `tree-select` | 存在文案候选，未认证语言支持 | [tree-select.tsx](../packages/cool-design/tree-select/tree-select.tsx#L59)；LOC06 |
| `tree-v2` | 已确认缺项，后续专项 | [tree-v2.tsx](../packages/cool-design/tree-v2/tree-v2.tsx#L31)；LOC02：emptyText 默认中文 |
| `upload` | 存在文案候选，未认证语言支持 | [upload.tsx](../packages/cool-design/upload/upload.tsx#L429)；LOC06 |
| `watermark` | 未检出内置中文候选（静态扫描） | [目录](../packages/cool-design/watermark) |

## 后续任务

| 编号 | 范围 | 验收要求 |
| --- | --- | --- |
| LOC01 | Table / TableV2 | 默认空数据、筛选、汇总等文案继承 locale，显式配置优先 |
| LOC02 | Tree / TreeV2 | 空状态和无障碍文案支持语言切换 |
| LOC03 | Calendar / DatePicker / TimePicker / DateTimePicker | 共享面板的导航、按钮、日期和 ARIA 按 locale 验证；不将独立 DatePickerPanel 的支持直接推定给所有入口 |
| LOC04 | TimeSelect | placeholder、空值、清空 ARIA 文案支持语言切换 |
| LOC05 | Autocomplete 等输入控件 | 清空、移除、高亮等可访问名称完成语言适配 |
| LOC06 | 表内其他文案候选 | 区分固定中文、可自定义文案、错误提示和注释；确认后按组件补测试，不能批量替换字符串 |

SelectV2 已验证默认文案语言切换及显式参数优先；其余确定缺项已编号，属于后续国际化专项，不计作本轮已修复。

?????????
