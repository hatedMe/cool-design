<script setup lang="ts">
import { ref } from 'vue';
import { Button, Tour, TourStep } from '../../index';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">开始引导</Button>
  <Tour v-model="open" placement="center">
    <TourStep title="欢迎">查看功能介绍。</TourStep>
    <TourStep title="完成" description="现在可以开始使用。" />
  </Tour>
</template>
