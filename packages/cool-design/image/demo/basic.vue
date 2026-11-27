<script setup lang="ts">
import { ref } from 'vue';
import { Image } from '../../index';
const urls = [
  'https://dummyimage.com/600x400/409eff/fff&text=1',
  'https://dummyimage.com/600x400/67c23a/fff&text=2',
  'https://dummyimage.com/600x400/e6a23c/fff&text=3'
];
const src = ref(urls[0]);
</script>
<template>
  <Image
    :src="src"
    alt="示例图片"
    fit="cover"
    :preview-src-list="urls"
    :initial-index="0"
    show-progress
    style="width: 160px"
  >
    <template #placeholder>加载中…</template>
    <template #error>加载失败</template>
    <template #viewer-placeholder>预览加载中…</template>
    <template #viewer-error>预览加载失败</template>
  </Image>
</template>
