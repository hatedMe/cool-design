<script setup lang="ts">
import { ref } from 'vue';
import { Image } from '../../index';
const urls = [
  'https://dummyimage.com/600x400/409eff/fff&text=1',
  'https://dummyimage.com/600x400/67c23a/fff&text=2'
];
const imageRef = ref<{ showPreview: () => void }>();
</script>
<template>
  <div>
    <button type="button" @click="imageRef?.showPreview()">打开预览</button>
    <Image ref="imageRef" :src="urls[0]" fit="cover" :preview-src-list="urls" :initial-index="1" style="width: 120px" />
  </div>
</template>
