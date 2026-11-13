<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '../../index';
import type { UploadFile, UploadFiles } from '../index';

const fileList = ref<UploadFiles>([
  {
    name: '封面图.svg',
    uid: 1,
    status: 'success',
    url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80"%3E%3Crect width="120" height="80" fill="%236096ff"/%3E%3C/svg%3E'
  },
  {
    name: '产品图.svg',
    uid: 2,
    status: 'success',
    url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80"%3E%3Crect width="120" height="80" fill="%2367c23a"/%3E%3C/svg%3E'
  }
]);
const message = ref('点击图片列表中的预览');

const handlePreview = (file: UploadFile) => {
  message.value = `预览：${file.name}`;
};

const handleRemove = (_file: UploadFile, files: UploadFiles) => {
  fileList.value = files;
};
</script>

<template>
  <Upload
    v-model:file-list="fileList"
    list-type="picture"
    :auto-upload="false"
    :on-preview="handlePreview"
    :on-remove="handleRemove">
    <button type="button">继续选择图片</button>
    <template #tip>
      <p>{{ message }}</p>
    </template>
  </Upload>
</template>
