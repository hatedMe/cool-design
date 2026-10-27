<script setup lang="ts">
import { Card } from '../../index';
</script>
<template>
  <Card header="卡片标题">
    <p>卡片内容</p>
    <template #footer>底部操作</template>
  </Card>
</template>
