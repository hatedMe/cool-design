# Form 表单

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
