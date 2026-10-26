import type { Component } from "vue";

export interface Demo {
    name: string;
    title: string;
    description: string;
    component: Component;
    source: string;
}
export interface Page {
    id: string;
    title: string;
    group: string;
    markdown: string;
    demos: Demo[];
}
const readmes = import.meta.glob<string>("../../package/*/README.md", { eager: true, as: "raw" });
const guides = import.meta.glob<string>("../markdown/guide/*.md", { eager: true, as: "raw" });
const sources = import.meta.glob<string>("../../package/*/demo/*.vue", { eager: true, as: "raw" });
const components = import.meta.glob<{ default: Component }>("../../package/*/demo/*.vue", { eager: true });

function component(id: string, title: string, group: string, demos: [string, string, string][]): Page {
    return {
        id: `components/${id}`,
        title,
        group,
        markdown: readmes[`../../package/${id}/README.md`],
        demos: demos.map(([name, demoTitle, description]) => {
            const path = `../../package/${id}/demo/${name}.vue`;
            return {
                name,
                title: demoTitle,
                description,
                source: sources[path].trim().replaceAll('from "../../index"', 'from "cool-design"'),
                component: components[path].default
            };
        })
    };
}

export const pages: Page[] = [
    ...[
        ["quickstart", "快速开始"],
        ["theme", "主题定制"]
    ].map(([name, title]) => ({
        id: `guide/${name}`,
        title,
        group: "开发指南",
        markdown: guides[`../markdown/guide/${name}.md`],
        demos: []
    })),
    component("button", "Button 按钮", "基础组件", [
        ["basic", "按钮类型", "用不同类型区分主要操作、普通操作和风险操作。"],
        ["sizes", "按钮尺寸", "PC 默认高度为 32px，也可使用小尺寸与大尺寸。"],
        ["states", "禁用与加载", "禁用和加载状态都不会触发点击事件。"],
        ["events", "点击事件", "点击按钮，查看事件触发结果。"]
    ]),
    component("icon", "Icon 图标", "基础组件", [
        ["basic", "图标与自定义 SVG", "装饰图标无需名称；表达独立含义时通过 label 提供可访问名称。"]
    ]),
    component("space", "Space 间距", "基础组件", [
        ["basic", "工具栏间距", "使用水平或垂直间距组织桌面工具栏与操作组。"]
    ]),
    component("divider", "Divider 分割线", "基础组件", [["basic", "内容分隔", "横向分割章节，竖向分隔行内操作。"]]),
    component("row", "Row 行布局", "布局组件", [
        ["basic", "24 栅格布局", "使用 gutter 设置列间距；内部配合 Col 划分宽度。"]
    ]),
    component("col", "Col 列布局", "布局组件", [["basic", "列宽与偏移", "span 与 offset 以 24 栅格为单位。"]]),
    component("config-provider", "ConfigProvider 全局配置", "基础组件", [
        ["basic", "主题与尺寸", "局部配置作用于内部控件，切换主题也会作用于内部浮层。"]
    ]),
    component("input", "Input 输入框", "表单组件", [
        ["basic", "输入与清空", "v-model 绑定字符串；清空、只读和禁用状态如下。"]
    ]),
    component("select", "Select 选择器", "表单组件", [
        ["basic", "选择与清空", "基于原生单选控件，支持键盘选择，数字值会保留数字类型。"]
    ]),
    component("select-option", "SelectOption 选项", "表单组件", [
        ["basic", "选项与禁用项", "在 Select 中使用，默认插槽优先于 label。"]
    ]),
    component("checkbox", "Checkbox 复选框", "表单组件", [
        ["basic", "选中与半选", "半选只影响视觉状态，业务勾选结果由 v-model 管理。"]
    ]),
    component("switch", "Switch 开关", "表单组件", [["basic", "切换状态", "用于启用或停用设置，支持空格键操作。"]]),
    component("form", "Form 表单", "表单组件", [
        ["basic", "校验与提交", "提交时先调用 validate，校验通过后执行保存；重置恢复初始值。"]
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
        ["basic", "状态与可关闭标签", "close 事件仅通知页面，由页面移除对应标签。"]
    ]),
    component("empty", "Empty 空状态", "数据展示", [
        ["basic", "空态与后续操作", "提供清晰描述，并为用户安排重置或重新加载操作。"]
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
        ["basic", "桌面编辑弹窗", "点击打开编辑窗口，体验表单、页脚操作与关闭后的焦点恢复。"]
    ]),
    component("message", "Message 消息反馈", "反馈组件", [
        ["basic", "操作结果反馈", "使用声明式组件显示成功或错误信息，关闭时由页面移除。"]
    ]),
    component("message-box", "MessageBox 消息确认框", "反馈组件", [
        ["basic", "确认与异步失败重试", "勾选模拟失败，确认时显示错误并保持窗口，取消勾选后可重试。"]
    ])
];
