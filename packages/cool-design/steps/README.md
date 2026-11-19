# Steps 步骤条

## 组件介绍

Steps 展示任务流程和当前步骤，支持水平/垂直、居中、简单模式与状态覆盖。支持 `Step` 子组件与默认插槽，同时兼容旧版 `items` 数据驱动用法。

## 基础用法

```vue
<Steps :active="1">
  <Step title="填写信息" description="完善基础资料" />
  <Step title="确认订单" />
  <Step title="完成" />
</Steps>
```

方向：`horizontal` / `vertical`。状态：`wait` / `process` / `finish` / `error` / `success`，单步 `status` 优先于自动计算。

## 数据驱动（兼容）

```vue
<Steps :active="1" :items="[{ title: '填写信息' }, { title: '确认订单' }, { title: '完成' }]" />
```

点击步骤会触发 `change`，由外部更新 `active`。

## API

### Steps 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `active` | 当前步骤索引 | `number` | `0` |
| `items` | 数据驱动步骤（兼容） | `StepItemOption[]` | `[]` |
| `direction` | 方向 | `horizontal` / `vertical` | `horizontal` |
| `finish-status` | 已完成步骤状态 | `StepStatus` | `finish` |
| `process-status` | 进行中步骤状态 | `StepStatus` | `process` |
| `align-center` | 标题与描述是否居中 | `boolean` | `false` |
| `simple` | 是否为简单模式（仅标题） | `boolean` | `false` |
| `space` | 每步间距（宽/高） | `string \| number` | — |

### Steps 事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `change` | 点击步骤 | `index: number` |

### Steps 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | `Step` 子组件列表 |
| `title-序号` | `items` 模式自定义标题（兼容） |

### Step 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `title` | 标题 | `string` | `''` |
| `description` | 描述 | `string` | `''` |
| `icon` | 图标，字符串按图标类名经 Icon 渲染 | `string \| Component` | `''` |
| `status` | 显式状态（覆盖自动计算） | `StepStatus` | `''` |

### Step 插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `icon` | 自定义图标 |
| `title` | 自定义标题 |
| `description` | 自定义描述 |
