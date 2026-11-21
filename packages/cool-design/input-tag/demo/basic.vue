<script setup lang="ts">
import { ref } from 'vue';
import { InputTag } from '../../index';

const tags = ref<string[]>([]);
</script>

<template>
  <InputTag v-model="tags" placeholder="输入后回车创建标签" style="max-width: 420px" />
</template>
