<script setup lang="ts">
import { AutoResizer, TableV2 } from '../../index';

const columns = [{ key: 'name', dataKey: 'name', title: '名称', width: 180 }];
const data = [{ id: 1, name: '自动调整尺寸' }];
</script>

<template>
  <div style="height: 200px">
    <AutoResizer v-slot="{ width, height }">
      <TableV2 :columns="columns" :data="data" :width="width" :height="height" />
    </AutoResizer>
  </div>
</template>
