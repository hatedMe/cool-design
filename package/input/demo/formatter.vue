<template>
  <Space direction="vertical" align="stretch">
    <Input v-model="amount" :formatter="formatAmount" :parser="parseAmount" placeholder="请输入金额" />
    <Input v-model="note" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" placeholder="自适应文本域" />
    <span>模型值：{{ amount }}</span>
  </Space>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Input, Space } from "../../index";
const amount = ref("1234");
const note = ref("");
const formatAmount = (value: string) => (value ? `¥ ${value}` : "");
const parseAmount = (value: string) => value.replace(/^¥\s*/, "");
</script>
