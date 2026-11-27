<script setup lang="ts">
import { ref } from 'vue';
import { Button, Space, type ButtonInstance } from '../../index';

const label = ref('𠮷野');
const button = ref<ButtonInstance>();
</script>

<template>
  <Space>
    <Button ref="button" auto-insert-space>{{ label }}</Button>
    <Button @click="label = label === '𠮷野' ? '保存修改' : '𠮷野'">切换按钮文字</Button>
    <span>字间距{{ button?.shouldAddSpace ? '已启用' : '未启用' }}</span>
  </Space>
</template>
