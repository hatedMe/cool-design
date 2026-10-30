# Radio 单选框

Radio 用于在互斥选项中选择一个值；RadioGroup 用于管理同一组的值。

- `v-model`：`string | number | boolean`，与 `value` 严格相等时选中。
- `value`：选项值，默认 true。
- `disabled`：禁用，默认 false。
- `name`：原生单选组名称。
- `border`：显示带边框样式。
- 选中时触发 `update:modelValue`、`change`，参数为选项值；支持 FormItem 的 change 校验。
- 默认插槽为标签文字；原生输入属性（例如 name）透传至 input。

多个独立 Radio 可共用一个 v-model 和 name；也可以使用 `RadioGroup` 的 `v-model`、`name` 和 `disabled` 统一管理。

## API

### Radio 属性

| 参数       | 说明           | 类型                      | 默认值 |
| ---------- | -------------- | ------------------------- | ------ |
| modelValue | 当前选中值     | string / number / boolean | —      |
| value      | 当前选项值；未传时使用 label | string / number / boolean | —      |
| label      | Element Plus 兼容选项值     | string / number / boolean | —      |
| disabled   | 禁用选项                    | boolean                   | false  |
| name       | 原生单选组名称              | string                    | —      |
| border     | 显示边框                    | boolean                   | false  |
| size       | 尺寸                        | small / default / large  | —      |

### RadioGroup 属性

| 参数       | 说明           | 类型                      | 默认值 |
| ---------- | -------------- | ------------------------- | ------ |
| modelValue | 当前选中值     | string / number / boolean | —      |
| name       | 统一的原生名称 | string                    | —      |
| disabled   | 禁用整个组     | boolean                   | false  |

### 事件

`update:modelValue` 和 `change` 的参数都是当前选项值。
