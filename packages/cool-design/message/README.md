# Message 消息反馈

## 组件介绍

Message 展示操作成功或失败的文本反馈，支持声明式组件与命令式服务 `ElMessage`。服务支持字符串或选项调用、五种类型、自动关闭、堆叠、HTML 显式开启与应用上下文继承。

## 声明式用法

```vue
<Message v-if="visible" type="success" message="保存成功" show-close :duration="3000" @close="visible = false" />
```

属性 `type` 可选 `primary` / `success` / `warning` / `info` / `error`，默认 `info`。`duration` 为自动关闭毫秒数，`0` 表示不自动关闭，默认 `3000`。`showClose` 默认 `false`。

## 服务用法

```ts
import { ElMessage } from 'cool-design';

// 字符串快捷调用，类型默认为 info
ElMessage('保存成功');
ElMessage({ message: '保存成功', type: 'success' });

// 便捷方法
ElMessage.success('保存成功');
ElMessage.warning('请检查输入');
ElMessage.error('保存失败');

// 关闭句柄与回调
const handle = ElMessage({ message: '处理中…', duration: 0, showClose: true, onClose: () => console.log('closed') });
handle.close();

// 关闭全部
ElMessage.closeAll();
```

`offset` 为距边缘像素，默认 `20`。`placement` 可选 `top` / `bottom`，默认 `top`，同位置消息垂直堆叠。`center` 居中文本，`customClass` 附加类名。

```ts
ElMessage({ message: '底部提示', placement: 'bottom', offset: 40 });
```

默认按文本渲染，设置 `dangerouslyUseHTMLString: true` 才解析 HTML，调用方需自行保证内容可信。

```ts
ElMessage({ message: '<b>加粗</b>', dangerouslyUseHTMLString: true });
```

服务接受第二个参数 `appContext` 以继承应用全局配置，也可通过 `app.use(ElMessage)` 注册 `$message` 并继承上下文。

```ts
import { getCurrentInstance } from 'vue';
ElMessage('你好', getCurrentInstance()?.appContext ?? null);
```

## API

### 声明式属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `type` | 消息类型：`primary` / `success` / `warning` / `info` / `error` | `MessageType` | `info` |
| `message` | 消息文本，必填 | `string` | — |
| `duration` | 自动关闭毫秒数，`0` 不自动关闭 | `number` | `3000` |
| `show-close` | 是否显示关闭按钮 | `boolean` | `false` |
| `dangerously-use-h-t-m-l-string` | 是否解析 HTML | `boolean` | `false` |
| `center` | 文本是否居中 | `boolean` | `false` |
| `custom-class` | 自定义类名 | `string` | — |

### 声明式事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `close` | 计时结束或关闭按钮触发，父级移除组件 | 无 |

### 服务选项 `MessageOptions`

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `message` | 消息文本，必填 | `string` | — |
| `type` | 类型：`primary` / `success` / `warning` / `info` / `error` | `MessageType` | `info` |
| `duration` | 自动关闭毫秒数，`0` 不自动关闭 | `number` | `3000` |
| `show-close` / `showClose` | 是否显示关闭按钮 | `boolean` | `false` |
| `offset` | 距边缘像素 | `number` | `20` |
| `placement` | 位置：`top` / `bottom` | `MessagePlacement` | `top` |
| `dangerouslyUseHTMLString` | 是否解析 HTML | `boolean` | `false` |
| `center` | 文本是否居中 | `boolean` | `false` |
| `customClass` | 自定义类名 | `string` | — |
| `onClose` | 关闭回调 | `() => void` | — |

### 服务方法

| 方法 | 说明 | 类型 |
| ---- | ---- | ---- |
| `ElMessage(options, appContext?)` | 显示消息，`options` 可为字符串或选项，返回关闭句柄 | `(options: string \| MessageOptions, appContext?: AppContext \| null) => MessageHandle` |
| `ElMessage.primary/success/warning/info/error(options, appContext?)` | 指定类型的快捷方法 | 同上 |
| `ElMessage.closeAll()` | 关闭全部消息 | `() => void` |
| `handle.close()` | 关闭单条，幂等 | `() => void` |

`error` 类型使用 `role="alert"`，其余使用 `role="status"`。计时结束、关闭按钮或句柄关闭均触发 `onClose` 一次。
