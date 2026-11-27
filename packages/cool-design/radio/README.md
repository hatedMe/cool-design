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
| model-value | 当前选中值                                 | `string` / `number` / `boolean`        | —      |
| value      | 当前选项值，未传时使用 `label`             | `string` / `number` / `boolean`        | —      |
| label      | 兼容选项值                                 | `string` / `number` / `boolean`        | —      |
| disabled   | 禁用选项                                   | `boolean`                              | `false` |
| name       | 原生单选组名称                             | `string`                               | —      |
| border     | 显示边框                                   | `boolean`                              | `false` |
| size       | 尺寸：`small` / `default` / `large`        | `string`                               | —      |

### Radio 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `update:modelValue` | 独立使用时更新选中值 | `value: string \| number \| boolean` |
| `change` | 独立使用时选中值变化 | `value: string \| number \| boolean` |

在 RadioGroup 内由 RadioGroup 更新绑定值并发出对应事件。

### Radio 插槽

| 名称     | 说明       |
| -------- | ---------- |
| default  | 勾选标签   |

### RadioGroup 属性

| 参数         | 说明                                   | 类型                                   | 默认值     |
| ------------ | -------------------------------------- | -------------------------------------- | ---------- |
| model-value   | 当前选中值                             | `string` / `number` / `boolean`        | —          |
| name         | 统一的原生名称                         | `string`                               | —          |
| disabled     | 禁用整个组                             | `boolean`                              | `false`    |
| size         | 尺寸：`small` / `default` / `large`    | `string`                               | 继承全局尺寸 |
| fill         | 选中按钮背景色（仅按钮形态生效）       | `string`                               | —          |
| text-color   | 选中按钮文字色（仅按钮形态生效）       | `string`                               | —          |
| validateEvent | 值变化时触发表单校验                  | `boolean`                              | `true`     |
| options | 选项数据 | `Record<string, unknown>[]` | — |
| props | 选项字段映射 | `{ value?: string; label?: string; disabled?: string }` | — |
| type | 选项组件 | `'radio'` / `'button'` | `'radio'` |

### RadioGroup 事件

| 事件名            | 说明           | 回调参数 |
| ----------------- | -------------- | -------- |
| update:modelValue | 选中值变化     | `value`  |
| change            | 选中值变化     | `value`  |

### RadioGroup 键盘交互

选中项（未选中时第一个可用项）是 Tab 停靠点；方向键在可用选项间移动选中并聚焦，自动跳过禁用项。

尺寸优先使用组件及分组的显式设置，再读取最近的 FormItem、Form 或 ConfigProvider。Form 禁用时，选项也会禁用。

RadioGroup 的 `options` 接收选项数组，默认读取 `value`、`label` 和 `disabled`。通过 `props` 将三个字段映射到自定义键，设置 `type="button"` 可使用 RadioButton。默认插槽优先于 `options`。
