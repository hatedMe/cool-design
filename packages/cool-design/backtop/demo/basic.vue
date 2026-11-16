<script setup lang="ts">
import { Backtop } from '../../index';
</script>
<template>
  <div class="backtop-demo" style="height: 200px; overflow: auto; border: 1px solid #eee">
    <div style="height: 600px; padding: 12px">
      <p>向下滚动查看回到顶部按钮</p>
      <p v-for="i in 20" :key="i">内容 {{ i }}</p>
    </div>
    <Backtop target=".backtop-demo" :visibility-height="100" />
  </div>
</template>
