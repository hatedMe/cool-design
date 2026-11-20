# Radio 单选框

### 介绍

Radio 用于在互斥选项中选择一个值；RadioGroup 用于管理同一组的值，并采用手动 roving tabindex 键盘导航（不依赖原生 `name` 分组）。

## 用法

```vue
<RadioGroup v-model="value" name="kind">
  <Radio value="a">选项 A</Radio>
  <Radio value="b">选项 B</Radio>
</RadioGroup>
```

独立使用的 Radio 可直接绑定 `v-model`；`value` 未传时使用 `label` 作为选项值。原生输入属性（例如 `name`）透传至 input。

## API

### Radio 属性

| 参数       | 说明                                       | 类型                                   | 默认值 |
| ---------- | ------------------------------------------ | -------------------------------------- | ------ |
| modelValue | 当前选中值                                 | `string` / `number` / `boolean`        | —      |
| value      | 当前选项值，未传时使用 `label`             | `string` / `number` / `boolean`        | —      |
| label      | 兼容选项值                                 | `string` / `number` / `boolean`        | —      |
| disabled   | 禁用选项                                   | `boolean`                              | `false` |
| name       | 原生单选组名称                             | `string`                               | —      |
| border     | 显示边框                                   | `boolean`                              | `false` |
| size       | 尺寸：`small` / `default` / `large`        | `string`                               | —      |

### Radio 插槽

| 名称     | 说明       |
| -------- | ---------- |
| default  | 勾选标签   |

### RadioGroup 属性

| 参数         | 说明                                   | 类型                                   | 默认值     |
| ------------ | -------------------------------------- | -------------------------------------- | ---------- |
| modelValue   | 当前选中值                             | `string` / `number` / `boolean`        | —          |
| name         | 统一的原生名称                         | `string`                               | —          |
| disabled     | 禁用整个组                             | `boolean`                              | `false`    |
| size         | 尺寸：`small` / `default` / `large`    | `string`                               | 继承全局尺寸 |
| fill         | 选中按钮背景色（仅按钮形态生效）       | `string`                               | —          |
| text-color   | 选中按钮文字色（仅按钮形态生效）       | `string`                               | —          |
| validateEvent | 值变化时触发表单校验                  | `boolean`                              | `true`     |

### RadioGroup 事件

| 事件名            | 说明           | 回调参数 |
| ----------------- | -------------- | -------- |
| update:modelValue | 选中值变化     | `value`  |
| change            | 选中值变化     | `value`  |

### RadioGroup 键盘交互

选中项（未选中时第一个可用项）是 Tab 停靠点；方向键在可用选项间移动选中并聚焦，自动跳过禁用项。

尺寸优先使用组件及分组的显式设置，再读取最近的 FormItem、Form 或 ConfigProvider。Form 禁用时，选项也会禁用。
