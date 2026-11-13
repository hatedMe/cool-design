<script setup lang="ts">
import { ref } from 'vue';
import { Radio, RadioGroup, Space } from '../../index';
const value = ref('a');
</script>

<template>
  <Space direction="vertical" align="start">
    <RadioGroup v-model="value" name="kind">
      <Radio value="a">选项 A</Radio>
      <Radio value="b">选项 B</Radio>
      <Radio value="c" disabled>禁用选项</Radio>
    </RadioGroup>
    <span role="status">当前值：{{ value }}</span>
  </Space>
</template>
