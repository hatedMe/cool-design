<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '../../index';
import type { UploadFile, UploadRawFile } from '../index';

interface UploadInstance {
  clearFiles: () => void;
  handleStart: (file: UploadRawFile) => void;
}

const upload = ref<UploadInstance>();
const message = ref('最多选择一个文件');

const handleExceed = (files: UploadRawFile[]) => {
  upload.value?.clearFiles();
  const file = files[0];
  if (file) {
    file.uid = Date.now();
    upload.value?.handleStart(file);
    message.value = `已替换为：${file.name}`;
  }
};

const handleChange = (file: UploadFile) => {
  message.value = `当前文件：${file.name}`;
};
</script>

<template>
  <Upload ref="upload" :auto-upload="false" :limit="1" @exceed="handleExceed" @change="handleChange">
    <template #trigger>
      <button type="button">选择文件</button>
    </template>
    <template #tip>
      <p>{{ message }}，再次选择会覆盖之前的文件。</p>
    </template>
  </Upload>
</template>
