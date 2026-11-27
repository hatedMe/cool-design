<script setup lang="ts">
import { Scrollbar } from '../../index';
</script>
<template><Scrollbar height="180px" mask role="list" aria-label="示例列表"><div v-for="n in 20" :key="n" role="listitem" style="padding: 10px">列表项 {{ n }}</div></Scrollbar></template>
