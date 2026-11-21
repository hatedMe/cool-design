# Loading 加载

## 组件介绍

Loading 展示加载状态，支持声明式区域遮罩与命令式全屏/区域服务。声明式用于包裹内容并阻止交互，服务 `Loading.service` 用于代码中打开全局或指定目标的加载层。指令 `v-loading` 保持可用。

## 声明式用法

使用 `loading` 控制显示，`overlay` 遮罩默认插槽内容并阻止点击与键盘交互。

```vue
<Loading :loading="pending" overlay text="正在加载用户…">
  <div>列表或其他内容</div>
</Loading>
```

`fullscreen` 使用固定全屏加载层，`background` 覆盖背景色，`customClass` 附加自定义类，`lock` 在全屏时锁定滚动。

```vue
<Loading :loading="pending" fullscreen lock text="正在加载…" />
```

## 服务用法

```ts
import { Loading } from 'cool-design';

const inst = Loading.service({ text: '正在加载…', background: 'rgba(0,0,0,.5)' });
// …异步完成后
inst.close();
```

`fullscreen` 默认为 `true`，全屏实例为单例，重复调用返回同一实例。指定 `target` 且 `fullscreen: false` 时遮罩目标元素，`body: true` 时将遮罩挂载到 `body`。`lock: true` 锁定页面滚动，关闭后恢复。

```ts
// 区域加载
const targetInst = Loading.service({ target: document.querySelector('#list') as HTMLElement, fullscreen: false, text: '加载中…' });
targetInst.close();

// 挂载到 body 但覆盖目标（避免 overflow 裁剪）
Loading.service({ target: '#list', body: true, fullscreen: false });

// 传入应用上下文以继承全局配置
import { getCurrentInstance } from 'vue';
Loading.service({ text: '加载中…' }, getCurrentInstance()?.appContext ?? null);
```

## 指令用法

```vue
<div v-loading="pending">内容</div>
<div v-loading="{ text: '加载中…', background: 'rgba(255,255,255,.8)', fullscreen: false, lock: true }">内容</div>

<!-- modifiers：全屏遮罩挂到 body 并锁定滚动 -->
<div v-loading.fullscreen.lock.body="pending">内容</div>

<!-- element-loading-* 元素属性声明文案与图标 -->
<div v-loading element-loading-text="加载中…" element-loading-background="rgba(0,0,0,.4)" element-loading-spinner="icon-refresh">内容</div>
```

## API

### 声明式属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `loading` | 是否显示加载状态 | `boolean` | `true` |
| `text` | 加载提示文字 | `string` | `正在加载…` |
| `overlay` | 遮罩默认插槽内容并阻止交互 | `boolean` | `false` |
| `fullscreen` | 使用全屏加载层 | `boolean` | `false` |
| `background` | 加载层背景色 | `string` | — |
| `lock` | 全屏时锁定滚动 | `boolean` | `false` |
| `custom-class` | 自定义类名 | `string` | — |

### 声明式插槽

| 插槽名 | 说明 |
| ------ | ---- |
| `default` | 被加载遮罩覆盖的内容 |

### 服务选项 `LoadingServiceOptions`

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `target` | 遮罩目标元素或选择器，`fullscreen: false` 时生效 | `HTMLElement \| string` | `document.body` |
| `body` | 是否挂载到 `body`（非全屏时可避免裁剪） | `boolean` | `false` |
| `fullscreen` | 是否全屏，全屏为单例 | `boolean` | `true` |
| `lock` | 是否锁定滚动 | `boolean` | `false` |
| `text` | 提示文字 | `string` | `正在加载…` |
| `background` | 背景色 | `string` | — |
| `custom-class` / `customClass` | 自定义类名 | `string` | — |
| `spinner` | 自定义图标类名（优先于内置旋转描边） | `string` | — |
| `svg` | 自定义 SVG 片段，与 `svg-view-box` / `svg-size` 配合 | `string` | — |
| `svg-view-box` / `svgViewBox` | SVG 的 `viewBox` | `string` | — |
| `svg-size` / `svgSize` | SVG 尺寸，单位 px | `number` | — |

### 服务方法

| 方法 | 说明 | 类型 |
| ---- | ---- | ---- |
| `Loading.service(options?, appContext?)` | 打开加载层，返回关闭句柄 | `(options?: LoadingServiceOptions, appContext?: AppContext \| null) => LoadingInstance` |
| `instance.close()` | 关闭并卸载，幂等 | `() => void` |
| `instance.setText(text)` | 更新提示文字 | `(text: string) => void` |

遮罩期间内容具有 `inert` 属性并阻止点击与键盘事件，结束后恢复。状态使用 `role="status"` 与 `aria-live="polite"`，减少动态效果偏好下停止旋转。
