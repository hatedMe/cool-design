<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '../../index';
import type { UploadFile, UploadFiles } from '../index';

const files = ref<UploadFiles>([]);
const message = ref('请选择一个目录');

const handleChange = (file: UploadFile, list: UploadFiles) => {
  files.value = list;
  message.value = `${file.name}，共 ${list.length} 个文件`;
};
</script>

<template>
  <Upload v-model:file-list="files" directory multiple :auto-upload="false" @change="handleChange">
    <button type="button">选择目录</button>
    <template #tip>
      <p>{{ message }}</p>
    </template>
  </Upload>
</template>
