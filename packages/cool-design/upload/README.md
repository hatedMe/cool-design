# Upload 上传

### 介绍

Upload 用于选择文件并维护上传文件列表，支持单选、多选、数量限制、拖拽选择、目录选择和图片列表。组件既可以通过 `action` 使用内置请求上传，也可以通过 `http-request` 接入自定义请求；默认自动上传，也可设置 `auto-upload` 为 `false` 后通过实例方法手动提交。

## 用法

### 基础选择

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from 'cool-design';
import type { UploadFiles } from 'cool-design';

const files = ref<UploadFiles>([]);
</script>

<template>
  <Upload v-model="files" accept=".png,.jpg,.jpeg" multiple />
</template>
```

### 自动上传

文件选择完成后默认使用 `POST` 请求上传，`action` 默认值为 `#`；可通过 `headers`、`data`、`name` 和 `with-credentials` 配置请求。

```vue
<Upload v-model:file-list="files" action="/api/upload" name="file" />
```

### 手动上传

设置 `auto-upload="false"`，选择文件后调用 `submit()` 提交所有处于 `ready` 状态的文件。模板 ref 可以调用 `submit()`、`abort()`、`clearFiles()`、`handleStart()` 和 `handleRemove()`。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from 'cool-design';

const uploadRef = ref<{ submit: () => Promise<unknown> }>();
</script>

<template>
  <Upload ref="uploadRef" action="/api/upload" :auto-upload="false" />
  <button type="button" @click="uploadRef?.submit()">开始上传</button>
</template>
```

### 受控文件列表、拖拽和图片列表

`file-list` 是受控文件列表，使用 `v-model:file-list` 可接收组件更新；`drag` 开启拖拽区域，`list-type="picture"` 或 `list-type="picture-card"` 显示图片列表。

```vue
<Upload
  v-model:file-list="files"
  drag
  list-type="picture"
  :limit="3"
  accept="image/*"
>
  点击或拖拽文件到此处
</Upload>
```

### 自定义请求

`http-request` 接收 `UploadRequestOptions`，调用 `onProgress`、`onSuccess` 或 `onError` 通知组件请求状态。自定义请求不依赖真实服务端时，也可以在 demo 中使用本地异步函数模拟上传。

## API

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| action | 上传地址；使用 `http-request` 时可作为自定义请求的地址参数 | `string` | `#` |
| headers | 上传请求头 | `Record<string, string \| number \| null \| undefined> \| Headers` | — |
| method | 上传请求方法 | `string` | `POST` |
| multiple | 是否支持多选 | `boolean` | `false` |
| data | 上传时附带的额外数据，支持 Promise、函数、Blob、数组和文件名元组 | `UploadData` | — |
| name | 上传文件的字段名 | `string` | `file` |
| crossorigin | 图片列表图片的跨域属性 | `'anonymous' \| 'use-credentials' \| ''` | `''` |
| with-credentials | 是否携带跨域凭据 | `boolean` | `false` |
| show-file-list | 是否显示文件列表 | `boolean` | `true` |
| drag | 是否启用拖拽上传 | `boolean` | `false` |
| accept | 接受的文件类型，格式遵循原生 `input[type=file]` | `string` | `''` |
| file-list | 受控文件列表 | `UploadUserFile[] \| UploadFiles` | — |
| model-value | 非受控模式的文件列表，也支持 `v-model` | `UploadUserFile[] \| UploadFiles` | `[]` |
| list-type | 文件列表类型：`text` / `picture` / `picture-card` | `'text' \| 'picture' \| 'picture-card'` | `text` |
| auto-upload | 是否在选择文件后自动上传 | `boolean` | `true` |
| http-request | 覆盖默认上传请求 | `(options: UploadRequestOptions) => void \| Promise<unknown> \| { abort?: () => void; cancel?: () => void; promise?: Promise<unknown> }` | — |
| disabled | 是否禁用选择和删除 | `boolean` | `false` |
| limit | 最大文件数量 | `number` | — |
| directory | 是否选择目录 | `boolean` | `false` |
| before-upload | 上传前钩子，支持拒绝或返回新的 `File` / `Blob` | `(file: UploadRawFile) => void \| null \| boolean \| File \| Blob \| Promise<void \| null \| boolean \| File \| Blob>` | — |
| before-remove | 删除前钩子，返回 `false` 或拒绝 Promise 会阻止删除 | `(file: UploadFile, files: UploadFiles) => boolean \| Promise<boolean>` | — |
| on-preview | 预览回调 | `(file: UploadFile) => void \| Promise<boolean \| void>` | — |
| on-remove | 删除回调 | `(file: UploadFile, files: UploadFiles) => void \| Promise<boolean \| void>` | — |
| on-success | 上传成功回调 | `(response: unknown, file: UploadFile, files: UploadFiles) => void \| Promise<boolean \| void>` | — |
| on-error | 上传失败回调 | `(error: Error, file: UploadFile, files: UploadFiles) => void \| Promise<boolean \| void>` | — |
| on-progress | 上传进度回调 | `(event: UploadProgressEvent, file: UploadFile, files: UploadFiles) => void \| Promise<boolean \| void>` | — |
| on-change | 文件列表变化回调 | `(file: UploadFile, files: UploadFiles) => void \| Promise<boolean \| void>` | — |
| on-exceed | 超出 `limit` 时回调 | `(files: UploadRawFile[], fileList: UploadFiles) => void \| Promise<boolean \| void>` | — |

`model-value` 与 `file-list` 同时提供时，`file-list` 优先作为受控数据源。

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 非受控列表更新 | `files: UploadFiles` |
| update:file-list | 受控列表更新 | `files: UploadFiles` |
| change | 文件添加、状态变化或列表变化 | `file: UploadFile, files: UploadFiles` |
| success | 上传成功 | `response: unknown, file: UploadFile, files: UploadFiles` |
| error | 上传失败 | `error: Error, file: UploadFile, files: UploadFiles` |
| progress | 上传进度 | `event: UploadProgressEvent, file: UploadFile, files: UploadFiles` |
| remove | 文件移除 | `file: UploadFile, files: UploadFiles` |
| exceed | 超出数量限制 | `files: UploadRawFile[], fileList: UploadFiles` |

短名事件与同名 `on-*` 属性回调会同时触发；`on-*` 属性回调属于兼容 Element Plus 的便捷写法。

### 插槽

| 插槽名 | 说明 | 插槽参数 |
| --- | --- | --- |
| default | 默认触发按钮内容 | — |
| trigger | 自定义触发内容 | `choose: () => void` |
| tip | 文件选择区域下方的提示内容 | — |
| file | 自定义文件列表项 | `file: UploadFile, index: number` |

### 实例方法

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| submit() | 提交所有状态为 `ready` 的文件 | `Promise<unknown[]>` |
| abort(file?) | 取消指定文件或全部进行中的请求 | `void` |
| clearFiles() | 清空文件列表并取消进行中的请求 | `void` |
| handleStart(file) | 以待上传状态添加一个原生文件 | `void` |
| handleRemove(file) | 移除指定文件 | `Promise<void>` |

### 类型

以下类型可从 `cool-design` 导入。before-upload 返回转换文件时，列表展示名称仍保留原始选择文件名，转换文件仅用于实际上传。`UploadRequest`、`UploadRequestHandle` 和 `UploadRequestResult` 是内部组合类型，未从包入口导出；自定义请求可直接按 `UploadRequestOptions` 标注参数。`submit()` 返回 Promise 是本项目保留的扩展行为，不是 Element Plus 的完全一致契约。`UploadDataValue` 中的 `string[]` 表示多个普通字段值，`[string | Blob, string]` 表示带文件名的字段；项目按 Element Plus 的 tuple 优先规则处理长度为 2 的二元数组，因此长度为 2 的字符串数组会按 filename tuple 解释：

```ts
 type UploadStatus = 'ready' | 'uploading' | 'success' | 'fail';

 type UploadRawFile = Omit<File, 'webkitRelativePath'> & {
   uid: number;
   isDirectory?: boolean;
   readonly webkitRelativePath?: string;
 };

 interface UploadFile {
   name: string;
   uid: number;
   status: UploadStatus;
   percentage?: number;
   size?: number;
   response?: unknown;
   url?: string;
   raw?: UploadRawFile;
 }

 type UploadUserFile = Omit<UploadFile, 'uid' | 'status'> &
   Partial<Pick<UploadFile, 'uid' | 'status'>>;
 type UploadFiles = UploadFile[];
 type UploadDataValue = string | number | boolean | Blob | string[] | [string | Blob, string];
 type UploadDataRecord = Record<string, UploadDataValue>;
 interface UploadProgressEvent extends ProgressEvent {
   percent: number;
 }

 interface UploadRequestOptions {
   action: string;
   method: string;
   headers?: Record<string, string | number | null | undefined> | Headers;
   data: UploadDataRecord;
   filename: string;
   file: UploadRawFile;
   withCredentials: boolean;
   onProgress: (event: UploadProgressEvent) => void;
   onSuccess: (response: unknown) => void;
   onError: (error: Error) => void;
 }

 interface UploadRequestHandle {
   abort?: () => void;
   cancel?: () => void;
   promise?: Promise<unknown>;
 }

 type UploadRequestResult = void | Promise<unknown> | UploadRequestHandle;
 type UploadRequest = (options: UploadRequestOptions) => UploadRequestResult;
```
