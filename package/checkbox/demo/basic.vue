<script setup lang="ts">
import { ref } from "vue";
import { Checkbox, Space } from "../../index";
const checked = ref(false);
</script>

<template>
  <Space direction="vertical" align="start" :size="16">
    <Checkbox v-model="checked">接收操作通知</Checkbox>
    <span role="status">{{ checked ? "已订阅通知" : "未订阅通知" }}</span>
    <Space :size="24">
      <Checkbox indeterminate>部分选中</Checkbox>
      <Checkbox disabled>禁用</Checkbox>
      <Checkbox :model-value="true" disabled>禁用且选中</Checkbox>
    </Space>
  </Space>
</template>
