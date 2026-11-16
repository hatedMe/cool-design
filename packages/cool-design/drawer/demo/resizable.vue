<script setup lang="ts">
import { ref } from 'vue';
import { Drawer } from '../../index';
const open = ref(false);
</script>
<template>
  <div>
    <button type="button" @click="open = true">打开可调整抽屉</button>
    <Drawer
      v-model="open"
      title="可调整尺寸"
      direction="rtl"
      size="360px"
      :resizable="{ minSize: '240px', maxSize: '80%' }"
      :modal="false"
      modal-penetrable
    >
      <p>拖拽左侧边缘调整宽度，聚焦手柄后可用方向键微调；无遮罩且点击穿透。</p>
    </Drawer>
  </div>
</template>
