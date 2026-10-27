<script setup lang="ts">
import { ref } from "vue";
import { Button, Empty } from "../../index";
const reset = ref(false);
</script>

<template>
  <Empty :description="reset ? '筛选已重置，暂无记录' : '没有符合筛选条件的数据'">
    <Button type="primary" @click="reset = true">重置筛选</Button>
  </Empty>
</template>
