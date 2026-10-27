# Upload 上传

### 介绍

选择文件并维护文件列表，可通过 `action` 或 `http-request` 接入上传服务。

## 用法

`<Upload v-model="files" action="/api/upload" multiple />`。

## API

属性：`modelValue`、`file-list`、`action`、`http-request`、`before-upload`、`limit`、`accept`、`multiple`、`auto-upload`、`drag`、`disabled`。

事件：`update:modelValue`、`change`、`success`、`error`、`progress`、`remove`、`exceed`。
