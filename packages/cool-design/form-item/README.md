# FormItem 字段

### 介绍

为表单控件关联字段、标签、校验规则和错误提示。

## API

### 属性

| 参数            | 说明                                                       | 类型                            | 默认值 |
| --------------- | ---------------------------------------------------------- | ------------------------------- | ------ |
| `prop`          | 字段路径，支持 `a.b[0].c` 或 `['a', 'b', '0', 'c']`，省略时仅用于布局 | `string \| string[]`            | —      |
| `for` | 显式关联的原生控件 ID | `string` | — |
| `label`         | 字段标签，显示 Form 的 `labelSuffix` 后缀                  | `string`                        | —      |
| `rules`         | 单项校验规则，优先于 Form 的同名字段规则                   | `FormRule \| FormRule[]`        | —      |
| `validate-status` | 校验状态，可选 `''` / `validating` / `success` / `error` | `FormValidateState` | `''` |
| `error`         | 手动指定错误信息，优先于校验结果                           | `string`                        | —      |
| `required`      | 是否显示必填星号（不自动添加校验规则）                     | `boolean`                       | `false` |
| `label-position` | 覆盖 Form 的标签位置：`left` / `right` / `top`             | `string`                        | —      |
| `label-width`    | 覆盖 Form 的标签宽度，数字按 `px` 处理                     | `string \| number`              | —      |
| `show-message`   | 是否显示校验错误信息                                       | `boolean`                       | `true`  |
| `inline-message` | 覆盖 Form 的行内错误样式                                   | `boolean`                       | `false` |
| `size`          | 覆盖 Form 的控件尺寸                                       | `string`                        | —      |

### 插槽

| 名称      | 说明                                       |
| --------- | ------------------------------------------ |
| `default` | 一个表单输入控件                           |
| `label`   | 自定义标签内容                             |
| `error`   | 自定义错误内容，作用域参数 `{ error }`     |

### 实例方法

| 方法                          | 说明                                       |
| ----------------------------- | ------------------------------------------ |
| `validate(trigger?)`          | 校验本字段，`trigger` 可选 `blur` / `change` |
| `resetField()`                | 恢复字段初值并清除错误                     |
| `clearValidate()`             | 清除错误并使旧异步结果失效                 |
| `setInitialValue(value)` | 更新字段的重置初值 |

实例属性 `validateState` 和 `validateMessage` 分别提供当前校验状态和消息，类型为 `FormValidateState` 和 `string`。

## 使用说明

在 Form 中使用，默认插槽放表单控件。单个受支持控件在挂载后注册其 ID，FormItem 自动生成带 `for` 的原生标签。在服务端渲染或未提供单一入口的复合控件中，有标签的字段使用 `role="group"` 提供组名称，组内选项仍使用各自的标签。

需要在 SSR 首屏就有可点击的原生标签时，设置 `for`，其值与目标控件原生输入元素的 `id` 一致。

```vue
<FormItem label="年龄" prop="age" for="profile-age">
  <InputNumber id="profile-age" v-model="model.age" />
</FormItem>
```

控件显式传入的 ARIA 属性优先。错误消息显示时，支持该关联的控件通过 `aria-describedby` 引用消息，消息使用 `role="alert"`。

动态增删数组行时，可按行的稳定 ID 设置组件 `key`，并用当前索引生成 `prop`。字段路径变化时，当前值成为重置初值，旧路径的异步校验结果失效。

### 事件

无自定义事件。
