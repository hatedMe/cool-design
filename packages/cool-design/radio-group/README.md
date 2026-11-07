# RadioGroup 单选组

RadioGroup 管理一组 Radio 的受控值、原生名称和整体禁用状态。

## API

### 属性

| 参数       | 说明           | 类型                      | 默认值 |
| ---------- | -------------- | ------------------------- | ------ |
| modelValue | 当前选中值     | string / number / boolean | —      |
| name       | 统一的原生名称 | string                    | —      |
| disabled   | 禁用整个组     | boolean                   | false  |
| size       | 统一尺寸       | small / default / large  | —      |

### 事件

| 事件名            | 说明             |
| ----------------- | ---------------- |
| update:modelValue | 选项变化时更新值 |
| change            | 选项变化时触发   |
