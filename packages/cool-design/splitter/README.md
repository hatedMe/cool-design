# Splitter 分割面板

### 介绍

将区域水平或垂直分割，可自由拖拽调整各面板大小，支持折叠（beta）。

## 基础用法

`SplitterPanel` 通过 `size` 设置初始大小（数字为像素，字符串支持 `30%` / `200px`），不设置则均分。`min` / `max` 限制拖拽范围，`resizable` 可禁用拖拽，`collapsible` 在分隔条上提供折叠按钮。

```vue
<Splitter style="height: 250px">
  <SplitterPanel size="30%">面板 1</SplitterPanel>
  <SplitterPanel :min="200">面板 2</SplitterPanel>
</Splitter>
```

`layout="vertical"` 垂直分割；`lazy` 使面板尺寸在拖拽结束后才更新；`v-model:size` 可获取面板实时尺寸（像素）。

## API

### Splitter 属性

| 参数     | 说明                                | 类型                         | 默认值       |
| -------- | ----------------------------------- | ---------------------------- | ------------ |
| `layout` | 分割方向：`horizontal` / `vertical` | `string`                     | `horizontal` |
| `lazy`   | 拖拽结束后才更新面板尺寸            | `boolean`                    | `false`      |

### Splitter 事件

| 事件名        | 说明                                 | 回调参数                     |
| ------------- | ------------------------------------ | ---------------------------- |
| `resize-start` | 开始调整大小                        | `index: number, sizes: number[]` |
| `resize`      | 调整过程中触发                       | `index: number, sizes: number[]` |
| `resize-end`  | 调整结束                             | `index: number, sizes: number[]` |
| `collapse`    | 面板折叠或恢复                       | `index: number`（分隔条索引） |

### SplitterPanel 属性

| 参数         | 说明                                       | 类型                  | 默认值 |
| ------------ | ------------------------------------------ | --------------------- | ------ |
| `size`       | 面板大小（数字为 px，字符串支持 `%` / `px`），支持 `v-model:size` | `string` / `number` | — |
| `min`        | 最小大小（同上格式）                       | `string` / `number`   | —      |
| `max`        | 最大大小（同上格式）                       | `string` / `number`   | —      |
| `resizable`  | 是否允许拖拽调整（相邻面板任一禁用即不可拖） | `boolean`             | `true` |
| `collapsible` | 是否显示折叠按钮                          | `boolean`             | `false` |

### SplitterPanel 事件

| 事件名        | 说明                 | 回调参数        |
| ------------- | -------------------- | --------------- |
| `update:size` | 面板大小变化         | `size: number`（px） |

### SplitterPanel 插槽

| 名称                | 说明                       |
| ------------------- | -------------------------- |
| `default`           | 面板内容                   |
| `start-collapsible` | 起始侧折叠按钮内容         |
| `end-collapsible`   | 结束侧折叠按钮内容         |

### SplitterPanel 实例属性

| 名称               | 说明                 |
| ------------------ | -------------------- |
| `splitterPanelRef` | 面板根元素           |
