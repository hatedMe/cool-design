<script setup lang="ts">
import { ref } from 'vue';
import { TreeV2 } from '../../index';

const data = [
  {
    id: '1',
    label: '一级 1',
    children: [
      { id: '1-1', label: '二级 1-1', children: [{ id: '1-1-1', label: '三级 1-1-1' }] },
      { id: '1-2', label: '二级 1-2' }
    ]
  },
  { id: '2', label: '一级 2' }
];
const checked = ref<string[]>(['1-1-1']);

const onCheck = (_data: unknown, info: { checkedKeys: (string | number)[] }) => {
  checked.value = info.checkedKeys.map(String);
};
</script>

<template>
  <div>
    <TreeV2
      :data="data"
      show-checkbox
      :height="220"
      :default-expanded-keys="['1']"
      :default-checked-keys="['1-1-1']"
      style="max-width: 320px"
      @check="onCheck"
    />
    <p>已选：{{ checked.join('、') || '无' }}</p>
  </div>
</template>
