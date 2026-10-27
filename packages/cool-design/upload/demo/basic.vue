<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '../../index';
const files = ref([]);
</script>
<template>
  <Upload v-model="files" accept=".png,.jpg" />
</template>
