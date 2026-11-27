<script setup lang="ts">
import { ref } from 'vue';
import { Select, SelectOption, Space } from '../../index';
const value = ref('enabled');
</script>
<template>
  <Space>
    <Select v-model="value" clearable>
      <SelectOption value="enabled" label="启用" />
      <SelectOption value="disabled" label="停用" disabled />
    </Select>
    <Select disabled model-value="enabled">
      <SelectOption value="enabled" label="启用" />
    </Select>
  </Space>
</template>
