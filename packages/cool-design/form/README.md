# Form 表单

### 介绍

组织桌面表单字段，管理必填与异步校验，并提供重置和清除校验能力。

## 典型表单

Form 与 FormItem 组合 Input、Select、Checkbox、Switch 等控件，使用 `model` 收集值，使用 `rules` 校验字段。

## 行内表单与对齐

开启 `inline` 后，表单项会在可用空间内并排，空间不足时自动换行。`labelPosition` 支持 `left` / `right` / `top`，`labelWidth` 控制标签宽度（数字按 `px` 处理），`labelSuffix` 追加到每个字段标签之后。`size` 和 `disabled` 可统一影响内部控件。

## 表单校验

规则由 `async-validator` 执行，支持必填、类型、长度、正则、自定义校验，以及 `blur` 和 `change` 触发。校验失败时自动聚焦第一个错误字段。

## API

### 属性

| 参数            | 说明                                                       | 类型                            | 默认值 |
| --------------- | ---------------------------------------------------------- | ------------------------------- | ------ |
| `model`         | 表单模型，必填，支持 `user.name`、`items[0].name` 深层路径 | `Record<string, unknown>`       | —      |
| `rules`         | 字段校验规则                                               | `Record<string, FormRule[]>`    | `{}`   |
| `inline`        | 是否使用行内布局                                           | `boolean`                       | `false` |
| `label-position` | 标签位置：`left` / `right` / `top`                         | `string`                        | `right` |
| `label-width`    | 标签宽度，数字按 `px` 处理                                 | `string \| number`              | —      |
| `label-suffix`   | 标签后的后缀                                               | `string`                        | —      |
| `disabled`      | 是否禁用内部字段                                           | `boolean`                       | `false` |
| `size`          | 内部控件尺寸                                               | `string`                        | —      |
| `show-message`   | 是否显示校验消息                                           | `boolean`                       | `true`  |
| `hide-required-asterisk` | 是否隐藏必填星号                                   | `boolean`                       | `false` |
| `require-asterisk-position` | 必填星号位置：`left` / `right`               | `string`                        | `left`  |
| `inline-message` | 是否以行内样式显示校验消息                                 | `boolean`                       | `false` |
| `status-icon`    | 是否在字段后显示校验状态图标                               | `boolean`                       | `false` |
| `scroll-to-error` | 校验失败时滚动到第一个错误字段                             | `boolean`                       | `false` |
| `scroll-to-error-offset` | 滚动到错误字段时的顶部偏移量                         | `number`                        | —      |
| `scroll-into-view-options` | 滚动参数 | `boolean \| ScrollIntoViewOptions` | `true` |
| `validate-on-rule-change` | `rules` 变化后是否立即触发一次校验                 | `boolean`                       | `true`  |

### 事件

| 事件名     | 说明                         | 回调参数                              |
| ---------- | ---------------------------- | ------------------------------------- |
| `submit`   | 已阻止原生提交，页面负责调用 validate | `event: Event`                  |
| `validate` | 任一字段校验完成后触发，`prop` 为 FormItem 传入的路径 | `prop: string \| string[], isValid: boolean, message?: string` |

### 插槽

| 名称      | 说明                  |
| --------- | --------------------- |
| `default` | FormItem 字段和操作区 |

### 实例方法

| 方法                    | 说明                                 | 返回值             |
| ----------------------- | ------------------------------------ | ------------------ |
| `validate(callback?)`   | 校验全部字段，通过时 resolve `true`。失败时 reject 并携带 `invalidFields`（`prop → 错误对象数组`），同路径错误按字段登记顺序合并，并聚焦首个无效字段。校验期间模型或字段登记变化时，以空映射拒绝 | `Promise<boolean>` |
| `resetFields(props?)`   | 恢复指定字段的初值                   | `void`             |
| `clearValidate(props?)` | 清除指定字段的错误并使旧异步结果失效           | `void`             |
| `validateField(props?, callback?)` | 校验指定字段                         | `Promise<boolean>` |
| `scrollToField(props?)` | 滚动到指定字段。省略参数时滚动到第一个字段，传入空数组时不滚动   | `void`             |
| `getField(prop)` | 获取路径匹配的首个字段 | `FormFieldContext \| undefined` |
| `setInitialValues(model)` | 更新已有字段的重置初值 | `void` |

### 实例属性

| 名称    | 说明                                             | 类型                  |
| ------- | ------------------------------------------------ | --------------------- |
| `fields` | 已注册字段上下文（`prop` / `validate` / `resetField` / `clearValidate` / `scrollTo` / `focus` / `error` / `validateState` / `validateMessage` / `setInitialValue`） | `FormFieldContext[]` |

### FormRule 校验规则

| 字段              | 说明                                        | 类型                                       |
| ----------------- | ------------------------------------------- | ------------------------------------------ |
| `required`        | 必填，空白字符串也视为空；0、false 有效     | `boolean`                                  |
| `message`         | 必填失败提示                                | `string`                                   |
| `trigger`         | 支持 `blur`、`change` 或同时监听两者，省略时响应所有校验 | `string \| string[]`                    |
| `validator`       | 自定义校验，接收 `rule`、`value`、`callback`，兼容旧版 `validator(value)` | `FormRule['validator']`   |
| `asyncValidator`  | 异步校验，接收 `rule`、`value`、`callback` | `FormRule['asyncValidator']`              |
| `type`            | async-validator 类型                        | `string`                                   |
| `min` / `max` / `len` | 长度或数值范围                          | `number`                                   |
| `pattern`         | 正则校验                                    | `RegExp`                                   |
| `whitespace`      | 必填字符串是否拒绝空白                      | `boolean`                                  |
| `transform`       | 校验前转换值                                | `(value: unknown) => unknown`              |

`FormRule`、`FormInstance` 可从 `cool-design` 导入。自定义校验可以调用 `callback()` 或兑现 `Promise` 来标记成功，调用 `callback(new Error('错误信息'))`、抛出 `Error` 或拒绝 `Promise` 来标记失败。每条规则以最先完成的结果为准，同一字段按规则顺序校验并在首次失败时结束。单参数 `validator(value)` 直接接收字段值，可同步返回或返回 `Promise`。

## 使用说明

`model` 为必填的响应式对象，`rules` 以字段路径作为键。`prop` 支持 `user.name`、`items[0].name` 和 `['items', '0', 'name']`。括号路径与数组路径在 `fields` 和错误映射中使用点分隔键，例如 `items.0.name`。

模型属性名含点号时，可以用 `['contact.email']` 保留该名称，且其重置初值与 `['contact', 'email']` 分别保存。重置已卸载的字面点号字段时，可传入 `resetFields([['contact.email']])`。

```ts
import type { FormRule } from 'cool-design';

const rules: Record<string, FormRule[]> = {
  'items.0.name': [
    { required: true, message: '请输入姓名', trigger: ['blur', 'change'] },
    {
      validator(_rule, value, callback) {
        callback(value === '管理员' ? new Error('请使用个人姓名') : undefined);
      },
      trigger: 'blur'
    }
  ]
};
```

必填检查 null、undefined、空白字符串和空数组；false、0 有效。校验错误消息取规则或 async-validator 返回的 message。

模板 ref 可标注 `FormInstance`。`validate` 和 `validateField` 成功时回调接收 `true`，Promise 兑现为 `true`。失败时，有回调则按 `(false, invalidFields)` 调用并兑现为 `false`，省略回调时 Promise 拒绝并传出错误映射。每个错误包含 `message`、`field` 和 `fieldValue`。`validateField`、`resetFields` 和 `clearValidate` 的字段列表支持 `["user.name", "age"]`，单个数组路径写作 `[["user", "name"]]`。省略字段参数时处理全部字段。`getField` 接收一个路径，可直接传入 `["user", "name"]`。

`submit` 事件已阻止原生提交。校验通过后页面可调用提交接口。`setInitialValues` 更新重置快照，表单当前值由页面管理。快照会复制普通对象和数组、类实例的可枚举自有属性，以及日期、正则、集合和类型化数组等常见内建值。函数保留原引用。其他特殊内建对象由运行环境的结构化克隆处理，无法克隆时保留原引用。类的私有字段不属于可复制的自有属性。

`scrollToField(["items", "0", "name"])` 优先查找完整路径 `items.0.name`。如果没有匹配项，则按原字段列表的顺序查找并滚动到首个匹配字段。
