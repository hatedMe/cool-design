<script setup lang="ts">
import { TreeV2 } from '../../index';

const data = Array.from({ length: 50 }, (_, index) => ({
  id: `node-${index + 1}`,
  label: `节点 ${index + 1}`,
  children: [
    { id: `node-${index + 1}-1`, label: `子节点 ${index + 1}-1` },
    { id: `node-${index + 1}-2`, label: `子节点 ${index + 1}-2` }
  ]
}));
</script>

<template>
  <TreeV2 :data="data" :height="240" style="max-width: 360px" />
</template>
