# Link 文字链接

用于文字导航与行内操作，支持主题色、三种尺寸、图标与禁用状态。

## API

| 属性      | 类型                                                  | 默认                |
| --------- | ----------------------------------------------------- | ------------------- |
| type      | default / primary / success / warning / danger / info | default             |
| size      | small / default / large                               | 继承 ConfigProvider |
| href      | string                                                | —                   |
| target    | string                                                | \_self              |
| disabled  | boolean                                               | false               |
| underline | always / hover / never / boolean                      | hover               |
| icon      | 字体图标类名                                          | —                   |

-   默认插槽：链接文字；icon 插槽优先于 icon 属性，可放自定义 Icon。
-   click(event)：仅启用时触发，参数是原生 MouseEvent；需要阻止导航时调用 event.preventDefault()。
-   true 下划线兼容值对应 hover，false 对应 never；always 始终显示。
-   有 href 时保留原生链接及 Enter 激活；无 href 时提供 button 语义、tabindex=0 和 Enter/Space 激活。
-   禁用时移除 href/target、退出 Tab 顺序并阻止业务 click。新窗口自动合并 rel=noopener noreferrer，同时保留用户传入的 rel。
-   支持标准 HTML 属性，颜色使用语义变量。适用于正常 URL 和业务内导航，不内置路由器。
