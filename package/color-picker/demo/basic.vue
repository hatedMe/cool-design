<script setup lang="ts">import { ref } from "vue"; import { ColorPicker } from "../../index"; const color = ref("#409eff");</script>
<template><ColorPicker v-model="color" :predefine="['#409eff', '#67c23a', '#f56c6c']" /></template>
