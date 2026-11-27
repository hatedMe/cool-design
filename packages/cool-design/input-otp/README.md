# InputOtp 验证码输入

### 介绍

分格输入一次性验证码（OTP），支持自定义长度、校验规则、分隔符与遮蔽显示。

## 基础用法

`v-model` 绑定验证码字符串（不含前导零问题时也可用数字初始化）；逐格输入自动前进，退格清除/回退，粘贴自动分发。

```vue
<InputOtp v-model="otp" :length="6" />
```

`validator` 限制单字符（如仅数字）；`separator` 传字符串 / VNode / `(index) => ...` 或使用 `separator` 插槽；`mask` 密码遮蔽；`type` 支持 `outlined` / `filled` / `underlined`；`size` 三档尺寸；填满触发 `finish`，失焦且有变化触发 `change`。

## API

### 属性

| 参数            | 说明                                       | 类型                              | 默认值    |
| --------------- | ------------------------------------------ | --------------------------------- | --------- |
| `model-value`    | 验证码值（`v-model`）                      | `string` / `number`               | —         |
| `length`        | 输入格数                                   | `number`                          | `6`       |
| `validator`     | 单字符校验函数                             | `(value: string) => boolean`      | `() => true` |
| `inputmode`     | 原生 inputmode（如 `numeric`）             | `string`                          | —         |
| `type`          | 样式：`outlined` / `filled` / `underlined` | `string`                          | `outlined` |
| `size`          | 尺寸：`small` / `default` / `large`        | `string`                          | 继承 FormItem、Form 或 ConfigProvider |
| `mask`          | 密码遮蔽显示                               | `boolean`                         | `false`   |
| `disabled`      | 禁用                                       | `boolean`                         | `false`   |
| `readonly`      | 只读                                       | `boolean`                         | `false`   |
| `separator`     | 格间分隔（字符串 / VNode / 函数）          | `string` / `VNode` / `Function`   | —         |
| `validate-event` | 值变化时触发表单校验                       | `boolean`                         | `true`    |
| `id` / `aria-label` | 原生属性                                | `string`                          | —         |

### 事件

| 事件名              | 说明                     | 回调参数           |
| ------------------- | ------------------------ | ------------------ |
| `update:modelValue` | 值变化                   | `value: string`    |
| `change`            | 失焦且值有变化           | `value: string`    |
| `finish` | 形成新的完整验证码 | `value: string` |
| `focus` / `blur`    | 聚焦 / 失焦              | `event: FocusEvent` |

### 插槽

| 名称        | 说明               |
| ----------- | ------------------ |
| `separator` | 自定义分隔内容     |

### 实例方法

| 名称        | 说明                       |
| ----------- | -------------------------- |
| `inputRefs` | 所有输入格元素数组         |
| `focus()`   | 聚焦第一个空格（或首格）   |
| `blur()`    | 取消所有聚焦               |

`finish(value)` 返回新完成的验证码（`string`）。编辑已完整的验证码并形成另一个完整值时会再次触发。格间移动不会触发整个组件的 `focus` 或 `blur`。
