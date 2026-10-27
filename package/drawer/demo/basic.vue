<script setup lang="ts">
import { ref } from "vue";
import { Drawer } from "../../index";
const open = ref(false);
</script>
<template>
  <button type="button" @click="open = true">打开抽屉</button>
  <Drawer v-model="open" title="编辑内容">
    <p>抽屉正文</p>
  </Drawer>
</template>
