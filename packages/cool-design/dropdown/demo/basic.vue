<script setup lang="ts">
import { Dropdown } from '../../index';
const items = [
  { command: 'edit', label: '编辑' },
  { command: 'delete', label: '删除' }
];
</script>
<template>
  <Dropdown :items="items" trigger="click">
    <button type="button">更多操作</button>
  </Dropdown>
</template>
