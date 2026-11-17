<script setup lang="ts">
import { Scrollbar } from '../../index';
</script>

<template>
  <Scrollbar height="200px">
    <p v-for="n in 20" :key="n">内容 {{ n }}</p>
  </Scrollbar>
</template>
