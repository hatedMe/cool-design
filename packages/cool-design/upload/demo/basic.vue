<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '../../index';
import type { UploadFile, UploadFiles, UploadRequestOptions } from '../index';

interface UploadInstance {
  submit: () => Promise<unknown[]>;
}

const uploadRef = ref<UploadInstance>();
const files = ref<UploadFiles>([]);
const message = ref('请选择文件');

const httpRequest = ({ file, onProgress, onSuccess }: UploadRequestOptions): Promise<void> => new Promise<void>((resolve) => {
  let percent = 0;
  const timer = window.setInterval(() => {
    percent += 25;
    onProgress({ percent });
    if (percent >= 100) {
      window.clearInterval(timer);
      onSuccess({ name: file.name, local: true });
      resolve();
    }
  }, 80);
});

const handleChange = (file: UploadFile, list: UploadFiles) => {
  files.value = list;
  message.value = `${file.name}：${file.status}（${list.length}/3）`;
};

const handleSuccess = (file: UploadFile) => {
  message.value = `${file.name} 上传成功`;
};

const handleError = (error: unknown, file: UploadFile) => {
  message.value = `${file.name} 上传失败：${String(error)}`;
};

const submit = () => {
  void uploadRef.value?.submit();
};
</script>

<template>
  <Upload
    ref="uploadRef"
    v-model:file-list="files"
    :http-request="httpRequest"
    :auto-upload="false"
    :multiple="true"
    :limit="3"
    drag
    list-type="picture"
    accept="image/*"
    @change="handleChange"
    @success="handleSuccess"
    @error="handleError"
  >
    选择图片或将图片拖到此处
    <template #tip>
      <p>{{ message }}</p>
    </template>
  </Upload>
  <button type="button" @click="submit">开始上传</button>
</template>
