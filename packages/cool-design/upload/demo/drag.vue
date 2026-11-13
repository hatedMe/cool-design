<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '../../index';
import type { UploadProgressEvent, UploadRequestOptions } from '../index';

const message = ref('支持多选，拖拽后文件会进入待上传列表');

const httpRequest = ({ file, onProgress, onSuccess }: UploadRequestOptions) => {
  let percent = 0;
  const timer = window.setInterval(() => {
    percent += 50;
    onProgress(Object.assign(new ProgressEvent('progress'), { percent }) as UploadProgressEvent);
    if (percent >= 100) {
      window.clearInterval(timer);
      onSuccess({ name: file.name });
      message.value = `${file.name} 上传成功`;
    }
  }, 120);
  return { abort: () => window.clearInterval(timer) };
};
</script>

<template>
  <Upload
    drag
    multiple
    :http-request="httpRequest"
    @change="
      (file) => {
        message = `${file.name} 状态：${file.status}`;
      }
    ">
    <p>将文件拖到此处，或点击选择</p>
    <template #tip>
      <p>{{ message }}</p>
    </template>
  </Upload>
</template>
