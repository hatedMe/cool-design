<script setup lang="ts">
import { ref } from 'vue';
import { RadioButton, RadioGroup, Space } from '../../index';
const value = ref('a');
</script>

<template>
  <Space direction="vertical" align="start">
    <RadioGroup v-model="value" name="kind">
      <RadioButton value="a">选项 A</RadioButton>
      <RadioButton value="b">选项 B</RadioButton>
      <RadioButton value="c" disabled>禁用选项</RadioButton>
    </RadioGroup>
    <span role="status">当前值：{{ value }}</span>
  </Space>
</template>
