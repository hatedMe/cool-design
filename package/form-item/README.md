# FormItem 字段

属性 prop: string（必填、同一表单内唯一的平面字段名）、label?: string。在 Form 中使用，默认插槽放一个输入控件。自动关联标签、ID、aria-invalid、错误描述及规则，错误使用 alert 角色。

prop 在实例生命周期内保持不变；切换编辑记录为 Form 设置新 key。注销、清除错误后，旧异步结果不覆盖当前状态。
