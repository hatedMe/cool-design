# Form 表单

### 介绍

组织桌面表单字段，管理必填与异步校验，并提供重置和清除校验能力。

## API

### 属性

| 参数  | 说明                           | 类型                       | 默认值 |
| ----- | ------------------------------ | -------------------------- | ------ |
| model | 表单模型，必填，仅支持平面字段 | Record<string, unknown>    | —      |
| rules | 字段校验规则                   | Record<string, FormRule[]> | {}     |

### 事件

| 事件名 | 说明                                  | 回调参数     |
| ------ | ------------------------------------- | ------------ |
| submit | 已阻止原生提交，页面负责调用 validate | event: Event |

### 插槽

| 名称    | 说明                  |
| ------- | --------------------- |
| default | FormItem 字段和操作区 |

### 实例方法

| 方法            | 说明                                 | 返回值           |
| --------------- | ------------------------------------ | ---------------- |
| validate()      | 校验全部字段，失败时聚焦首个无效字段 | Promise<boolean> |
| resetFields()   | 恢复字段注册时初值                   | void             |
| clearValidate() | 清除错误并使旧异步结果失效           | void             |

### FormRule 校验规则

| 字段      | 说明                                        | 类型                                     |
| --------- | ------------------------------------------- | ---------------------------------------- |
| required  | 必填，空白字符串也视为空；0、false 有效     | boolean                                  |
| message   | 必填失败提示                                | string                                   |
| trigger   | blur / change；省略时两者均可触发           | string                                   |
| validator | 自定义校验，失败时抛出 Error 或拒绝 Promise | (value: unknown) => void / Promise<void> |

`FormRule`、`FormInstance` 可从 `cool-design` 导入。返回 false 不表示自定义校验失败；异步期间模型发生变化，整体 validate 返回 false。

## 使用说明

属性 model: Record<string, unknown>（必填，响应式对象）、rules: Record<string, FormRule[]>（默认空对象）。字段为平面键名，不支持点路径。

```ts
interface FormRule {
    required?: boolean;
    message?: string;
    trigger?: "blur" | "change";
    validator?: (value: unknown) => void | Promise<void>;
}
```

必填检查 null、undefined、空白字符串和空数组；false、0 有效。自定义失败通过抛出 Error 或拒绝 Promise 表达，错误消息取 Error.message，不通过返回 false 表达失败。

模板 ref 可标注 FormInstance：validate(): Promise<boolean> 校验全部字段，失败聚焦首个无效字段；resetFields() 恢复注册时初值；clearValidate() 清除错误并使旧异步校验失效。校验期间模型变化使整体校验返回 false，需要重新提交。

submit(event) 已阻止原生提交；页面在 validate=true 后调用接口。默认插槽放 FormItem。每次编辑重挂载表单，以本次记录为初值。首版草稿为平面标量字段，复杂对象的独立草稿和初始快照由页面管理。
