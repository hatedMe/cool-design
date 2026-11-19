# RadioGroup 单选组

RadioGroup 管理一组 Radio 的受控值、原生名称和整体禁用状态。组内使用手动 roving tabindex 键盘导航：选中项（未选中时第一个可用项）是 Tab 停靠点，方向键在可用选项间移动选中并聚焦，跳过禁用项，不依赖原生 `name` 分组。

## API

### 属性

| 参数       | 说明           | 类型                      | 默认值 |
| ---------- | -------------- | ------------------------- | ------ |
| modelValue | 当前选中值     | `string` / `number` / `boolean` | —      |
| name       | 统一的原生名称 | `string`                   | —      |
| disabled   | 禁用整个组     | `boolean`                  | `false` |
| size       | 统一尺寸       | `small` / `default` / `large` | —  |
| fill       | 选中按钮背景色（仅按钮形态生效） | `string` | — |
| text-color | 选中按钮文字色（仅按钮形态生效） | `string` | — |
| validateEvent | 值变化时触发表单校验 | `boolean` | `true` |

### 事件

| 事件名            | 说明             |
| ----------------- | ---------------- |
| update:modelValue | 选项变化时更新值 |
| change            | 选项变化时触发   |
