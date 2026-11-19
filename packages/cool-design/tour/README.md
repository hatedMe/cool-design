# Tour 漫游式引导

### 介绍

分步骤聚焦页面元素的引导组件，常用于新功能介绍、上手引导。

## 基础用法

`steps` 定义每一步聚焦的 `target`（CSS 选择器、元素或返回元素的函数）与文案；`v-model` 控制开启，`v-model:current` 控制当前步。

```vue
<Tour v-model="open" v-model:current="current" :steps="steps" />
```

步骤 `placement` 支持 `center` / `top` / `bottom` / `left` / `right`（含 `-start` / `-end`）；`mask` 可关闭遮罩或传 `{ color, style }` 自定义；最后一步点击"完成"触发 `finish` 并关闭。

## API

### Tour 属性

| 参数                  | 说明                                       | 类型                                   | 默认值   |
| --------------------- | ------------------------------------------ | -------------------------------------- | -------- |
| `modelValue`          | 是否显示引导（`v-model`）                  | `boolean`                              | `false`  |
| `current`             | 当前步索引（`v-model:current`）            | `number`                               | `0`      |
| `steps`               | 步骤配置列表                               | `TourStep[]`                           | `[]`     |
| `mask`                | 遮罩，`false` 关闭或 `{ color, style }` 自定义 | `boolean` / `object`               | `true`   |
| `type`                | 样式类型：`default` / `primary`            | `string`                               | `default` |
| `arrow`               | 是否显示指向箭头                           | `boolean`                              | `true`   |
| `placement`           | 默认弹层位置（步骤可覆盖）                 | `TourPlacement`                        | `bottom` |
| `showClose`           | 是否显示关闭按钮                           | `boolean`                              | `true`   |
| `closeIcon`           | 自定义关闭图标                             | `string` / `Component`                 | —        |
| `nextButtonText`      | 下一步按钮文案（末步默认"完成"）           | `string`                               | —        |
| `prevButtonText`      | 上一步按钮文案                             | `string`                               | —        |
| `zIndex`              | 层级                                       | `number`                               | `2000`   |
| `gap`                 | 聚光框与目标四周的留白，单位 px            | `number`                               | `10`     |
| `scrollIntoViewOptions` | 步骤切换时滚动目标到视口的选项           | `boolean` / `ScrollIntoViewOptions`    | —        |
| `target`              | 覆盖所有步骤的目标                         | `TourTarget`                           | —        |

### TourStep 步骤

| 字段                  | 说明                                       | 类型                                   |
| --------------------- | ------------------------------------------ | -------------------------------------- |
| `target`              | 聚焦目标（选择器 / 元素 / 返回元素的函数） | `TourTarget`                           |
| `title`               | 标题                                       | `string`                               |
| `description`         | 描述                                       | `string`                               |
| `placement`           | 弹层位置（含 `center`）                    | `TourPlacement`                        |
| `mask` / `arrow` / `showClose` | 覆盖 Tour 级同名配置            | `boolean` / `object`                   |
| `nextButtonText` / `prevButtonText` | 覆盖按钮文案            | `string`                               |
| `scrollIntoViewOptions` | 覆盖滚动选项                             | `boolean` / `ScrollIntoViewOptions`    |

### Tour 事件

| 事件名              | 说明                     | 回调参数            |
| ------------------- | ------------------------ | ------------------- |
| `update:modelValue` | 引导开关变化             | `visible: boolean`  |
| `update:current`    | 当前步变化               | `index: number`     |
| `change`            | 当前步变化               | `index: number`     |
| `prev` / `next`     | 点击上一步 / 下一步      | `index: number`     |
| `finish`            | 点击最后一步完成         | —                   |
| `close`             | 关闭引导                 | `index: number`     |

### 实例方法

| 方法           | 说明                   |
| -------------- | ---------------------- |
| `go(index)`    | 跳转到指定步骤         |
| `prev()`       | 上一步                 |
| `next()`       | 下一步（末步为完成）   |

### Tour 插槽

| 名称        | 说明                                       | 作用域                          |
| ----------- | ------------------------------------------ | ------------------------------- |
| `default`   | 自定义面板内容，替代标题与描述             | `{ current: number }`           |
| `indicator` | 自定义底部指示器，位于按钮左侧             | `{ current: number, total: number }` |
| `close`     | 自定义关闭按钮内容                         | `{ current: number }`           |
| `prev-btn`  | 自定义上一步按钮内容（首步不渲染该按钮）   | `{ current: number }`           |
| `next-btn`  | 自定义下一步按钮内容                       | `{ current: number }`           |
