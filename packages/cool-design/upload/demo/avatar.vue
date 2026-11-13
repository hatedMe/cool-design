<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '../../index';
import type { UploadRequestOptions, UploadRawFile } from '../index';

const imageUrl = ref('');
const message = ref('请选择图片');

const beforeUpload = (file: UploadRawFile) => {
  const validType = file.type.startsWith('image/');
  const validSize = file.size / 1024 / 1024 < 2;
  if (!validType || !validSize) {
    message.value = '只允许上传 2MB 以内的图片';
    return false;
  }
  return true;
};

const httpRequest = ({ file, onSuccess }: UploadRequestOptions) => {
  window.setTimeout(() => onSuccess({ ok: true }), 300);
  imageUrl.value = URL.createObjectURL(file);
};
</script>

<template>
  <Upload
    :show-file-list="false"
    :before-upload="beforeUpload"
    :http-request="httpRequest"
    @success="message = '头像上传成功'">
    <img v-if="imageUrl" :src="imageUrl" alt="头像" width="96" height="96" />
    <button v-else type="button">选择头像</button>
    <template #tip>
      <p>{{ message }}</p>
    </template>
  </Upload>
</template>
