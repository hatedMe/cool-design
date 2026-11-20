<script setup lang="ts">
import { ref } from 'vue';
import { ColorPickerPanel } from '../../index';

const color = ref('#409eff');
</script>

<template>
  <ColorPickerPanel v-model="color" show-alpha :predefine="['#409eff', '#67c23a']" />
</template>
