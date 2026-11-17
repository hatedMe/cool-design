import type { Component } from 'vue';

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
const readmes = import.meta.glob<string>('../../packages/cool-design/*/README.md', { eager: true, as: 'raw' });
const guides = import.meta.glob<string>('../markdown/guide/*.md', { eager: true, as: 'raw' });
const sources = import.meta.glob<string>(['../../packages/cool-design/*/demo/*.vue', '../demos/*.vue'], {
  eager: true,
  as: 'raw'
});
const components = import.meta.glob<{ default: Component }>(
  ['../../packages/cool-design/*/demo/*.vue', '../demos/*.vue'],
  {
    eager: true
  }
);

function demo(path: string, name: string, title: string, description: string): Demo {
  return {
    name,
    title,
    description,
    source: sources[path]
      .trim()
      .replaceAll('from "../../index"', "from 'cool-design'")
      .replaceAll('from "../../packages/cool-design/index"', "from 'cool-design'")
      .replaceAll("from '../../index'", "from 'cool-design'")
      .replaceAll("from '../../packages/cool-design/index'", "from 'cool-design'"),
    component: components[path].default
  };
}

function component(
  id: string,
  title: string,
  group: string,
  demos: [string, string, string][],
  imports?: string[]
): Page {
  return {
    imports: imports ?? [title.split(' ')[0]],
    id: `components/${id}`,
    title,
    group,
    markdown: readmes[`../../packages/cool-design/${id}/README.md`].replace(
      /^(#{3,4} )(.*?)(属性|事件|插槽|Slots)([ \t]*)(\r?)$/gm,
      (_, heading, prefix, name: '属性' | '事件' | '插槽' | 'Slots', spacing, ending) =>
        `${heading}${prefix}${{ 属性: 'Attributes', 事件: 'Events', 插槽: 'Slot', Slots: 'Slot' }[name]}${spacing}${ending}`
    ),
    demos: demos.map(([name, title, description]) =>
      demo(`../../packages/cool-design/${id}/demo/${name}.vue`, name, title, description)
    )
  };
}

export const pages: Page[] = [
  ...[
    { name: 'install', title: '安装', demos: [] },
    { name: 'quickstart', title: '快速上手', demos: [] },
    {
      name: 'theme',
      title: '自定义主题',
      demos: [
        demo(
          '../../packages/cool-design/config-provider/demo/basic.vue',
          'theme',
          '体验局部主题与尺寸',
          '切换局部深色主题，观察大尺寸按钮、标签和输入框；查看代码获取完整示例。'
        )
      ]
    },
    {
      name: 'transition',
      title: '过渡动画',
      demos: [
        demo(
          '../demos/motion.vue',
          'transition',
          '淡入淡出与滑动渐变',
          '选择一种动画后切换面板显示。示例使用 Vue 3 内置 Transition，并遵循系统减少动态效果偏好。'
        )
      ]
    },
    { name: 'typography', title: '排版规范', demos: [] }
  ].map(({ name, title, demos }) => ({
    id: `guide/${name}`,
    title,
    group: '开发指南',
    markdown: guides[`../markdown/guide/${name}.md`],
    demos
  })),
  component('button', 'Button 按钮', '基础组件', [
    ['basic', '按钮类型', '用不同类型区分主要操作、普通操作和风险操作。'],
    ['appearance', '朴素、文字、链接与形状', '组合 plain、text、link、round、circle 和 dashed 外观。'],
    ['icons', '图标按钮', '使用内置图标类名、图标插槽或仅图标按钮。'],
    ['group', '按钮组', '将相近操作组合为水平或垂直按钮组。'],
    ['loading', '加载状态与自定义内容', '加载期间阻止点击，也可以通过 loading 插槽替换提示内容。'],
    ['sizes', '按钮尺寸', 'PC 默认高度为 32px，也可使用小尺寸与大尺寸。'],
    ['states', '禁用状态', '禁用按钮不会触发点击事件。'],
    ['native', '原生标签与表单', '使用 nativeType 提交表单，也可以渲染为链接标签。'],
    ['colors', '自定义颜色', '使用 color 设置按钮颜色，并与 plain、text 和 disabled 组合。'],
    ['events', '点击事件', '点击按钮，查看事件触发结果。']
  ]),
  component(
    'button-group',
    'ButtonGroup 按钮组',
    '基础组件',
    [['basic', '按钮组', '统一按钮类型并组合相近操作。']],
    ['Button', 'ButtonGroup']
  ),
  component('avatar', 'Avatar 头像', '基础组件', [
    ['basic', '基础用法', '使用 shape 和 size 设置头像的形状与大小。'],
    ['types', '展示类型', '展示图片、图标和文字三种头像内容。'],
    ['fallback', '回退行为', '图片加载失败后显示 fallback 内容并触发 error 事件。'],
    ['fit', '适应容器', '对照不同 fit 值下图片在头像容器中的展示方式。']
  ]),
  component('badge', 'Badge 徽标', '基础组件', [
    ['basic', '数量与状态', '展示数量上限、状态颜色和圆点徽标。'],
    ['options', '隐藏、零值与偏移', '控制徽标隐藏、零值显示、自定义颜色和位置。'],
    ['content', '自定义内容', '使用 content 插槽替换徽标文本。']
  ]),
  component(
    'radio',
    'Radio 单选框',
    '表单组件',
    [['basic', '单选组', '使用 RadioGroup 管理受控值、名称和禁用选项。']],
    ['Radio', 'RadioGroup']
  ),
  component(
    'radio-group',
    'RadioGroup 单选组',
    '表单组件',
    [['basic', '受控单选组', '统一管理 Radio 的值、名称和禁用状态。']],
    ['Radio', 'RadioGroup']
  ),
  component(
    'radio-button',
    'RadioButton 单选按钮',
    '表单组件',
    [['basic', '按钮单选组', '使用 RadioButton 构建按钮样式的受控单选组。']],
    ['RadioButton', 'RadioGroup']
  ),
  component(
    'color',
    'Color 色彩',
    '基础组件',
    [['basic', '语义色与主题色阶', '切换全局主题，或修改主色观察派生色同步变化。']],
    []
  ),
  component(
    'border',
    'Border 边框',
    '基础组件',
    [['basic', '边框、圆角与阴影', '对照线型、强弱层次、圆角和阴影；颜色随主题变化。']],
    []
  ),
  component('link', 'Link 文字链接', '基础组件', [
    ['basic', '导航与行内操作', '体验语义色、尺寸、下划线、图标和禁用行为。']
  ]),
  component('text', 'Text 文本', '基础组件', [
    ['basic', '基础用法', '语义色、尺寸与多行省略的行内文本。']
  ]),
  component('scrollbar', 'Scrollbar 滚动条', '基础组件', [
    ['basic', '基础用法', '自绘滚动条的滚动容器。']
  ]),
  component('splitter', 'Splitter 分割面板', '基础组件', [
    ['basic', '基础用法', '可拖拽调整大小的分割面板。']
  ]),
  {
    imports: ['SplitterPanel'],
    id: 'components/splitter-panel',
    title: 'SplitterPanel 分割面板项',
    group: '基础组件',
    markdown:
      '# SplitterPanel 分割面板项\n\n### 介绍\n\nSplitter 的子组件，声明单个面板。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `size` | 面板大小（数字为 px，字符串支持 `%` / `px`），支持 `v-model:size` | `string \\| number` | — |\n| `min` | 最小大小 | `string \\| number` | — |\n| `max` | 最大大小 | `string \\| number` | — |\n| `resizable` | 是否允许拖拽调整 | `boolean` | `true` |\n| `collapsible` | 是否显示折叠按钮 | `boolean` | `false` |\n\n### Events\n\n| 事件名 | 说明 | 回调参数 |\n| ------ | ---- | -------- |\n| `update:size` | 面板大小变化 | `size: number` |\n\n### Slots\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | 面板内容 |\n| `start-collapsible` | 起始侧折叠按钮内容 |\n| `end-collapsible` | 结束侧折叠按钮内容 |\n',
    demos: [
      demo(
        '../../packages/cool-design/splitter/demo/basic.vue',
        'basic',
        '与 Splitter 组合使用',
        '设置初始大小、最小大小与可折叠能力。'
      )
    ]
  },
  component('icon', 'Icon 图标', '基础组件', [
    ['basic', '图标与自定义 SVG', '装饰图标无需名称；表达独立含义时通过 label 提供可访问名称。'],
    ['catalog', '图标目录', '搜索全部内置图标，点击复制完整用法。']
  ]),
  component('space', 'Space 间距', '基础组件', [['basic', '工具栏间距', '使用水平或垂直间距组织桌面工具栏与操作组。']]),
  component('divider', 'Divider 分割线', '基础组件', [
    ['basic', '内容分隔', '横向分割章节，支持文字、虚线和竖向分隔行内操作。']
  ]),
  {
    ...component('layout', 'Layout 布局', '布局组件', [], ['Row', 'Col']),
    demos: [
      demo(
        '../../packages/cool-design/layout/demo/grid.vue',
        'grid',
        '基础布局',
        '通过 span 划分 24 栅格，列宽总和超出 24 时自动换行。'
      ),
      demo(
        '../../packages/cool-design/layout/demo/gutter.vue',
        'gutter',
        '分栏间隔',
        'gutter 以像素为单位设置相邻列间距。'
      ),
      demo(
        '../../packages/cool-design/layout/demo/mixed.vue',
        'mixed',
        '混合布局',
        '组合不同列宽，构建主次分明的页面区域。'
      ),
      demo(
        '../../packages/cool-design/layout/demo/offset.vue',
        'offset',
        '列偏移',
        'offset 在列左侧增加指定栅格数的留白。'
      ),
      demo(
        '../../packages/cool-design/layout/demo/basic.vue',
        'basic',
        '对齐方式',
        '调整水平排列、垂直对齐和列间距，观察布局变化。'
      ),
      demo(
        '../../packages/cool-design/col/demo/position.vue',
        'position',
        '列的视觉位移',
        'push/pull 改变视觉位置，不改变 DOM 和键盘阅读顺序。'
      ),
      demo(
        '../../packages/cool-design/col/demo/responsive.vue',
        'responsive',
        '响应式布局',
        '五个断点控制列宽，span 为 0 时隐藏整列。'
      ),
      demo(
        '../../packages/cool-design/layout/demo/hidden.vue',
        'hidden',
        '基于断点的隐藏类',
        'hidden-* 可用于任意 DOM 元素或组件，已包含在 cool-design/style.css 中。完整范围见下方 API。'
      )
    ]
  },
  component('row', 'Row 行布局', '布局组件', [
    ['basic', '24 栅格布局', '使用 gutter 设置列间距；内部配合 Col 划分宽度。']
  ]),
  component('col', 'Col 列布局', '布局组件', [
    ['basic', '列宽与偏移', 'span 与 offset 以 24 栅格为单位。'],
    ['responsive', '响应式布局与隐藏', '调整窗口宽度，观察断点列宽与小屏隐藏。'],
    ['position', '列的视觉位移', 'push/pull 改变视觉位置，offset 改变留白。']
  ]),
  component(
    'container',
    'Container 布局容器',
    '布局组件',
    [
      ['basic', '常见页面布局', '七种页面组合：通过嵌套 Container 控制页头、侧栏、主内容和页脚的位置。'],
      ['admin', '后台布局示例', '侧栏导航、页头工具栏、内容表格与页脚组合；点击按钮可折叠侧栏。'],
      ['size', '自定义区域尺寸', 'Header/Footer 的 height 和 Aside 的 width 同时支持数字与 CSS 长度。'],
      ['direction', '显式设置排列方向', '自动判断适合直接布局区域；自定义包装层可以使用 direction 明确指定方向。'],
      ['scroll', '主区域独立滚动', '限定外层高度后，主内容独立滚动，页头页脚保持可见。']
    ],
    ['Container', 'Header', 'Aside', 'Main', 'Footer']
  ),
  component('header', 'Header 页头', '布局组件', [
    ['basic', '自定义页头高度', '顶栏保持高度，主内容自动填充剩余区域。']
  ]),
  component('aside', 'Aside 侧栏', '布局组件', [
    ['basic', '自定义侧栏宽度', '横向布局内，侧栏固定宽度，主内容占据剩余区域。']
  ]),
  component('main', 'Main 主内容', '布局组件', [['basic', '滚动主区域', '主区域自动填充，超出内容在区域内部滚动。']]),
  component('footer', 'Footer 页脚', '布局组件', [['basic', '自定义页脚高度', '页脚区域支持数字与 CSS 长度。']]),
  component('config-provider', 'ConfigProvider 全局配置', '基础组件', [
    ['basic', '主题与尺寸', '局部配置作用于内部控件，切换主题也会作用于内部浮层。']
  ]),
  component('input', 'Input 输入框', '表单组件', [
    ['basic', '基础用法', 'v-model 绑定字符串，支持占位文本。'],
    ['states', '禁用、只读与清空', '比较 disabled、readonly 和 clearable 的行为。'],
    ['password', '密码输入', '使用 show-password 切换密码可见性。'],
    ['textarea', '文本域与长度统计', '使用 textarea、rows 和 show-word-limit 输入多行内容。'],
    ['formatter', '格式化与自适应', '使用 formatter/parser 和 autosize 处理金额与多行文本。'],
    ['sizes', '尺寸与图标', '使用 small、default、large 和前后缀图标。']
  ]),
  component('input-number', 'InputNumber 计数器', '表单组件', [['basic', '基础用法', '输入数值并使用步长控制。']]),
  component('input-tag', 'InputTag 标签输入框', '表单组件', [
    ['basic', '基础用法', '输入后回车创建标签，支持删除与拖拽排序。']
  ]),
  component('date-picker', 'DatePicker 日期选择器', '表单组件', [
    ['basic', '日期选择', '选择日期、日期时间以及日期范围。']
  ]),
  component('time-picker', 'TimePicker 时间选择器', '表单组件', [['basic', '时间选择', '选择时间或时间范围。']]),
  component('time-select', 'TimeSelect 时间选择', '表单组件', [
    ['basic', '基础用法', '在 start/step/end 生成的固定时间点中选择。']
  ]),
  component('date-time-picker', 'DateTimePicker 日期时间选择器', '表单组件', [
    ['basic', '日期时间选择', '在同一个控件中选择日期和时间。']
  ]),
  component('calendar', 'Calendar 日历', '表单组件', [
    ['basic', '日历选择', '按月浏览并选择日期，支持自定义单元格。'],
    ['range', '范围与选择器', '使用固定周范围或年月选择器切换面板。']
  ]),
  component(
    'menu',
    'Menu 菜单',
    '导航组件',
    [
      ['basic', '页面导航', '使用菜单项切换页面区域。'],
      ['element', '子组件用法', '使用 MenuItem/SubMenu/MenuItemGroup 构建导航。']
    ],
    ['Menu', 'MenuItem', 'SubMenu', 'MenuItemGroup']
  ),
  {
    imports: ['MenuItem'],
    id: 'components/menu-item',
    title: 'MenuItem 菜单项',
    group: '导航组件',
    markdown:
      '# MenuItem 菜单项\n\n### 介绍\n\nMenu 的子组件，声明单个菜单项。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `index` | 唯一索引 | `string` | — |\n| `disabled` | 是否禁用 | `boolean` | `false` |\n| `route` | 路由透传值 | `string \\| Record` | — |\n| `to` | 链接透传值 | `string \\| Record` | — |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | 菜单项内容 |\n',
    demos: [
      demo(
        '../../packages/cool-design/menu/demo/element.vue',
        'element',
        '子组件用法',
        '使用 MenuItem/SubMenu/MenuItemGroup 构建导航。'
      )
    ]
  },
  {
    imports: ['SubMenu'],
    id: 'components/sub-menu',
    title: 'SubMenu 子菜单',
    group: '导航组件',
    markdown:
      '# SubMenu 子菜单\n\n### 介绍\n\nMenu 的子组件，声明可展开的子菜单。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `index` | 唯一索引 | `string` | — |\n| `disabled` | 是否禁用 | `boolean` | `false` |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `title` | 子菜单标题 |\n| `default` | 子菜单项 |\n',
    demos: [
      demo(
        '../../packages/cool-design/menu/demo/element.vue',
        'element',
        '子组件用法',
        '使用 MenuItem/SubMenu/MenuItemGroup 构建导航。'
      )
    ]
  },
  {
    imports: ['MenuItemGroup'],
    id: 'components/menu-item-group',
    title: 'MenuItemGroup 菜单分组',
    group: '导航组件',
    markdown:
      '# MenuItemGroup 菜单分组\n\n### 介绍\n\nMenu 的子组件，声明菜单分组。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `title` | 分组标题 | `string` | `\'\'` |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `title` | 自定义标题 |\n| `default` | 分组内菜单项 |\n',
    demos: [
      demo(
        '../../packages/cool-design/menu/demo/element.vue',
        'element',
        '子组件用法',
        '使用 MenuItem/SubMenu/MenuItemGroup 构建导航。'
      )
    ]
  },
  component(
    'breadcrumb',
    'Breadcrumb 面包屑',
    '导航组件',
    [
      ['basic', '层级导航', '展示当前页面路径。'],
      ['element', '子组件用法', '使用 BreadcrumbItem 构建面包屑。']
    ],
    ['Breadcrumb', 'BreadcrumbItem']
  ),
  {
    imports: ['BreadcrumbItem'],
    id: 'components/breadcrumb-item',
    title: 'BreadcrumbItem 面包屑项',
    group: '导航组件',
    markdown:
      '# BreadcrumbItem 面包屑项\n\n### 介绍\n\nBreadcrumb 的子组件，声明单个层级。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `to` | 跳转目标 | `string \\| Record` | — |\n| `replace` | 是否替换历史 | `boolean` | `false` |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | 面包屑内容 |\n| `separator` | 单项自定义分隔符 |\n',
    demos: [
      demo(
        '../../packages/cool-design/breadcrumb/demo/element.vue',
        'element',
        '子组件用法',
        '使用 BreadcrumbItem 构建面包屑。'
      )
    ]
  },
  component(
    'tabs',
    'Tabs 标签页',
    '导航组件',
    [
      ['basic', '内容切换', '在多个面板之间切换。'],
      ['element', '子组件用法', '使用 TabPane 构建标签页。']
    ],
    ['Tabs', 'TabPane']
  ),
  {
    imports: ['TabPane'],
    id: 'components/tab-pane',
    title: 'TabPane 标签面板',
    group: '导航组件',
    markdown:
      '# TabPane 标签面板\n\n### 介绍\n\nTabs 的子组件，声明单个页签与面板。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `label` | 页签标题 | `string` | `\'\'` |\n| `name` | 唯一标识 | `string \\| number` | — |\n| `disabled` | 是否禁用 | `boolean` | `false` |\n| `closable` | 单项是否可关闭 | `boolean` | — |\n| `lazy` | 是否懒渲染 | `boolean` | `false` |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | 面板内容 |\n| `label` | 自定义页签标题 |\n',
    demos: [
      demo(
        '../../packages/cool-design/tabs/demo/element.vue',
        'element',
        '子组件用法',
        '使用 TabPane 构建标签页。'
      )
    ]
  },
  component(
    'dropdown',
    'Dropdown 下拉菜单',
    '导航组件',
    [
      ['basic', '操作菜单', '收纳常用操作。'],
      ['element', '子组件用法', '使用 DropdownMenu/DropdownItem 构建菜单。']
    ],
    ['Dropdown', 'DropdownMenu', 'DropdownItem']
  ),
  {
    imports: ['DropdownMenu'],
    id: 'components/dropdown-menu',
    title: 'DropdownMenu 下拉菜单容器',
    group: '导航组件',
    markdown:
      '# DropdownMenu 下拉菜单容器\n\n### 介绍\n\nDropdown 的子组件，容纳下拉项列表。\n\n## API\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | DropdownItem 列表 |\n',
    demos: [
      demo(
        '../../packages/cool-design/dropdown/demo/element.vue',
        'element',
        '子组件用法',
        '使用 DropdownMenu/DropdownItem 构建菜单。'
      )
    ]
  },
  {
    imports: ['DropdownItem'],
    id: 'components/dropdown-item',
    title: 'DropdownItem 下拉项',
    group: '导航组件',
    markdown:
      '# DropdownItem 下拉项\n\n### 介绍\n\nDropdown 的子组件，声明单个操作项。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `command` | 命令值 | `string \\| number \\| object` | `\'\'` |\n| `disabled` | 是否禁用 | `boolean` | `false` |\n| `divided` | 是否显示分隔线 | `boolean` | `false` |\n| `icon` | 图标 | `string` | `\'\'` |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | 菜单项内容 |\n| `icon` | 自定义图标 |\n',
    demos: [
      demo(
        '../../packages/cool-design/dropdown/demo/element.vue',
        'element',
        '子组件用法',
        '使用 DropdownMenu/DropdownItem 构建菜单。'
      )
    ]
  },
  component(
    'steps',
    'Steps 步骤条',
    '导航组件',
    [
      ['basic', '流程步骤', '展示当前流程进度。'],
      ['element', '子组件用法', '使用 Step 构建步骤条。']
    ],
    ['Steps', 'Step']
  ),
  {
    imports: ['Step'],
    id: 'components/step',
    title: 'Step 步骤',
    group: '导航组件',
    markdown:
      '# Step 步骤\n\n### 介绍\n\nSteps 的子组件，声明单个步骤。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `title` | 标题 | `string` | `\'\'` |\n| `description` | 描述 | `string` | `\'\'` |\n| `icon` | 图标 | `string` | `\'\'` |\n| `status` | 显式状态 | `StepStatus` | `\'\'` |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `icon` | 自定义图标 |\n| `title` | 自定义标题 |\n| `description` | 自定义描述 |\n',
    demos: [
      demo(
        '../../packages/cool-design/steps/demo/element.vue',
        'element',
        '子组件用法',
        '使用 Step 构建步骤条。'
      )
    ]
  },
  component('page-header', 'PageHeader 页头', '导航组件', [
    ['basic', '详情页头', '提供返回、标题和扩展操作。'],
    ['element', '插槽用法', '使用面包屑与默认插槽扩展页头。']
  ]),
  component('affix', 'Affix 固钉', '导航组件', [
    ['basic', '基础用法', '滚动时将元素固定在视口顶部。']
  ]),
  component('anchor', 'Anchor 锚点', '导航组件', [
    ['basic', '基础用法', '滚动定位与自动高亮的锚点导航。']
  ]),
  {
    imports: ['AnchorLink'],
    id: 'components/anchor-link',
    title: 'AnchorLink 锚点链接',
    group: '导航组件',
    markdown:
      '# AnchorLink 锚点链接\n\n### 介绍\n\nAnchor 的子组件，声明单个锚点链接。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `href` | 目标元素地址 | `string` | — |\n| `title` | 链接文本 | `string` | — |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | 链接内容（优先于 `title`） |\n| `sub-link` | 子链接列表 |\n',
    demos: [
      demo(
        '../../packages/cool-design/anchor/demo/basic.vue',
        'basic',
        '与 Anchor 组合使用',
        '通过 href 关联目标元素，支持 sub-link 插槽嵌套子链接。'
      )
    ]
  },
  component('backtop', 'Backtop 回到顶部', '导航组件', [
    ['basic', '滚动回顶', '滚动容器后显示按钮，点击平滑回到顶部。']
  ]),
  component('alert', 'Alert 警告', '反馈组件', [['basic', '提示信息', '展示不同类型的提示。']]),
  component('drawer', 'Drawer 抽屉', '反馈组件', [
    ['basic', '抽屉内容', '从边缘打开内容面板。'],
    ['resizable', '拖拽调整', '拖拽边缘或使用键盘调整抽屉尺寸，无遮罩穿透。']
  ]),
  component('notification', 'Notification 通知', '反馈组件', [['basic', '全局通知', '通过 Notify 展示操作反馈。']]),
  component('popover', 'Popover 弹出框', '反馈组件', [['basic', '补充说明', '展示目标元素的补充内容。']]),
  component('watermark', 'Watermark 水印', '反馈组件', [['basic', '内容水印', '为内容添加重复水印。']]),
  component('card', 'Card 卡片', '数据展示', [['basic', '卡片内容', '使用标题、内容和底部插槽组织信息。']]),
  component(
    'carousel',
    'Carousel 走马灯',
    '数据展示',
    [['basic', '自动轮播', '展示多张幻灯片，支持箭头、指示器、键盘与悬停暂停。']],
    ['Carousel', 'CarouselItem']
  ),
  component(
    'collapse',
    'Collapse 折叠面板',
    '数据展示',
    [['basic', '展开收起', '点击标题展开内容，支持受控、手风琴与禁用。']],
    ['Collapse', 'CollapseItem']
  ),
  {
    imports: ['CarouselItem'],
    id: 'components/carousel-item',
    title: 'CarouselItem 轮播项',
    group: '数据展示',
    markdown:
      '# CarouselItem 轮播项\n\n### 介绍\n\nCarousel 的子组件，声明单个幻灯片。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `name` | 幻灯片名称，用于 `setActiveItem` | `string \\| number` | 索引 |\n| `label` | 幻灯片无障碍标签 | `string \\| number` | `第 n 张` |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | 幻灯片内容 |\n',
    demos: [
      demo(
        '../../packages/cool-design/carousel/demo/basic.vue',
        'basic',
        '自动轮播',
        '展示多张幻灯片，支持箭头、指示器、键盘与悬停暂停。'
      )
    ]
  },
  {
    imports: ['CollapseItem'],
    id: 'components/collapse-item',
    title: 'CollapseItem 折叠项',
    group: '数据展示',
    markdown:
      '# CollapseItem 折叠项\n\n### 介绍\n\nCollapse 的子组件，声明单个可折叠面板。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `name` | 唯一标识 | `string \\| number` | 序号 |\n| `title` | 标题文本 | `string` | `\'\'` |\n| `disabled` | 是否禁用 | `boolean` | `false` |\n| `icon` | 自定义展开图标，替换默认箭头 | `string \\| Component` | — |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `title` | 自定义标题 |\n| `default` | 面板内容 |\n| `icon` | 自定义展开图标 |\n',
    demos: [
      demo(
        '../../packages/cool-design/collapse/demo/basic.vue',
        'basic',
        '展开收起',
        '点击标题展开内容，支持受控、手风琴与禁用。'
      )
    ]
  },
  component(
    'descriptions',
    'Descriptions 描述列表',
    '数据展示',
    [
      ['basic', '详情信息', '以标签和值的形式展示详情。'],
      ['item', '子组件与边框', '使用 DescriptionsItem 配置标签、跨列和自定义标签。'],
      ['vertical', '纵向排列', '纵向展示标签与内容，并控制列数和尺寸。']
    ],
    ['Descriptions', 'DescriptionsItem']
  ),
  {
    imports: ['DescriptionsItem'],
    id: 'components/descriptions-item',
    title: 'DescriptionsItem 描述项',
    group: '数据展示',
    markdown:
      '# DescriptionsItem 描述项\n\n### 介绍\n\nDescriptions 的子组件，声明单个标签与内容。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| label | 标签文本 | `string` | — |\n| span | 横跨列数 | `number` | `1` |\n| rowspan | 横跨行数（横向） | `number` | `1` |\n| width | 内容列宽度 | `string` / `number` | — |\n| min-width | 内容列最小宽度 | `string` / `number` | — |\n| label-width | 标签宽度 | `string` / `number` | — |\n| align | 内容对齐：`left` / `center` / `right` | `string` | — |\n| label-align | 标签对齐：`left` / `center` / `right` | `string` | — |\n| class-name | 内容单元格类名 | `string` | — |\n| label-class-name | 标签单元格类名 | `string` | — |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| default | 内容 |\n| label | 自定义标签 |\n',
    demos: [
      demo(
        '../../packages/cool-design/descriptions/demo/item.vue',
        'item',
        '子组件与边框',
        '使用 DescriptionsItem 配置标签、跨列和自定义标签。'
      )
    ]
  },
  component(
    'image',
    'Image 图片',
    '数据展示',
    [
      ['basic', '图片展示', '展示图片、懒加载占位、失败回退和多图预览。'],
      ['preview', '程序化预览', '调用 showPreview 打开预览，支持起始索引。']
    ],
    ['Image', 'ImageViewer']
  ),
  {
    imports: ['ImageViewer'],
    id: 'components/image-viewer',
    title: 'ImageViewer 图片预览',
    group: '数据展示',
    markdown:
      '# ImageViewer 图片预览\n\n### 介绍\n\nImage 的预览组件，支持多图切换、缩放、旋转、进度、占位与失败状态，多实例共享滚动锁。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `url-list` | 预览地址列表 | `string[]` | `[]` |\n| `initial-index` | 起始索引 | `number` | `0` |\n| `infinite` | 是否循环切换 | `boolean` | `true` |\n| `zoom-rate` | 缩放步长 | `number` | `1.2` |\n| `scale` | 初始缩放 | `number` | `1` |\n| `min-scale` | 最小缩放 | `number` | `0.2` |\n| `max-scale` | 最大缩放 | `number` | `7` |\n| `show-progress` | 是否显示进度 | `boolean` | `false` |\n| `teleported` | 是否挂载到 `body` | `boolean` | `false` |\n| `hide-on-click-modal` | 点击遮罩是否关闭 | `boolean` | `false` |\n| `close-on-press-escape` | `ESC` 是否关闭 | `boolean` | `true` |\n| `z-index` | 层级 | `number` | — |\n\n### Events\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `switch` | 切换图片 |\n| `close` | 关闭预览 |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | 自定义图片内容，参数 `{ url, src, index, activeIndex }` |\n| `progress` | 自定义进度，参数 `{ activeIndex, total }` |\n| `toolbar` | 自定义工具栏，参数 `{ actions, prev, next, reset, setActiveItem, activeIndex }` |\n| `placeholder` / `viewer-placeholder` | 加载占位，参数 `{ activeIndex, src }` |\n| `error` / `viewer-error` | 加载失败，参数 `{ activeIndex, src }` |\n',
    demos: [
      demo(
        '../../packages/cool-design/image/demo/preview.vue',
        'preview',
        '程序化预览',
        '调用 showPreview 打开预览，支持起始索引。'
      )
    ]
  },
  component('result', 'Result 结果', '数据展示', [
    ['basic', '操作结果', '反馈成功结果。'],
    ['status', '状态与操作', '展示成功、警告和失败状态，并在 extra 中放置后续操作。'],
    ['http', '异常状态页', '使用 404、403、500 展示页面级异常。']
  ]),
  component(
    'skeleton',
    'Skeleton 骨架屏',
    '数据展示',
    [
      ['basic', '加载占位', '数据加载时展示骨架，加载完成后切换为真实内容。'],
      ['loading', '节流与数量', '使用 throttle 避免短暂加载闪烁，使用 count 渲染多块骨架。'],
      ['item', '自定义模板', '使用 template 插槽和 SkeletonItem 组合占位形状。']
    ],
    ['Skeleton', 'SkeletonItem']
  ),
  {
    imports: ['SkeletonItem'],
    id: 'components/skeleton-item',
    title: 'SkeletonItem 骨架项',
    group: '数据展示',
    markdown:
      '# SkeletonItem 骨架项\n\n### 介绍\n\nSkeleton 的子组件，在 template 插槽中组合占位形状。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| variant | 占位形状：`p` / `text` / `h1` / `h3` / `caption` / `button` / `image` / `circle` / `rect` | `string` | `text` |\n',
    demos: [
      demo(
        '../../packages/cool-design/skeleton/demo/item.vue',
        'item',
        '自定义模板',
        '使用 template 插槽和 SkeletonItem 组合占位形状。'
      )
    ]
  },
  component('tree', 'Tree 树形控件', '数据展示', [['basic', '层级数据', '展开并勾选树节点。']]),
  component(
    'timeline',
    'Timeline 时间线',
    '数据展示',
    [
      ['basic', '事件记录', '按时间展示事件，支持类型、位置和空心节点。'],
      ['element', '子组件用法', '使用 TimelineItem、交错模式、自定义节点和隐藏时间戳。']
    ],
    ['Timeline', 'TimelineItem']
  ),
  {
    imports: ['TimelineItem'],
    id: 'components/timeline-item',
    title: 'TimelineItem 时间线项',
    group: '数据展示',
    markdown:
      '# TimelineItem 时间线项\n\n### 介绍\n\nTimeline 的子组件，声明单个时间事件。\n\n## API\n\n### Attributes\n\n| 参数 | 说明 | 类型 | 默认值 |\n| ---- | ---- | ---- | ------ |\n| `timestamp` | 时间戳文本 | `string` | `\'\'` |\n| `hide-timestamp` | 是否隐藏时间戳 | `boolean` | `false` |\n| `center` | 内容是否垂直居中 | `boolean` | `false` |\n| `placement` | 时间戳位置：`top` / `bottom` | `string` | `bottom` |\n| `type` | 节点主题：`primary` / `success` / `warning` / `danger` / `info` | `string` | `\'\'` |\n| `color` | 自定义节点颜色 | `string` | `\'\'` |\n| `size` | 节点尺寸：`normal` / `large` | `string` | `normal` |\n| `icon` | 自定义图标 | `string` / `Component` | — |\n| `hollow` | 是否空心节点 | `boolean` | `false` |\n\n### Slot\n\n| 名称 | 说明 |\n| ---- | ---- |\n| `default` | 时间线项内容 |\n| `dot` | 自定义节点 |\n',
    demos: [
      demo(
        '../../packages/cool-design/timeline/demo/element.vue',
        'element',
        '子组件用法',
        '使用 TimelineItem、交错模式、自定义节点和隐藏时间戳。'
      )
    ]
  },
  component('tour', 'Tour 漫游式引导', '数据展示', [
    ['basic', '基础用法', '分步骤聚焦页面元素的引导。']
  ]),
  component('segmented', 'Segmented 分段控制器', '数据展示', [
    ['basic', '基础用法', '在互斥选项间切换的分段按钮。']
  ]),
  component('countdown', 'Countdown 倒计时', '数据展示', [
    ['basic', '基础用法', '按格式展示剩余时间，结束时触发 finish。']
  ]),
  component('statistic', 'Statistic 统计数值', '数据展示', [
    ['basic', '统计指标', '突出展示数值指标。'],
    ['format', '格式化', '配置精度、分隔符、前后缀和自定义格式化函数。']
  ]),
  component('autocomplete', 'Autocomplete 自动补全', '表单组件', [
    ['basic', '建议项补全', '根据输入内容展示静态建议项。']
  ]),
  component('color-picker', 'ColorPicker 颜色选择器', '表单组件', [
    ['basic', '选择颜色', '选择颜色并使用预定义色板。']
  ]),
  component('slider', 'Slider 滑块', '表单组件', [['basic', '数值滑块', '通过滑块选择数值。']]),
  component('rate', 'Rate 评分', '表单组件', [['basic', '评分用法', '支持整数、半星、辅助文字、分数和清零。']]),
  component('progress', 'Progress 进度条', '反馈组件', [
    ['basic', '进度条用法', '展示线形、环形和仪表盘进度，并支持状态、颜色和动画。']
  ]),
  component('transfer', 'Transfer 穿梭框', '表单组件', [['basic', '选项转移', '在两个列表之间移动选项。']]),
  component('tree-select', 'TreeSelect 树形选择', '表单组件', [['basic', '树形选择', '从层级数据中选择节点。']]),
  component('upload', 'Upload 上传', '表单组件', [
    ['basic', '基础上传与自定义请求', '组合受控文件列表、拖拽区域、手动提交和自定义请求。'],
    ['limit', '限制上传数量', '通过 limit 限制文件数量，并在超出时替换之前的文件。'],
    ['picture', '图片列表', '使用 picture 列表展示缩略图，并处理预览与删除。'],
    ['drag', '拖拽上传', '启用拖拽区域，支持多文件选择和上传进度。'],
    ['directory', '目录上传', '选择目录并在列表中展示目录内的文件。'],
    ['avatar', '头像上传', '使用 before-upload 校验文件类型和大小，并隐藏文件列表。']
  ]),
  component('cascader', 'Cascader 级联选择', '表单组件', [
    ['basic', '基础用法', '从级联数据中选择单个值，支持 emitPath 与路径展示。'],
    ['multiple', '多选与过滤', '多选级联勾选、标签折叠和关键字过滤。']
  ]),
  component('cascader-panel', 'CascaderPanel 级联面板', '表单组件', [
    ['basic', '基础用法', '纯面板级联选择，可嵌入自定义交互。']
  ]),
  component('select', 'Select 选择器', '表单组件', [
    ['basic', '基础用法', '从 SelectOption 中选择单个值。'],
    ['states', '禁用与清空', '比较禁用选项、禁用选择器和 clearable。'],
    ['multiple', '多选', '使用 multiple 和数组模型选择多个值。'],
    ['remote', '远程与虚拟选项', '按查询词加载远程选项，并可用于大数据量列表。'],
    ['sizes', '尺寸', '使用 small、default、large 控制选择器高度。']
  ]),
  component('select-option', 'SelectOption 选项', '表单组件', [
    ['basic', '选项与禁用项', '在 Select 中使用，默认插槽优先于 label。']
  ]),
  component('select-option-group', 'SelectOptionGroup 选项分组', '表单组件', [
    ['basic', '选项分组', '使用 SelectOptionGroup 对选项分组，可禁用整组。']
  ]),
  component('checkbox', 'Checkbox 复选框', '表单组件', [
    ['basic', '基础用法', '单项布尔值、尺寸和标签内容。'],
    ['states', '禁用与半选', '禁用选项和 indeterminate 状态。'],
    ['group', '复选框组', '使用数组模型管理多项选择。']
  ]),
  component('checkbox-button', 'CheckboxButton 复选框按钮', '表单组件', [
    ['basic', '按钮用法', '独立使用或在 CheckboxGroup 中使用按钮样式。']
  ]),
  component(
    'checkbox-group',
    'CheckboxGroup 复选框组',
    '表单组件',
    [['basic', '数量限制', '使用 min 和 max 限制选中数量.']],
    ['Checkbox', 'CheckboxGroup']
  ),
  component('switch', 'Switch 开关', '表单组件', [
    ['basic', '基础用法', '使用 Boolean v-model 切换状态。'],
    ['options', '尺寸、文字与自定义值', '配置尺寸、状态文字、颜色和模型值。'],
    ['async', '异步变更', '使用 beforeChange 阻止未确认的状态变化。']
  ]),
  component('form', 'Form 表单', '表单组件', [
    ['basic', '典型表单', '组合 Input、Select、Checkbox 和 Switch 收集表单值。'],
    ['inline', '行内表单与对齐', '使用 inline、labelPosition 和 labelWidth 控制布局。'],
    ['validation', '表单校验', '展示必填、触发时机、异步规则和重置。'],
    ['nested', '嵌套路径校验', '使用 user.name 这样的 prop 校验嵌套模型。']
  ]),
  component('form-item', 'FormItem 字段', '表单组件', [
    ['basic', '字段关联与校验提示', 'prop 对应 model 和 rules 中的同名字段，标签与错误自动关联输入框。']
  ]),
  component('table', 'Table 表格', '数据展示', [
    ['basic', '选择、排序与操作列', '表头可排序，行可勾选；排序由页面处理。列插槽用于状态与操作。'],
    ['states', '空态与加载', '无数据时显示空态，loading 遮罩阻止数据区域交互。'],
    ['advanced', '拖拽列宽、编辑与列显隐', '拖拽表头边缘调整列宽，双击编辑单元格，编程式控制列显示与顺序。']
  ]),
  component('pagination', 'Pagination 分页', '数据展示', [
    ['basic', '分页与每页条数', '页码从 1 开始；改变条数时，由页面把页码重置为 1。'],
    ['layout', '布局与总数', '使用 layout 组合模块，使用 page-count 直接指定总页数。']
  ]),
  component('tag', 'Tag 标签', '数据展示', [
    ['basic', '状态与可关闭标签', 'close 事件仅通知页面，由页面移除对应标签。'],
    ['styles', '圆角与边框标签', '展示 round、hit、尺寸和自定义颜色。']
  ]),
  component('empty', 'Empty 空状态', '数据展示', [
    ['basic', '空态与后续操作', '提供清晰描述，并为用户安排重置或重新加载操作。'],
    ['custom', '自定义图片尺寸', '使用图片地址和 image-size 调整空态插画。']
  ]),
  component('loading', 'Loading 加载', '反馈组件', [
    ['basic', '区域加载', '切换开关观察遮罩；加载期间内部内容无法点击或通过键盘操作。']
  ]),
  component('tooltip', 'Tooltip 文字提示', '反馈组件', [
    ['basic', '悬停与键盘聚焦', '将鼠标移到按钮上或用 Tab 聚焦，按 Esc 关闭提示。']
  ]),
  component('popconfirm', 'Popconfirm 气泡确认', '反馈组件', [
    ['basic', '就近确认操作', '用于简单确认，支持取消、外部点击和 Esc 关闭。']
  ]),
  component('dialog', 'Dialog 对话框', '反馈组件', [
    ['basic', '桌面编辑弹窗', '点击打开编辑窗口，体验尺寸、表单、页脚操作与关闭后的焦点恢复。']
  ]),
  component('message', 'Message 消息反馈', '反馈组件', [
    ['basic', '操作结果反馈', '使用声明式组件显示成功、警告或错误信息，关闭时由页面移除。']
  ]),
  component('message-box', 'MessageBox 消息确认框', '反馈组件', [
    ['basic', '确认与异步失败重试', '勾选模拟失败，确认时显示错误并保持窗口，取消勾选后可重试。']
  ])
];
