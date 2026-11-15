# MessageBox 消息确认框

## 组件介绍

MessageBox 对需要明确决策的操作进行模态确认，支持声明式组件、命令式 `msgbox` / `alert` / `confirm` / `prompt` 与组合式 `useMessageBox`。命令式遵循 Element Plus 的 resolve/reject 语义：确认 resolve，取消或关闭 reject。

## 声明式用法

```vue
<MessageBox v-model="open" title="删除确认" message="删除后无法恢复，确定继续吗？" @confirm="onConfirm" @cancel="onCancel" @close="onClose" />
```

`type` 可选 `success` / `warning` / `info` / `error`，默认 `warning`。`message` 为纯文本，可用默认插槽覆盖。设置 `dangerously-use-h-t-m-l-string` 才解析 HTML。

异步确认使用 `before-confirm`，返回 `false` 保持窗口，抛错显示错误并允许重试。等待期间禁止重复确认、取消与 Esc 关闭。

```vue
<MessageBox v-model="open" :before-confirm="deleteUser" @confirm="refresh" />
```

输入框模式设置 `show-input`，通过 `input-value` / `input-placeholder` / `input-type` 配置，`input-pattern` / `input-validator` 校验，`input-error-message` 自定义错误文本。确认时 `confirm` 事件携带输入值。

## 命令式用法

```ts
import { MessageBox } from 'cool-design';

// 确认框：确认 resolve 'confirm'，取消 reject 'cancel'，关闭 reject 'close'
MessageBox.confirm('确定删除吗？', '删除确认')
  .then(() => console.log('confirmed'))
  .catch((action) => console.log(action)); // 'cancel' | 'close'

// 提示框：默认无取消按钮
await MessageBox.alert('操作成功', '提示');

// 输入框：确认 resolve { value, action }，取消/关闭 reject
const { value } = await MessageBox.prompt('请输入名字', '提示', { inputValue: '初始' });

// 通用：showInput 为 true 时同 prompt，否则同 confirm
await MessageBox.msgbox({ title: '标题', message: '内容', type: 'warning' });
```

按钮、居中与 HTML 选项：

```ts
await MessageBox.confirm('<b>加粗</b>', '标题', {
  dangerouslyUseHTMLString: true,
  center: true,
  showConfirmButton: true,
  showCancelButton: true,
  confirmButtonText: '好的',
  cancelButtonText: '算了',
  confirmButtonType: 'success',
  cancelButtonType: 'default'
});
```

`beforeClose` 在关闭前拦截，调用 `done` 才关闭，适用于二次确认或异步清理：

```ts
await MessageBox.confirm('确定吗？', '确认', {
  beforeClose: (action, instance, done) => {
    console.log(action, instance.inputValue);
    done();
  }
});
```

输入校验：

```ts
await MessageBox.prompt('请输入邮箱', '提示', {
  inputPattern: /@/,
  inputErrorMessage: '邮箱不合法',
  inputValidator: (val) => (val.length >= 3 ? true : '至少 3 个字符')
});
```

组合式在 `setup` 中调用，继承 `ConfigProvider` 配置，作用域销毁时清理未完成弹窗（以 `cancel` reject，调用方需捕获）：

```ts
import { useMessageBox } from 'cool-design';
const box = useMessageBox();
try {
  await box.confirm('确定删除吗？');
} catch (action) {
  // 'cancel' | 'close'
}
```

独立调用可传入 `appContext` 以继承全局配置：

```ts
import { getCurrentInstance } from 'vue';
MessageBox.confirm('确定吗？', '确认', {}, getCurrentInstance()?.appContext ?? null);
```

## API

### 声明式属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `modelValue` / `v-model` | 是否显示 | `boolean` | `false` |
| `title` | 标题 | `string` | `操作确认` |
| `message` | 纯文本内容，可被默认插槽覆盖 | `string` | 空字符串 |
| `type` | 类型：`success` / `warning` / `info` / `error` | `MessageBoxType` | `warning` |
| `dangerously-use-h-t-m-l-string` | 是否解析 HTML | `boolean` | `false` |
| `center` | 内容与按钮是否居中 | `boolean` | `false` |
| `show-confirm-button` | 是否显示确认按钮 | `boolean` | `true` |
| `show-cancel-button` | 是否显示取消按钮 | `boolean` | `true` |
| `confirm-button-text` | 确认按钮文字 | `string` | `确定` |
| `cancel-button-text` | 取消按钮文字 | `string` | `取消` |
| `confirm-button-type` | 确认按钮类型 | `ButtonType` | `primary` |
| `cancel-button-type` | 取消按钮类型 | `ButtonType` | `default` |
| `before-close` | 关闭前回调，需调用 `done` 关闭 | `MessageBoxBeforeClose` | — |
| `before-confirm` | 确认前执行；`false` 保持窗口，抛错显示错误（旧版兼容，`before-close` 优先） | `(value?: string) => void \| boolean \| Promise<void \| boolean>` | — |
| `show-input` | 是否显示输入框 | `boolean` | `false` |
| `input-value` | 输入初始值 | `string` | 空字符串 |
| `input-placeholder` | 输入占位 | `string` | 空字符串 |
| `input-type` | 输入类型：`text` / `textarea` / `password` | `string` | `text` |
| `input-pattern` | 输入正则校验 | `RegExp` | — |
| `input-validator` | 输入自定义校验，返回 `false` 或错误文本表示失败 | `(value: string) => boolean \| string` | — |
| `input-error-message` | 校验失败默认错误文本 | `string` | `输入不合法` |

### 声明式事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:modelValue` | 请求关闭 | `value: false` |
| `update:inputValue` | 输入变化 | `value: string` |
| `confirm` | 确认，输入模式携带输入值 | `value?: string` |
| `cancel` | 取消按钮触发 | 无 |
| `close` | 关闭按钮或 Esc 触发 | 无 |

### 声明式插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 替换 `message` 内容 |

### 命令式选项 `MessageBoxOptions`

除 `modelValue` 外同声明式属性，另含 `title` / `message`。`alert` 默认 `showCancelButton: false`，`prompt` 默认 `showInput: true`。

### 命令式方法

| 方法 | 说明 | 类型 |
| ---- | ---- | ---- |
| `MessageBox.msgbox(options, appContext?)` | 通用弹窗，含输入时 resolve `{ value, action }`，否则 resolve `'confirm'`，取消/关闭 reject | `(options: MessageBoxOptions & { message: string; title?: string }, appContext?: AppContext \| null) => Promise<'confirm' \| MessageBoxPromptResult>` |
| `MessageBox.alert(message, title?, options?, appContext?)` | 提示框 | `(message: string, title?: string, options?: MessageBoxOptions, appContext?: AppContext \| null) => Promise<'confirm'>` |
| `MessageBox.confirm(message, title?, options?, appContext?)` | 确认框 | 同上 |
| `MessageBox.prompt(message, title?, options?, appContext?)` | 输入框 | `(message: string, title?: string, options?: MessageBoxOptions, appContext?: AppContext \| null) => Promise<MessageBoxPromptResult>` |
| `useMessageBox()` | 组合式，返回 `{ msgbox, alert, confirm, prompt }`，继承上下文并在作用域销毁时清理 | `() => { msgbox, alert, confirm, prompt }` |

复用 Dialog 的主题宿主、焦点管理、滚动锁与层级能力。点击遮罩不关闭，普通状态下 Esc 与关闭按钮触发 `close`，取消按钮触发 `cancel`。关闭或卸载后旧异步结果不再触发事件。
