# Select 选择器

原生单选 select，默认插槽放 SelectOption。`v-model?: string | number`，未选择为 undefined。属性：clearable、disabled、placeholder（默认“请选择”）、size。数字选项保持数字类型。

事件 update:modelValue(value)、change(value) 在确认选择、清空时触发；清空为 undefined；blur(event)。实例方法 focus()。空字符串保留给占位项，不作为业务值。

```vue
<Select v-model="status" clearable>
    <SelectOption value="enabled" label="启用" />
    <SelectOption value="disabled" label="停用" />
</Select>
```

键盘和关闭行为遵循原生浏览器；不支持搜索、多选和远程选项。
