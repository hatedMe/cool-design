# Input 输入框

`v-model` 为字符串，默认空字符串。属性：clearable、disabled、readonly、placeholder、size。id、name、maxlength、aria-label 等原生属性透传到 input。

事件：`update:modelValue(value: string)` 在输入和清空时触发；`change(value: string)` 在原生 change 或清空时触发；`blur(event: FocusEvent)`。实例方法 focus()。禁用、只读不能编辑和清空。在 FormItem 内自动关联标签和错误。

示例：`<Input v-model="name" clearable placeholder="请输入姓名" />`。
