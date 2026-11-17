# FormItem 字段

### 介绍

为表单控件关联字段、标签、校验规则和错误提示。

## API

### 属性

| 参数            | 说明                                                       | 类型                            | 默认值 |
| --------------- | ---------------------------------------------------------- | ------------------------------- | ------ |
| `prop`          | 字段名称，在同一表单中唯一，支持 `a.b[0].c` 深层路径；省略时仅做布局不参与校验 | `string`                        | —      |
| `label`         | 字段标签，显示 Form 的 `labelSuffix` 后缀                  | `string`                        | —      |
| `rules`         | 单项校验规则，优先于 Form 的同名字段规则                   | `FormRule \| FormRule[]`        | —      |
| `error`         | 手动指定错误信息，优先于校验结果                           | `string`                        | —      |
| `required`      | 是否显示必填星号（不自动添加校验规则）                     | `boolean`                       | `false` |
| `labelPosition` | 覆盖 Form 的标签位置：`left` / `right` / `top`             | `string`                        | —      |
| `labelWidth`    | 覆盖 Form 的标签宽度，数字按 `px` 处理                     | `string \| number`              | —      |
| `showMessage`   | 是否显示校验错误信息                                       | `boolean`                       | `true`  |
| `inlineMessage` | 覆盖 Form 的行内错误样式                                   | `boolean`                       | `false` |
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

## 使用说明

在 Form 中使用，默认插槽放一个输入控件。自动关联标签、ID、aria-invalid、错误描述及规则，错误使用 alert 角色。

prop 在实例生命周期内保持不变；切换编辑记录为 Form 设置新 key。注销、清除错误后，旧异步结果不覆盖当前状态。
