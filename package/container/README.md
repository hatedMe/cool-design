# Container 布局容器

通过 Flex 布局组合页头、侧栏、主内容和页脚，搭建 PC 后台页面的基本结构。

| 组件      | 用途                                     | 根元素  |
| --------- | ---------------------------------------- | ------- |
| Container | 外层或嵌套布局容器，管理子区域的排列方向 | section |
| Header    | 页头、品牌和工具栏                       | header  |
| Aside     | 侧栏导航或辅助内容                       | aside   |
| Main      | 自动填充剩余空间的主内容区域             | main    |
| Footer    | 页脚、统计或底部操作区域                 | footer  |

Container 默认检测**直接子节点**（含 Fragment）中的 Header/Footer：存在时纵向排列，否则横向排列。嵌套 Container 各自独立判断方向；显式 `direction` 优先。自定义包装组件内部的 Header/Footer 不会被探测，应手动指定方向。

推荐把布局区域直接放在 Container 内，需要组合分区时再嵌套 Container。Header、Aside、Main、Footer 的内容由默认插槽提供。Main 使用原生 main 标签，页面应避免出现多个同时可见的主内容地标；嵌套布局时用 Container 组织层级即可。

下面包含七种常见页面布局、可折叠侧栏的后台示例、自定义尺寸、方向切换和独立滚动演示。背景色和区域边框由示例添加，组件本身只提供布局。

## API

### Container API

#### Container Attributes

| 属性名    | 说明                                   | 类型 / 可选值         | 默认值                                                        |
| --------- | -------------------------------------- | --------------------- | ------------------------------------------------------------- |
| direction | 子区域排列方向，显式设置时覆盖自动判断 | horizontal / vertical | 直接子节点包含 Header/Footer 时为 vertical，否则为 horizontal |

#### Container Slots

| 插槽名  | 说明     | 建议内容                                   |
| ------- | -------- | ------------------------------------------ |
| default | 布局区域 | Container / Header / Aside / Main / Footer |

### Header API

#### Header Attributes

| 属性名 | 说明                                          | 类型            | 默认值 |
| ------ | --------------------------------------------- | --------------- | ------ |
| height | 页头高度，数字按 px 处理，字符串作为 CSS 高度 | string / number | 60px   |

#### Header Slots

| 插槽名  | 说明                               |
| ------- | ---------------------------------- |
| default | 页头内容，例如品牌、面包屑、工具栏 |

### Aside API

#### Aside Attributes

| 属性名 | 说明                                          | 类型            | 默认值 |
| ------ | --------------------------------------------- | --------------- | ------ |
| width  | 侧栏宽度，数字按 px 处理，字符串作为 CSS 宽度 | string / number | 300px  |

#### Aside Slots

| 插槽名  | 说明                               |
| ------- | ---------------------------------- |
| default | 侧栏内容，例如导航、筛选或辅助信息 |

### Main API

Main 没有专属属性；可用 `class`、`style` 等原生属性定制区域。

#### Main Slots

| 插槽名  | 说明                                     |
| ------- | ---------------------------------------- |
| default | 页面主内容，例如查询表单、表格、编辑区域 |

### Footer API

#### Footer Attributes

| 属性名 | 说明                                          | 类型            | 默认值 |
| ------ | --------------------------------------------- | --------------- | ------ |
| height | 页脚高度，数字按 px 处理，字符串作为 CSS 高度 | string / number | 60px   |

#### Footer Slots

| 插槽名  | 说明                               |
| ------- | ---------------------------------- |
| default | 页脚内容，例如统计、版权或操作按钮 |

### 尺寸与滚动

-   Container 默认填充分配给它的弹性空间，不会主动占满浏览器视口。需要整页布局时，在页面外层设置 `height: 100vh`，或使用项目已有的明确高度。
-   Header、Aside、Footer 默认不参与弹性收缩；Main 填充剩余空间。尺寸字符串支持 `px`、`rem`、百分比等 CSS 值；百分比高度需要父级有可计算的高度。
-   Main 默认 `overflow: auto`，Aside 也支持内部滚动。需要区域独立滚动时，外层必须有明确高度，并且中间嵌套容器能够收缩；组件已设置必要的 `min-width: 0`、`min-height: 0`。
-   固定页头、页脚的效果来自弹性布局下的 Main 内部滚动，不需要额外的 `position: fixed`。滚动整张页面时，各区域仍会随页面移动。
-   Main 默认内边距为 20px。Table 可以横向滚动；小屏侧栏需要自行折叠或调整宽度，Container 不会自动隐藏导航。

### CSS 变量

可在局部 Container 或对应区域上覆盖，变量会按 CSS 继承规则生效。

| 变量               | 说明              | 默认值 |
| ------------------ | ----------------- | ------ |
| --i-header-padding | Header 左右内边距 | 20px   |
| --i-main-padding   | Main 四周内边距   | 20px   |
| --i-footer-padding | Footer 左右内边距 | 20px   |

```vue
<Container style="height: 400px; --i-main-padding: 16px">
    <Header :height="48">页头</Header>
    <Container>
        <Aside :width="180">侧栏</Aside>
        <Main>自动填充并在溢出时滚动</Main>
    </Container>
</Container>
```

### 按需引入

五个组件均支持全局注册、具名引入和独立入口；独立入口同样需要引入组件库样式。

```ts
import { Container, Header, Aside, Main, Footer } from "cool-design";
import "cool-design/style.css";
```

也可以逐个引入：

```ts
import Container from "cool-design/container";
import Header from "cool-design/header";
import Aside from "cool-design/aside";
import Main from "cool-design/main";
import Footer from "cool-design/footer";
import "cool-design/style.css";
```

独立组件文档：[Header](#/components/header)、[Aside](#/components/aside)、[Main](#/components/main)、[Footer](#/components/footer)。
