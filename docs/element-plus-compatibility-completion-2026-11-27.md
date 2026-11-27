# Element Plus 兼容修复交付记录（2026-11-27）

## 交付结论

已按 [开发任务书](superpowers/plans/2026-11-27-element-plus-compatibility-repair.md) 在当前 `dev` 分支完成本轮开发，按独立修复提交，未推送或发布。修复前问题见 [原审计快照](element-plus-parity-audit-2026-11-27.md)。

- 固定对照 Element Plus `2.14.8`，`El*` 公共组件/服务导出从 `117/123` 补至 `123/123`；不包含全部 hooks、常量和工具。
- 本轮约定的确定性 API/行为差距已修复，公开类型、API 文档、演示和验收脚本同步更新。
- 最终完整测试为 **165 个文件、1835 项通过**。`pnpm verify` 全链路通过；最后追加两项测试后又完整运行了 `pnpm test`。
- 国际化只完成本期 SelectV2 修复，其他组件文案进入 [LOC01—LOC06 后续任务](locale-coverage-2026-11-27.md)。不宣称全库所有 API、视觉和 SSR 场景完全兼容。

## 逐项状态与提交

| 任务 | 交付及证据 | 主要提交 |
| --- | --- | --- |
| T01 | SelectV2 实际行高测量、偏移、过滤/替换缓存、键盘滚动、观察器清理；固定高度规模回归保留 | `4792365`、`7270dfe`、`134279f` |
| T02 | 宽度布尔/数值配置、ResizeObserver 更新、滚动条及 prefix；独立 namespace 下边框计入宽度 | `4792365`、`8589350`、`644a3c0` |
| T03 | SelectV2 locale、语言切换和显式参数优先；盘点 104 个组件/基础目录 | `4792365`、`717e287`；语言盘点文档随本报告提交 |
| T04 | TableV2 max-height、默认 12px 缩进、滚动条尺寸与常显 | `01f37cc` |
| T05 | Menu ellipsis-icon、外部点击开关、Teleport 内点击判断 | `7bb21af` |
| T06 | Tour / TourStep / 配置式步骤 content-style，切换不残留 | `b318625` |
| T07 | Tooltip focus-on-target，默认不抢焦点 | `76dc792` |
| T08 | Scrollbar mask、滚动边界、native 模式、ARIA 落至 view | `0f7752a` |
| T09 | 固定版本底层组件契约、使用示例、注册与实例约定 | `4eea8ed` |
| T10 | 新增 CollapseTransition、Overlay，过渡取消/清理与完整遮罩点击协议 | `84a9a34`、`d53841b`、`710c9b2` |
| T11 | 新增 Popper / Trigger / Content / Arrow，定位、引用、ARIA、事件、焦点及释放 | `605aab7`、`e900765`、`fedcee1` |
| T12 | Select 箭头/过渡、Cascader clear-icon、TreeV2 node-drop、Provider 预留配置、插槽文档 | `7390aa9`、`18afa4f`、`459b551`、`5d21b6d`、`823af76` |
| T13 | 导出检查接入 verify，新增 SSR/客户端接管回归，文档公开入口及打包消费 | `0f80efc`、`4249b50`；本报告及最终复核 |

公共组件目录及类型遵循项目既有组织方式。Popper 的子组件保留在一个组件族目录内，在文档站有独立页面地址和共享组合演示。

## 独立审查后修复

独立审查针对代码与构建产物确认以下问题，均补复现用例后修复并提交：

1. SelectV2 打开后改变 height 不刷新窗口：改为响应式视口高度，并观察面板尺寸。
2. 内容宽度模式每行更新都全量扫描选项：拆分行/宽度测量，缓存最长标签；千条选项滚动回归约束标签读取量。
3. Popper 普通/虚拟模式切换仍监听旧元素：模式与引用共同触发绑定迁移，清理旧监听及 ARIA。
4. 嵌套 Teleport 弹层递归抢焦：复用弹层栈，仅顶层拥有焦点约束。
5. Select 上方弹层箭头位置错误且被滚动区域裁剪：独立滚动内容，箭头按实际 placement 对齐，滚动不带动箭头。提交 `6157d8e`。
6. 越界 scrollTo 对末行高度判断不一致：统一归一化索引，动态末行完整滚入视口。提交 `134279f`。

后续浏览器复验还修复了独立 CSS / 自定义 namespace 下浮层边框导致的 2px 宽度偏差。

## 验证结果

| 检查 | 结果 |
| --- | --- |
| `pnpm typecheck` / `pnpm typecheck:docs` | 通过 |
| `pnpm lint` | 0 错误；保留原有 4 条 v-html 警告 |
| `pnpm build` / `pnpm build:docs` | 通过；文档仍有原有大 chunk 警告 |
| `pnpm verify` | 全链路通过，已纳入 `verify:exports` |
| 最终 `pnpm test` | 165 个文件、1835 项通过 |
| `pnpm verify:exports` | 123/123；ESM/CJS 导出一致；新增全局安装、默认子路径、CSS 子路径通过 |
| 最新 tarball 临时消费项目 | 根入口、子路径、全量安装、ESM/CJS 和 CSS 加载通过 |
| 消费端 `.mts` / `.cts` / GlobalComponents | TypeScript 5.9.3、严格 NodeNext、`types: []`，未跳过库检查，通过 |
| 无 DOM SSR 与客户端接管 | 新增组件渲染通过，保留原节点接管，无 hydration mismatch；已纳入单测 |
| Chromium `156.0.8078.4` | 12 组浏览器场景通过，页面运行错误为空 |

临时消费项目使用自己安装的编译器和 Vue，避免混入仓库的 ambient Node 类型。首次用项目旧编译器检查当前 Vue 类型时遇到 NoInfer 版本约束，改为独立 TypeScript 5.9.3 消费项目后通过；没有因此修改库依赖版本。

一次额外完整测试补跑在发布入口测试处未退出；终止该次运行后，独立重跑在 14.07 秒内完整通过。首次 verify 已通过，组件代码没有为绕过停滞而修改。MaxListenersExceededWarning 和个别 Vue 测试警告在修复前日志中亦存在，未调整全局监听上限或放宽检查。

### 浏览器场景

1. SelectV2 多行实际高度、数值宽度、prefix、千条虚拟滚动及键盘选择。
2. TableV2 内容收缩与展开树行。
3. Menu 外部点击收起。
4. Tour 步骤样式覆盖与切换。
5. Tooltip hover 聚焦。
6. Scrollbar 遮罩、滚动和 ARIA。
7. CollapseTransition 展开/收起。
8. Overlay 内容及关闭。
9. Popper 触发、定位和箭头组合。
10. Select 上方箭头及滚动时稳定性。
11. 自定义 namespace、locale、打开后增高和输入宽度变化。
12. 暗色渲染，见 [验收截图](previews/compatibility-repair-dark-2026-11-27.png)。

## 实施裁定及边界

- 用户要求在当前分支开发，优先于技能默认的工作树流程；保留现有目录结构，没有另建分支。
- Tour 保留历史 maskStyle 面板变量行为，contentStyle 最后覆盖；代价是继续保留此项目扩展，而不是突然移除已有用法。
- 官方固定版本 experimental-features 是空接口，没有消费功能；实现真实的接受/继承契约，未虚构实验参数。以后上游增加功能时需另行对标。
- 审查中的越界索引问题按本轮新引入行为回归处理，虽然初始评为 Minor，也补最小复现修复，没有遗留该缺陷。
- 真实浏览器验收覆盖 Chromium；其他浏览器、全库逐像素对照、所有 props 组合及完整上游工具 API 不在本次认证范围。

?????????
