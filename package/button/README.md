# Button 按钮

默认插槽为按钮内容。属性：`type: 'default' | 'primary' | 'success' | 'warning' | 'danger'`（默认 default）、`size?: 'small' | 'default' | 'normal' | 'large'`、`disabled`、`loading`、`nativeType: 'button' | 'submit' | 'reset'`（默认 button）。normal 暂映射 default。

事件 `click(event: MouseEvent)`；禁用、加载时不触发。form、aria-label 等原生属性透传。提交表单需显式 `native-type="submit"`。
