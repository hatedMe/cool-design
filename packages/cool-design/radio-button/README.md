# RadioButton 单选按钮

RadioButton 是 Radio 的按钮样式变体，支持独立受控使用，也可以放在 RadioGroup 中共享选中值。

## 用法

```vue
<RadioGroup v-model="value">
  <RadioButton value="a">选项 A</RadioButton>
  <RadioButton value="b">选项 B</RadioButton>
</RadioGroup>
```

## API

| 参数       | 说明                 | 类型                      | 默认值 |
| ---------- | -------------------- | ------------------------- | ------ |
| modelValue | 当前选中值           | string / number / boolean | —      |
| value      | 当前选项值           | string / number / boolean | —      |
| label      | value 未传时的兼容值 | string / number / boolean | —      |
| disabled   | 是否禁用             | boolean                   | false  |
| name       | 原生单选组名称       | string                    | —      |
| size       | 按钮尺寸             | small / default / large   | —      |

### 插槽

| 名称    | 说明     |
| ------- | -------- |
| default | 按钮文本 |

### 事件

- `update:modelValue`：独立使用时选项变化。
- `change`：独立使用或所在 RadioGroup 变化时触发。
