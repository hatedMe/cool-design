# Container 布局容器

用于组合页头、侧栏、主内容和页脚。默认检测直接子元素（含 Fragment）中的 Header/Footer，存在时纵向排列，否则横向排列；显式 direction 优先。自定义包装组件内部的 Header/Footer 不做递归探测，应显式设置 direction。

## API

| 属性      | 类型                  | 默认     |
| --------- | --------------------- | -------- |
| direction | horizontal / vertical | 自动判断 |

默认插槽放布局区域。嵌套 Container 可组织侧栏与主内容；容器使用 Flex 并允许内部收缩。需要区域独立滚动时，为外层设置确定高度，Main 默认自动滚动；容器不会擅自占满视口。

分别支持 Container、Header、Aside、Main、Footer 的全量注册和单独导入，例如 `import Aside from 'cool-design/aside'`。
