<script setup lang="ts">
import { ref } from 'vue';
import { Select, SelectOption, SelectOptionGroup } from '../../index';
const city = ref<string>();
</script>

<template>
  <Select v-model="city" clearable aria-label="城市" style="max-width: 360px">
    <SelectOptionGroup label="热门城市">
      <SelectOption value="shanghai" label="上海" />
      <SelectOption value="beijing" label="北京" />
    </SelectOptionGroup>
    <SelectOptionGroup label="其他城市">
      <SelectOption value="hangzhou" label="杭州" />
      <SelectOption value="chengdu" label="成都（不可选）" disabled />
    </SelectOptionGroup>
  </Select>
</template>
