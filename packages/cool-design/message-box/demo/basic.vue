<script setup lang="ts">
import { ref } from 'vue';
import { Button, Checkbox, MessageBox, Space } from '../../index';
const open = ref(false);
const simulateFailure = ref(false);
const result = ref('尚未执行操作');
async function beforeConfirm() {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (simulateFailure.value) throw new Error('删除失败，请取消模拟失败后重试');
}
</script>

<template>
  <Space direction="vertical" align="start" :size="16">
    <Checkbox v-model="simulateFailure">模拟请求失败</Checkbox>
    <Space>
      <Button type="danger" @click="open = true">删除用户</Button>
      <span role="status">{{ result }}</span>
    </Space>
  </Space>
  <MessageBox
    v-model="open"
    title="删除确认"
    message="删除后无法恢复，确定继续吗？"
    :before-confirm="beforeConfirm"
    @confirm="result = '用户已删除'"
    @cancel="result = '已取消删除'">
    <p>删除后无法恢复，确定继续吗？</p>
    <Checkbox v-model="simulateFailure">模拟请求失败（失败后可取消并重试）</Checkbox>
  </MessageBox>
</template>
