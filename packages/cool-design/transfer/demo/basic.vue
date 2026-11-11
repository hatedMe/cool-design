<script setup lang="ts">
import { ref } from 'vue';
import { Transfer } from '../../index';

const value = ref<(string | number)[]>([2]);
const data = [
  { key: 1, label: '选项一' },
  { key: 2, label: '选项二' },
  { key: 3, label: '选项三', disabled: true },
  { key: 4, label: '选项四' }
];

const customValue = ref<(string | number)[]>([1]);
const customData = [
  { id: 1, name: '北京' },
  { id: 2, name: '上海' },
  { id: 3, name: '广州' },
  { id: 4, name: '深圳' }
];
</script>

<template>
  <Transfer
    v-model="value"
    :data="data"
    filterable
    :titles="['左侧列表', '右侧列表']"
    :button-texts="['到左边', '到右边']"
    :format="{ noChecked: '共 ${total} 项', hasChecked: '已选 ${checked}/${total}' }"
  />
  <Transfer v-model="customValue" :data="customData" :props="{ key: 'id', label: 'name' }" target-order="push">
    <template #left-footer>
      <span>左侧底部</span>
    </template>
    <template #right-footer>
      <span>右侧底部</span>
    </template>
  </Transfer>
</template>
