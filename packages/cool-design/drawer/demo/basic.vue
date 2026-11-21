<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, type DrawerBeforeClose, type DrawerInstance } from '../../index';
const open = ref(false);
const drawer = ref<DrawerInstance>();
const beforeClose: DrawerBeforeClose = (done) => done();
</script>
<template>
  <div>
    <button type="button" @click="open = true">打开抽屉</button>
    <Drawer ref="drawer" v-model="open" title="编辑内容" direction="rtl" size="360px" :before-close="beforeClose">
      <p>抽屉正文</p>
      <template #footer>
        <button type="button" @click="drawer?.handleClose()">关闭</button>
      </template>
    </Drawer>
  </div>
</template>
