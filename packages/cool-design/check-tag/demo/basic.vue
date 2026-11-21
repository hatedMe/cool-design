<template>
  <CheckTag v-model:checked="selected">已启用</CheckTag>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CheckTag } from '../../index';

const selected = ref(false);
</script>
