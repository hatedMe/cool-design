# Form 表单

### 介绍

组织桌面表单字段，管理必填与异步校验，并提供重置和清除校验能力。

## 典型表单

Form 与 FormItem 组合 Input、Select、Checkbox、Switch 等控件，使用 `model` 收集值，使用 `rules` 校验字段。

## 行内表单与对齐

通过 `inline` 使用紧凑布局；`labelPosition` 支持 `left`、`right`、`top`，`labelWidth` 控制标签宽度。`size` 和 `disabled` 可统一影响内部控件。

## 表单校验

规则由 `async-validator` 执行，支持必填、类型、长度、正则、blur/change 触发和同步/异步 validator；校验失败时自动聚焦第一个错误字段。

## API

### 属性

| 参数          | 说明                           | 类型                       | 默认值 |
| ------------- | ------------------------------ | -------------------------- | ------ |
| model         | 表单模型，必填，仅支持平面字段 | Record<string, unknown>    | —      |
| rules         | 字段校验规则                   | Record<string, FormRule[]> | {}     |
| inline        | 是否使用行内布局               | boolean                    | false  |
| labelPosition | 标签位置：left / right / top   | string                     | right  |
| labelWidth    | 标签宽度                       | string / number            | —      |
| labelSuffix   | 标签后的后缀                   | string                     | —      |
| disabled      | 是否禁用内部字段               | boolean                    | false  |
| size          | 内部控件尺寸                   | string                     | —      |
| showMessage   | 是否显示校验消息               | boolean                    | true   |

### 事件

| 事件名 | 说明                                  | 回调参数     |
| ------ | ------------------------------------- | ------------ |
| submit | 已阻止原生提交，页面负责调用 validate | event: Event |

### 插槽

| 名称    | 说明                  |
| ------- | --------------------- |
| default | FormItem 字段和操作区 |

### 实例方法

| 方法                  | 说明                                 | 返回值           |
| --------------------- | ------------------------------------ | ---------------- |
| validate()            | 校验全部字段，失败时聚焦首个无效字段 | Promise<boolean> |
| resetFields()         | 恢复字段注册时初值                   | void             |
| clearValidate()       | 清除错误并使旧异步结果失效           | void             |
| validateField(props?) | 校验指定字段                         | Promise<boolean> |

### FormRule 校验规则

| 字段            | 说明                                        | 类型                                     |
| --------------- | ------------------------------------------- | ---------------------------------------- |
| required        | 必填，空白字符串也视为空；0、false 有效     | boolean                                  |
| message         | 必填失败提示                                | string                                   |
| trigger         | blur / change；省略时两者均可触发           | string                                   |
| validator       | 自定义校验，失败时抛出 Error 或拒绝 Promise | (value: unknown) => void / Promise<void> |
| type            | async-validator 类型                        | string                                   |
| min / max / len | 长度或数值范围                              | number                                   |
| pattern         | 正则校验                                    | RegExp                                   |
| whitespace      | 必填字符串是否拒绝空白                      | boolean                                  |
| transform       | 校验前转换值                                | (value: unknown) => unknown              |

`FormRule`、`FormInstance` 可从 `cool-design` 导入。自定义 validator 抛出 Error 或返回 rejected Promise 表示失败；异步期间模型发生变化，整体 validate 返回 false。

## 使用说明

属性 model: Record<string, unknown>（必填，响应式对象）、rules: Record<string, FormRule[]>（默认空对象）。`prop` 支持 `user.name` 和 `items[0].name` 点路径，校验由 async-validator 执行。

```ts
interface FormRule {
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
  len?: number;
  pattern?: RegExp;
  whitespace?: boolean;
  transform?: (value: unknown) => unknown;
  message?: string;
  trigger?: 'blur' | 'change';
  validator?: (value: unknown) => void | Promise<void>;
}
```

必填检查 null、undefined、空白字符串和空数组；false、0 有效。校验错误消息取规则或 async-validator 返回的 message。

模板 ref 可标注 FormInstance：validate(): Promise<boolean> 校验全部字段，失败聚焦首个无效字段；resetFields() 恢复注册时初值；clearValidate() 清除错误并使旧异步校验失效。校验期间模型变化使整体校验返回 false，需要重新提交。

submit(event) 已阻止原生提交；页面在 validate=true 后调用接口。默认插槽放 FormItem。每次编辑重挂载表单，以本次记录为初值。首版草稿为平面标量字段，复杂对象的独立草稿和初始快照由页面管理。
