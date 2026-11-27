<script setup lang="ts">
import { TableV2 } from '../../index';
const columns = [{ key: 'name', dataKey: 'name', title: '名称', width: 600 }];
const data = [{ id: 1, name: '父节点', children: [{ id: 2, name: '子节点' }] }];
</script>
<template><TableV2 :columns="columns" :data="data" :default-expanded-row-keys="[1]" :max-height="240" :indent-size="24" :v-scrollbar-size="10" scrollbar-always-on /></template>
