<script setup lang="ts">
import { ref } from 'vue';
import { Drawer } from '../../index';
const open = ref(false);
</script>
<template>
  <div>
    <button type="button" @click="open = true">打开抽屉</button>
    <Drawer v-model="open" title="编辑内容" direction="rtl" size="360px">
      <p>抽屉正文</p>
      <template #footer>
        <button type="button" @click="open = false">关闭</button>
      </template>
    </Drawer>
  </div>
</template>
