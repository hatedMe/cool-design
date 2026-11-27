# Notification 通知

## 组件介绍

Notification 用于全局展示操作反馈和异步结果，支持声明式组件与命令式服务 `Notify`。服务支持四角位置堆叠、自动关闭、悬停暂停、HTML 显式开启与应用上下文继承。

## 声明式用法

```vue
<Notification v-if="visible" title="保存结果" message="数据已保存" type="success" @close="visible = false" />
```

`type` 可选 `primary` / `success` / `warning` / `info` / `error`（`danger` 为 `error` 别名），默认 `warning`。`duration` 为自动关闭毫秒数，`0` 不自动关闭，默认 `4500`，悬停暂停计时。`showClose` 默认 `true`。

## 服务用法

```ts
import { Notify } from 'cool-design';

const handle = Notify({ title: '保存成功', message: '数据已经保存', type: 'success' });
handle.close();

// 便捷方法
Notify.success({ title: '成功', message: 'ok' });
Notify.warning({ title: '警告', message: '注意' });
Notify.error({ title: '失败', message: 'err' });

// 关闭全部
Notify.closeAll();
```

位置与偏移：`position` 可选 `top-right` / `top-left` / `bottom-right` / `bottom-left`，默认 `top-right`，同位置垂直堆叠。`offset` 为额外偏移像素，默认 `0`（基础边距 `20px`）。

```ts
Notify({ title: '左下', message: '内容', position: 'bottom-left', offset: 10 });
```

默认按文本渲染，设置 `dangerouslyUseHTMLString: true` 才解析 HTML，调用方需自行保证内容可信。`onClick` 监听通知点击，`onClose` 监听关闭。

```ts
Notify({
  title: '提示',
  message: '<b>加粗</b>',
  dangerouslyUseHTMLString: true,
  duration: 0,
  showClose: true,
  onClick: (e) => console.log('click', e),
  onClose: () => console.log('closed')
});
```

服务接受第二个参数 `appContext` 以继承应用全局配置，也可通过 `app.use(Notify)` 注册 `$notify` 并继承上下文。

```ts
import { getCurrentInstance } from 'vue';
Notify({ title: '你好', message: '内容' }, getCurrentInstance()?.appContext ?? null);
```

## API

### 声明式属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `title` | 标题，按文本渲染 | `string` | — |
| `message` | 内容，按文本渲染，可被默认插槽覆盖 | `string` | — |
| `type` | 类型：`primary` / `success` / `warning` / `info` / `error`（`danger` 为别名） | `NotificationType` | `warning` |
| `size` | 尺寸：`large` / `normal` / `small` | `string` | `normal` |
| `duration` | 自动关闭毫秒数，`0` 不自动关闭 | `number` | `4500` |
| `show-close` | 是否显示关闭按钮 | `boolean` | `true` |
| `dangerously-use-h-t-m-l-string` | 是否解析 HTML（仅 `message`） | `boolean` | `false` |
| `custom-class` | 自定义类名 | `string` | — |

### 声明式事件

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `click` | 通知点击（关闭按钮除外） | `event: MouseEvent` |
| `close` | 计时结束、关闭按钮或句柄关闭 | 无 |

### 声明式插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 内容，覆盖 `message` 属性 |

安装后，应用内的服务方法使用所属应用的 `ConfigProvider` 配置。传入 `appContext` 可指定应用，传入 `null` 使用默认配置。显式 `zIndex` 优先，包含 `0`。应用绑定方法的 `closeAll` 只关闭属于该应用的实例，包导出方法的 `closeAll` 可关闭所有应用的实例。

### 服务选项 `NotificationOptions`

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `title` | 标题 | `string` | — |
| `message` | 内容 | `string` | — |
| `type` | 类型：`primary` / `success` / `warning` / `info` / `error`（`danger` 为别名） | `NotificationType` | `warning` |
| `size` | 尺寸：`large` / `normal` / `small` | `string` | `normal` |
| `duration` | 自动关闭毫秒数，`0` 不自动关闭 | `number` | `4500` |
| `position` | 位置：`top-right` / `top-left` / `bottom-right` / `bottom-left` | `NotificationPosition` | `top-right` |
| `offset` | 额外偏移像素 | `number` | `0` |
| `zIndex` | 单条服务浮层层级 | `number` | 按应用层级递增 |
| `show-close` / `showClose` | 是否显示关闭按钮 | `boolean` | `true` |
| `dangerouslyUseHTMLString` | 是否解析 HTML（仅 `message`） | `boolean` | `false` |
| `customClass` | 自定义类名 | `string` | — |
| `onClick` | 点击回调 | `(event: MouseEvent) => void` | — |
| `onClose` | 关闭回调 | `() => void` | — |

### 服务方法

| 方法 | 说明 | 类型 |
| ---- | ---- | ---- |
| `Notify(options?, appContext?)` | 显示通知，返回关闭句柄 | `(options?: NotificationOptions, appContext?: AppContext \| null) => NotificationHandle` |
| `Notify.primary/success/warning/info/error/danger(options?, appContext?)` | 指定类型的快捷方法 | 同上 |
| `Notify.closeAll()` | 关闭全部通知 | `() => void` |
| `handle.close()` | 关闭单条，幂等 | `() => void` |

通知使用 `role="status"` 语义。计时结束、关闭按钮或句柄关闭均触发 `onClose` 一次。
