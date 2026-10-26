# Radio 单选框

源码已修复，尚未加入首版公开入口。

- `v-model`：`string | number | boolean`，与 `value` 严格相等时选中。
- `value`：选项值，默认 true。
- `disabled`：禁用，默认 false。
- 选中时触发 `update:modelValue`、`change`，参数为选项值；支持 FormItem 的 change 校验。
- 默认插槽为标签文字；原生输入属性（例如 name）透传至 input。

多个独立 Radio 可共用一个 v-model 和 name。旧 RadioGroup、RadioButton 尚未迁移，不能直接配套使用。
