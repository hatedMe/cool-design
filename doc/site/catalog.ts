import type { Component } from "vue";

export interface Demo {
    name: string;
    title: string;
    description: string;
    component: Component;
    source: string;
}
export interface Page {
    imports?: string[];
    id: string;
    title: string;
    group: string;
    markdown: string;
    demos: Demo[];
}
const readmes = import.meta.glob<string>("../../package/*/README.md", { eager: true, as: "raw" });
const guides = import.meta.glob<string>("../markdown/guide/*.md", { eager: true, as: "raw" });
const sources = import.meta.glob<string>(["../../package/*/demo/*.vue", "../demos/*.vue"], { eager: true, as: "raw" });
const components = import.meta.glob<{ default: Component }>(["../../package/*/demo/*.vue", "../demos/*.vue"], {
    eager: true
});

function demo(path: string, name: string, title: string, description: string): Demo {
    return {
        name,
        title,
        description,
        source: sources[path]
            .trim()
            .replaceAll('from "../../index"', 'from "cool-design"')
            .replaceAll('from "../../package/index"', 'from "cool-design"'),
        component: components[path].default
    };
}

function component(id: string, title: string, group: string, demos: [string, string, string][], imports?: string[]): Page {
    return {
        imports: imports ?? [title.split(" ")[0]],
        id: `components/${id}`,
        title,
        group,
        markdown: readmes[`../../package/${id}/README.md`].replace(
            /^(#{3,4} )(.*?)(属性|事件|插槽|Slots)([ \t]*)(\r?)$/gm,
            (_, heading, prefix, name: "属性" | "事件" | "插槽" | "Slots", spacing, ending) =>
                `${heading}${prefix}${{ 属性: "Attributes", 事件: "Events", 插槽: "Slot", Slots: "Slot" }[name]}${spacing}${ending}`
        ),
        demos: demos.map(([name, title, description]) =>
            demo(`../../package/${id}/demo/${name}.vue`, name, title, description)
        )
    };
}

export const pages: Page[] = [
    ...[
        { name: "install", title: "安装", demos: [] },
        { name: "quickstart", title: "快速上手", demos: [] },
        {
            name: "theme",
            title: "自定义主题",
            demos: [
                demo(
                    "../../package/config-provider/demo/basic.vue",
                    "theme",
                    "体验局部主题与尺寸",
                    "切换局部深色主题，观察大尺寸按钮、标签和输入框；查看代码获取完整示例。"
                )
            ]
        },
        {
            name: "transition",
            title: "过渡动画",
            demos: [
                demo(
                    "../demos/motion.vue",
                    "transition",
                    "淡入淡出与滑动渐变",
                    "选择一种动画后切换面板显示。示例使用 Vue 3 内置 Transition，并遵循系统减少动态效果偏好。"
                )
            ]
        }
    ].map(({ name, title, demos }) => ({
        id: `guide/${name}`,
        title,
        group: "开发指南",
        markdown: guides[`../markdown/guide/${name}.md`],
        demos
    })),
    component("button", "Button 按钮", "基础组件", [
        ["basic", "按钮类型", "用不同类型区分主要操作、普通操作和风险操作。"],
        ["appearance", "朴素、文字、链接与形状", "组合 plain、text、link、round、circle 和 dashed 外观。"],
        ["icons", "图标按钮", "使用内置图标类名、图标插槽或仅图标按钮。"],
        ["group", "按钮组", "将相近操作组合为水平或垂直按钮组。"],
        ["loading", "加载状态与自定义内容", "加载期间阻止点击，也可以通过 loading 插槽替换提示内容。"],
        ["sizes", "按钮尺寸", "PC 默认高度为 32px，也可使用小尺寸与大尺寸。"],
        ["states", "禁用状态", "禁用按钮不会触发点击事件。"],
        ["native", "原生标签与表单", "使用 nativeType 提交表单，也可以渲染为链接标签。"],
        ["colors", "自定义颜色", "使用 color 设置按钮颜色，并与 plain、text 和 disabled 组合。"],
        ["events", "点击事件", "点击按钮，查看事件触发结果。"]
    ]),
    component("button-group", "ButtonGroup 按钮组", "基础组件", [
        ["basic", "按钮组", "统一按钮类型并组合相近操作。"]
    ], ["Button", "ButtonGroup"]),
    component("avatar", "Avatar 头像", "基础组件", [
        ["basic", "基础用法", "使用 shape 和 size 设置头像的形状与大小。"],
        ["types", "展示类型", "展示图片、图标和文字三种头像内容。"],
        ["fallback", "回退行为", "图片加载失败后显示 fallback 内容并触发 error 事件。"],
        ["fit", "适应容器", "对照不同 fit 值下图片在头像容器中的展示方式。"]
    ]),
    component("badge", "Badge 徽标", "基础组件", [
        ["basic", "数量与状态", "展示数量上限、状态颜色和圆点徽标。"],
        ["options", "隐藏、零值与偏移", "控制徽标隐藏、零值显示、自定义颜色和位置。"]
    ]),
    component("radio", "Radio 单选框", "表单组件", [
        ["basic", "单选组", "使用 RadioGroup 管理受控值、名称和禁用选项。"]
    ], ["Radio", "RadioGroup"]),
    component("radio-group", "RadioGroup 单选组", "表单组件", [
        ["basic", "受控单选组", "统一管理 Radio 的值、名称和禁用状态。"]
    ], ["Radio", "RadioGroup"]),
    component("color", "Color 色彩", "基础组件", [["basic", "语义色与主题色阶", "切换全局主题，或修改主色观察派生色同步变化。"]], []),
    component("border", "Border 边框", "基础组件", [["basic", "边框、圆角与阴影", "对照线型、强弱层次、圆角和阴影；颜色随主题变化。"]], []),
    component("link", "Link 文字链接", "基础组件", [["basic", "导航与行内操作", "体验语义色、尺寸、下划线、图标和禁用行为。"]]),
    component("icon", "Icon 图标", "基础组件", [
        ["basic", "图标与自定义 SVG", "装饰图标无需名称；表达独立含义时通过 label 提供可访问名称。"],
        ["catalog", "图标目录", "搜索全部内置图标，点击复制完整用法。"]
    ]),
    component("space", "Space 间距", "基础组件", [
        ["basic", "工具栏间距", "使用水平或垂直间距组织桌面工具栏与操作组。"]
    ]),
    component("divider", "Divider 分割线", "基础组件", [["basic", "内容分隔", "横向分割章节，支持文字、虚线和竖向分隔行内操作。"]]),
    {
        ...component("layout", "Layout 布局", "布局组件", [], ["Row", "Col"]),
        demos: [
            demo("../../package/layout/demo/grid.vue", "grid", "基础布局", "通过 span 划分 24 栅格，列宽总和超出 24 时自动换行。"),
            demo("../../package/layout/demo/gutter.vue", "gutter", "分栏间隔", "gutter 以像素为单位设置相邻列间距。"),
            demo("../../package/layout/demo/mixed.vue", "mixed", "混合布局", "组合不同列宽，构建主次分明的页面区域。"),
            demo("../../package/layout/demo/offset.vue", "offset", "列偏移", "offset 在列左侧增加指定栅格数的留白。"),
            demo("../../package/layout/demo/basic.vue", "basic", "对齐方式", "调整水平排列、垂直对齐和列间距，观察布局变化。"),
            demo("../../package/col/demo/position.vue", "position", "列的视觉位移", "push/pull 改变视觉位置，不改变 DOM 和键盘阅读顺序。"),
            demo("../../package/col/demo/responsive.vue", "responsive", "响应式布局", "五个断点控制列宽，span 为 0 时隐藏整列。"),
            demo("../../package/layout/demo/hidden.vue", "hidden", "基于断点的隐藏类", "hidden-* 可用于任意 DOM 元素或组件，已包含在 cool-design/style.css 中。完整范围见下方 API。")
        ]
    },
    component("row", "Row 行布局", "布局组件", [
        ["basic", "24 栅格布局", "使用 gutter 设置列间距；内部配合 Col 划分宽度。"]
    ]),
    component("col", "Col 列布局", "布局组件", [["basic", "列宽与偏移", "span 与 offset 以 24 栅格为单位。"], ["responsive", "响应式布局与隐藏", "调整窗口宽度，观察断点列宽与小屏隐藏。"], ["position", "列的视觉位移", "push/pull 改变视觉位置，offset 改变留白。"]]),
    component("container", "Container 布局容器", "布局组件", [
        ["basic", "常见页面布局", "七种页面组合：通过嵌套 Container 控制页头、侧栏、主内容和页脚的位置。"],
        ["admin", "后台布局示例", "侧栏导航、页头工具栏、内容表格与页脚组合；点击按钮可折叠侧栏。"],
        ["size", "自定义区域尺寸", "Header/Footer 的 height 和 Aside 的 width 同时支持数字与 CSS 长度。"],
        ["direction", "显式设置排列方向", "自动判断适合直接布局区域；自定义包装层可以使用 direction 明确指定方向。"],
        ["scroll", "主区域独立滚动", "限定外层高度后，主内容独立滚动，页头页脚保持可见。"]
    ], ["Container", "Header", "Aside", "Main", "Footer"]),
    component("header", "Header 页头", "布局组件", [["basic", "自定义页头高度", "顶栏保持高度，主内容自动填充剩余区域。"]]),
    component("aside", "Aside 侧栏", "布局组件", [["basic", "自定义侧栏宽度", "横向布局内，侧栏固定宽度，主内容占据剩余区域。"]]),
    component("main", "Main 主内容", "布局组件", [["basic", "滚动主区域", "主区域自动填充，超出内容在区域内部滚动。"]]),
    component("footer", "Footer 页脚", "布局组件", [["basic", "自定义页脚高度", "页脚区域支持数字与 CSS 长度。"]]),
    component("config-provider", "ConfigProvider 全局配置", "基础组件", [
        ["basic", "主题与尺寸", "局部配置作用于内部控件，切换主题也会作用于内部浮层。"]
    ]),
    component("input", "Input 输入框", "表单组件", [
        ["basic", "基础用法", "v-model 绑定字符串，支持占位文本。"],
        ["states", "禁用、只读与清空", "比较 disabled、readonly 和 clearable 的行为。"],
        ["password", "密码输入", "使用 show-password 切换密码可见性。"],
        ["textarea", "文本域与长度统计", "使用 textarea、rows 和 show-word-limit 输入多行内容。"],
        ["sizes", "尺寸与图标", "使用 small、default、large 和前后缀图标。"]
    ]),
    component("select", "Select 选择器", "表单组件", [
        ["basic", "基础用法", "从 SelectOption 中选择单个值。"],
        ["states", "禁用与清空", "比较禁用选项、禁用选择器和 clearable。"],
        ["multiple", "多选", "使用 multiple 和数组模型选择多个值。"],
        ["sizes", "尺寸", "使用 small、default、large 控制选择器高度。"]
    ]),
    component("select-option", "SelectOption 选项", "表单组件", [
        ["basic", "选项与禁用项", "在 Select 中使用，默认插槽优先于 label。"]
    ]),
    component("checkbox", "Checkbox 复选框", "表单组件", [
        ["basic", "基础用法", "单项布尔值、尺寸和标签内容。"],
        ["states", "禁用与半选", "禁用选项和 indeterminate 状态。"],
        ["group", "复选框组", "使用数组模型管理多项选择。"]
    ]),
    component("checkbox-group", "CheckboxGroup 复选框组", "表单组件", [["basic", "数量限制", "使用 min 和 max 限制选中数量." ]], ["Checkbox", "CheckboxGroup"]),
    component("switch", "Switch 开关", "表单组件", [
        ["basic", "基础用法", "使用 Boolean v-model 切换状态。"],
        ["options", "尺寸、文字与自定义值", "配置尺寸、状态文字、颜色和模型值。"],
        ["async", "异步变更", "使用 beforeChange 阻止未确认的状态变化。"]
    ]),
    component("form", "Form 表单", "表单组件", [
        ["basic", "典型表单", "组合 Input、Select、Checkbox 和 Switch 收集表单值。"],
        ["inline", "行内表单与对齐", "使用 inline、labelPosition 和 labelWidth 控制布局。"],
        ["validation", "表单校验", "展示必填、触发时机、异步规则和重置。"]
    ]),
    component("form-item", "FormItem 字段", "表单组件", [
        ["basic", "字段关联与校验提示", "prop 对应 model 和 rules 中的同名字段，标签与错误自动关联输入框。"]
    ]),
    component("table", "Table 表格", "数据展示", [
        ["basic", "选择、排序与操作列", "表头可排序，行可勾选；排序由页面处理。列插槽用于状态与操作。"],
        ["states", "空态与加载", "无数据时显示空态，loading 遮罩阻止数据区域交互。"]
    ]),
    component("pagination", "Pagination 分页", "数据展示", [
        ["basic", "分页与每页条数", "页码从 1 开始；改变条数时，由页面把页码重置为 1。"]
    ]),
    component("tag", "Tag 标签", "数据展示", [
        ["basic", "状态与可关闭标签", "close 事件仅通知页面，由页面移除对应标签。"],
        ["styles", "圆角与边框标签", "展示 round、hit、尺寸和自定义颜色。"]
    ]),
    component("empty", "Empty 空状态", "数据展示", [
        ["basic", "空态与后续操作", "提供清晰描述，并为用户安排重置或重新加载操作。"],
        ["custom", "自定义图片尺寸", "使用图片地址和 image-size 调整空态插画。"]
    ]),
    component("loading", "Loading 加载", "反馈组件", [
        ["basic", "区域加载", "切换开关观察遮罩；加载期间内部内容无法点击或通过键盘操作。"]
    ]),
    component("tooltip", "Tooltip 文字提示", "反馈组件", [
        ["basic", "悬停与键盘聚焦", "将鼠标移到按钮上或用 Tab 聚焦，按 Esc 关闭提示。"]
    ]),
    component("popconfirm", "Popconfirm 气泡确认", "反馈组件", [
        ["basic", "就近确认操作", "用于简单确认，支持取消、外部点击和 Esc 关闭。"]
    ]),
    component("dialog", "Dialog 对话框", "反馈组件", [
          ["basic", "桌面编辑弹窗", "点击打开编辑窗口，体验尺寸、表单、页脚操作与关闭后的焦点恢复。"]
    ]),
    component("message", "Message 消息反馈", "反馈组件", [
          ["basic", "操作结果反馈", "使用声明式组件显示成功、警告或错误信息，关闭时由页面移除。"]
    ]),
    component("message-box", "MessageBox 消息确认框", "反馈组件", [
        ["basic", "确认与异步失败重试", "勾选模拟失败，确认时显示错误并保持窗口，取消勾选后可重试。"]
    ])
];
